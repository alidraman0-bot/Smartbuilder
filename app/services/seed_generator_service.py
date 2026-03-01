import uuid
import hashlib
import secrets
import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from app.core.supabase import get_service_client
import asyncio

logger = logging.getLogger(__name__)

class SeedGeneratorService:
    """
    Generates cryptographically unique, dimension-based seeds for idea generation.
    
    Seed generation strategy:
    - Sample dimensions from pre-loaded tables
    - Combine with crypto entropy + timestamp bucket
    - Hash to create unique seed identifier
    - Reserve atomically in database
    - Return seeds for AI generation
    
    Uniqueness guarantees:
    - No duplicate seeds within same project
    - No duplicate seeds for same user
    - Collision detection with automatic retry
    """
    
    def __init__(self):
        self.client = get_service_client()
        self._dimension_cache: Dict[str, List[Dict[str, Any]]] = {}
        self._cache_loaded = False
        logger.info("SeedGeneratorService initialized")
    
    async def _load_dimensions_cache(self):
        """Load all dimension tables into memory for fast sampling."""
        if self._cache_loaded:
            return
        
        try:
            logger.info("Loading dimension tables into cache...")
            
            dimension_tables = [
                'idea_dimensions_geography',
                'idea_dimensions_industry',
                'idea_dimensions_problem',
                'idea_dimensions_persona',
                'idea_dimensions_constraint',
                'idea_dimensions_technology',
                'idea_dimensions_business_model'
            ]
            
            for table in dimension_tables:
                try:
                    response = self.client.table(table).select("*").execute()
                    self._dimension_cache[table] = response.data if response.data else []
                    logger.info(f"Loaded {len(self._dimension_cache[table])} entries from {table}")
                except Exception as e:
                    logger.warning(f"Failed to load {table}: {e}. Using empty list.")
                    self._dimension_cache[table] = []
            
            self._cache_loaded = True
            logger.info("Dimension cache loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load dimension cache: {e}")
            # Use empty cache rather than failing
            self._cache_loaded = True
    
    def _get_timestamp_bucket(self, window_seconds: int = 5) -> datetime:
        """
        Get current timestamp rounded to window_seconds bucket.
        This provides determinism while maintaining freshness.
        """
        now = datetime.utcnow()
        seconds_since_epoch = int(now.timestamp())
        bucket_seconds = (seconds_since_epoch // window_seconds) * window_seconds
        return datetime.utcfromtimestamp(bucket_seconds)
    
    def _sample_dimension(self, dimension_table: str) -> Optional[int]:
        """Randomly sample an ID from a dimension table."""
        dimensions = self._dimension_cache.get(dimension_table, [])
        if not dimensions:
            return None
        
        import random
        selected = random.choice(dimensions)
        return selected.get('id')
    
    def _generate_seed_hash(
        self,
        project_id: str,
        user_id: Optional[str],
        dimension_vector: Dict[str, int],
        crypto_entropy: str,
        timestamp_bucket: datetime
    ) -> str:
        """
        Generate unique seed hash from all components.
        
        Formula: hash(project + user + timestamp + entropy + dimensions)
        """
        components = [
            str(project_id),
            str(user_id) if user_id else "anonymous",
            timestamp_bucket.isoformat(),
            crypto_entropy,
            str(dimension_vector.get('geography_id', '')),
            str(dimension_vector.get('industry_id', '')),
            str(dimension_vector.get('problem_id', '')),
            str(dimension_vector.get('persona_id', '')),
            str(dimension_vector.get('constraint_id', '')),
            str(dimension_vector.get('technology_id', '')),
            str(dimension_vector.get('business_model_id', ''))
        ]
        
        combined = "|".join(components)
        return hashlib.sha256(combined.encode()).hexdigest()
    
    async def _check_seed_collision(self, project_id: str, seed_hash: str) -> bool:
        """Check if seed already exists for this project."""
        try:
            response = self.client.table("idea_seeds")\
                .select("id")\
                .eq("project_id", project_id)\
                .eq("seed_hash", seed_hash)\
                .limit(1)\
                .execute()
            
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            logger.error(f"Error checking seed collision: {e}")
            return False
    
    async def generate_seed_batch(
        self,
        project_id: str,
        user_id: Optional[str] = None,
        count: int = 5,
        max_retries: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Generate and atomically reserve a batch of unique seeds.
        
        Returns list of seed objects with:
        - id: UUID of reserved seed
        - seed_hash: Unique hash
        - dimension_vector: Sampled dimensions
        - timestamp_bucket: Time bucket for this seed
        
        Raises:
        - Exception if unable to generate unique seeds after retries
        """
        await self._load_dimensions_cache()
        
        seeds_to_insert = []
        timestamp_bucket = self._get_timestamp_bucket()
        
        for retry in range(max_retries):
            seeds_to_insert = []
            
            for i in range(count):
                # Generate crypto entropy
                crypto_entropy = secrets.token_hex(16)
                
                # Sample dimensions
                dimension_vector = {
                    'geography_id': self._sample_dimension('idea_dimensions_geography'),
                    'industry_id': self._sample_dimension('idea_dimensions_industry'),
                    'problem_id': self._sample_dimension('idea_dimensions_problem'),
                    'persona_id': self._sample_dimension('idea_dimensions_persona'),
                    'constraint_id': self._sample_dimension('idea_dimensions_constraint'),
                    'technology_id': self._sample_dimension('idea_dimensions_technology'),
                    'business_model_id': self._sample_dimension('idea_dimensions_business_model')
                }
                
                # Generate seed hash
                seed_hash = self._generate_seed_hash(
                    project_id=project_id,
                    user_id=user_id,
                    dimension_vector=dimension_vector,
                    crypto_entropy=crypto_entropy,
                    timestamp_bucket=timestamp_bucket
                )
                
                # Check for collision
                collision = await self._check_seed_collision(project_id, seed_hash)
                if collision:
                    logger.warning(f"Seed collision detected for hash {seed_hash[:8]}... (retry {retry+1}/{max_retries})")
                    break  # Break inner loop, retry outer loop
                
                # Prepare seed for insertion
                seed_data = {
                    'id': str(uuid.uuid4()),
                    'project_id': project_id,
                    'user_id': user_id,
                    'seed_hash': seed_hash,
                    'crypto_entropy': crypto_entropy,
                    'timestamp_bucket': timestamp_bucket.isoformat(),
                    'status': 'reserved',
                    **dimension_vector
                }
                
                seeds_to_insert.append(seed_data)
            
            # If we successfully generated all seeds without collision, break
            if len(seeds_to_insert) == count:
                break
            
            # Otherwise, retry with new timestamp bucket
            timestamp_bucket = self._get_timestamp_bucket()
            await asyncio.sleep(0.1)  # Small delay before retry
        
        if len(seeds_to_insert) != count:
            raise Exception(f"Failed to generate {count} unique seeds after {max_retries} retries")
        
        # Atomic insertion using transaction
        try:
            # Insert all seeds in single transaction
            response = self.client.table("idea_seeds").insert(seeds_to_insert).execute()
            
            if not response.data:
                raise Exception("Seed reservation failed: No data returned from insert")
            
            reserved_seeds = response.data
            logger.info(f"Reserved {len(reserved_seeds)} seeds for project {project_id[:8]}...")
            
            return reserved_seeds
            
        except Exception as e:
            logger.error(f"Failed to reserve seeds: {e}")
            raise Exception(f"Seed reservation failed: {str(e)}")
    
    async def mark_seeds_as_used(self, seed_ids: List[str]):
        """Mark seeds as 'used' after successful idea generation."""
        try:
            for seed_id in seed_ids:
                self.client.table("idea_seeds")\
                    .update({
                        'status': 'used',
                        'used_at': datetime.utcnow().isoformat()
                    })\
                    .eq('id', seed_id)\
                    .execute()
            
            logger.info(f"Marked {len(seed_ids)} seeds as used")
        except Exception as e:
            logger.error(f"Failed to mark seeds as used: {e}")
    
    async def release_seeds(self, seed_ids: List[str]):
        """Release seeds back to pool (on AI generation failure)."""
        try:
            for seed_id in seed_ids:
                self.client.table("idea_seeds")\
                    .update({'status': 'released'})\
                    .eq('id', seed_id)\
                    .execute()
            
            logger.info(f"Released {len(seed_ids)} seeds back to pool")
        except Exception as e:
            logger.error(f"Failed to release seeds: {e}")
    
    async def get_dimension_details(self, seed: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get human-readable dimension details for a seed.
        Used to construct AI prompts with diversity constraints.
        """
        details = {}
        
        dimension_mappings = {
            'geography_id': 'idea_dimensions_geography',
            'industry_id': 'idea_dimensions_industry',
            'problem_id': 'idea_dimensions_problem',
            'persona_id': 'idea_dimensions_persona',
            'constraint_id': 'idea_dimensions_constraint',
            'technology_id': 'idea_dimensions_technology',
            'business_model_id': 'idea_dimensions_business_model'
        }
        
        for key, table in dimension_mappings.items():
            dimension_id = seed.get(key)
            if dimension_id and table in self._dimension_cache:
                # Find the dimension by ID
                dimension = next(
                    (d for d in self._dimension_cache[table] if d['id'] == dimension_id),
                    None
                )
                if dimension:
                    details[key.replace('_id', '')] = dimension.get('name', 'Unknown')
        
        return details
    
    async def cleanup_expired_seeds(self):
        """
        Cleanup job: Release seeds that have been reserved for >5 minutes.
        This prevents seed exhaustion if generation fails without cleanup.
        Should be run as a periodic background job.
        """
        try:
            # Call the database function
            cutoff_time = datetime.utcnow() - timedelta(minutes=5)
            
            response = self.client.table("idea_seeds")\
                .update({'status': 'released'})\
                .eq('status', 'reserved')\
                .lt('reserved_at', cutoff_time.isoformat())\
                .execute()
            
            if response.data:
                logger.info(f"Cleaned up {len(response.data)} expired seeds")
            
        except Exception as e:
            logger.error(f"Failed to cleanup expired seeds: {e}")


# Global singleton instance
seed_generator_service = SeedGeneratorService()
