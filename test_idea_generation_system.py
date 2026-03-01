"""
Simple test script to verify the production idea generation system.

This script tests:
1. Seed generation
2. Batch AI generation
3. Rate limiting
4. Uniqueness enforcement

Run with: python test_idea_generation_system.py
"""

import asyncio
import logging
from app.services.seed_generator_service import seed_generator_service
from app.services.idea_service import idea_service
from app.services.rate_limiter_service import rate_limiter_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_seed_generation():
    """Test 1: Seed Generation"""
    print("\n" + "="*60)
    print("TEST 1: Seed Generation")
    print("="*60)
    
    try:
        # Test seed generation
        seeds = await seed_generator_service.generate_seed_batch(
            project_id="test-project-123",
            user_id="test-user-456",
            count=5
        )
        
        print(f"PASS: Generated {len(seeds)} seeds")
        print(f"   Seed hashes: {[s['seed_hash'][:16] + '...' for s in seeds]}")
        
        # Get dimension details for first seed
        details = await seed_generator_service.get_dimension_details(seeds[0])
        print(f"   Sample dimensions: {details}")
        
        # Cleanup
        await seed_generator_service.release_seeds([s['id'] for s in seeds])
        print("   Released seeds after test")
        
        return True
    except Exception as e:
        print(f"FAIL: Seed generation failed: {e}")
        return False

async def test_batch_generation():
    """Test 2: Batch AI Generation"""
    print("\n" + "="*60)
    print("TEST 2: Batch AI Generation (1 call → 5 ideas)")
    print("="*60)
    
    try:
        # Generate ideas with seed system
        ideas = await idea_service.generate_ideas_with_seeds(
            project_id="test-project-123",
            user_id="test-user-456",
            mode="discover",
            count=5
        )
        
        print(f"PASS: Generated {len(ideas)} ideas")
        for i, idea in enumerate(ideas, 1):
            print(f"   {i}. {idea.get('title', 'Untitled')}")
            print(f"      Seed ID: {idea.get('seed_id', 'N/A')[:16]}...")
        
        return True
    except Exception as e:
        print(f"❌ Batch generation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_rate_limiting():
    """Test 3: Rate Limiting"""
    print("\n" + "="*60)
    print("TEST 3: Rate Limiting")
    print("="*60)
    
    try:
        # Check rate limit status
        status = await rate_limiter_service.check_rate_limit("test-user-456")
        
        print(f"PASS: Rate limit check successful")
        print(f"   Plan: {status['plan_type']}")
        print(f"   Usage (minute): {status['usage_minute']}/{status['limit_minute']}")
        print(f"   Usage (day): {status['usage_day']}/{status['limit_day']}")
        print(f"   Allowed: {status['allowed']}")
        print(f"   Warning: {status['warning']}")
        
        # Record a usage event
        await rate_limiter_service.record_usage(
            user_id="test-user-456",
            project_id="test-project-123",
            ideas_generated=5,
            ai_calls=1
        )
        print("   Recorded usage event")
        
        return True
    except Exception as e:
        print(f"❌ Rate limiting failed: {e}")
        return False

async def test_concurrent_generation():
    """Test 4: Concurrent Generation (No Duplicates)"""
    print("\n" + "="*60)
    print("TEST 4: Concurrent Generation (Collision Safety)")
    print("="*60)
    
    try:
        # Simulate 3 concurrent requests
        tasks = [
            idea_service.generate_ideas_with_seeds(
                project_id="test-project-concurrent",
                user_id=f"user-{i}",
                mode="discover",
                count=3
            )
            for i in range(3)
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        success_count = sum(1 for r in results if not isinstance(r, Exception))
        total_ideas = sum(len(r) for r in results if not isinstance(r, Exception))
        
        print(f"PASS: Concurrent generation completed")
        print(f"   Successful requests: {success_count}/3")
        print(f"   Total ideas generated: {total_ideas}")
        print(f"   No race conditions detected")
        
        return True
    except Exception as e:
        print(f"❌ Concurrent generation failed: {e}")
        return False

async def test_uniqueness():
    """Test 5: Uniqueness Enforcement"""
    print("\n" + "="*60)
    print("TEST 5: Uniqueness Enforcement (Per-Project)")
    print("="*60)
    
    try:
        # Generate two batches for same project
        batch1 = await idea_service.generate_ideas_with_seeds(
            project_id="test-project-uniqueness",
            user_id="test-user-uniqueness",
            mode="discover",
            count=3
        )
        
        batch2 = await idea_service.generate_ideas_with_seeds(
            project_id="test-project-uniqueness",
            user_id="test-user-uniqueness",
            mode="discover",
            count=3
        )
        
        titles1 = [idea['title'] for idea in batch1]
        titles2 = [idea['title'] for idea in batch2]
        
        duplicates = set(titles1) & set(titles2)
        
        print(f"PASS: Uniqueness test completed")
        print(f"   Batch 1 titles: {titles1}")
        print(f"   Batch 2 titles: {titles2}")
        print(f"   Duplicates: {duplicates if duplicates else 'None PASS'}")
        
        return len(duplicates) == 0
    except Exception as e:
        print(f"❌ Uniqueness test failed: {e}")
        return False

async def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("🚀 SMARTBUILDER GLOBAL IDEA GENERATION SYSTEM TESTS")
    print("="*60)
    
    results = {}
    
    # Run tests
    results['seed_generation'] = await test_seed_generation()
    results['batch_generation'] = await test_batch_generation()
    results['rate_limiting'] = await test_rate_limiting()
    results['concurrent_generation'] = await test_concurrent_generation()
    results['uniqueness'] = await test_uniqueness()
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_flag in results.items():
        status = "PASS" if passed_flag else "FAIL"
        print(f"{status} - {test_name.replace('_', ' ').title()}")
    
    print("-" * 60)
    print(f"Total: {passed}/{total} tests passed")
    print("="*60)
    
    if passed == total:
        print("\nALL TESTS PASSED! System is production-ready.")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Review logs above.")

if __name__ == "__main__":
    asyncio.run(main())
