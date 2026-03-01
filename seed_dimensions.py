import asyncio
import os
import logging
from typing import List, Dict, Any
from app.core.supabase import get_service_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_dimensions():
    client = get_service_client()
    
    # 1. Geographies
    geographies = [
        {'name': 'United States', 'region': 'North America', 'market_tier': 'tier_1'},
        {'name': 'United Kingdom', 'region': 'Europe', 'market_tier': 'tier_1'},
        {'name': 'Germany', 'region': 'Europe', 'market_tier': 'tier_1'},
        {'name': 'Nigeria', 'region': 'Africa', 'market_tier': 'tier_2'},
        {'name': 'India', 'region': 'South Asia', 'market_tier': 'tier_2'},
        {'name': 'Brazil', 'region': 'South America', 'market_tier': 'tier_2'},
        {'name': 'Singapore', 'region': 'Southeast Asia', 'market_tier': 'tier_1'},
        {'name': 'Kenya', 'region': 'Africa', 'market_tier': 'tier_2'},
        {'name': 'Canada', 'region': 'North America', 'market_tier': 'tier_1'},
        {'name': 'Australia', 'region': 'Oceania', 'market_tier': 'tier_1'},
        {'name': 'Japan', 'region': 'East Asia', 'market_tier': 'tier_1'},
        {'name': 'South Korea', 'region': 'East Asia', 'market_tier': 'tier_1'},
        {'name': 'France', 'region': 'Europe', 'market_tier': 'tier_1'},
        {'name': 'UAE', 'region': 'Middle East', 'market_tier': 'tier_1'},
        {'name': 'Mexico', 'region': 'North America', 'market_tier': 'tier_2'}
    ]
    
    # 2. Industries
    industries = [
        {'name': 'Healthcare', 'category': 'B2B'},
        {'name': 'Education Technology', 'category': 'B2B/B2C'},
        {'name': 'Fintech', 'category': 'B2B/B2C'},
        {'name': 'Logistics & Supply Chain', 'category': 'B2B'},
        {'name': 'Real Estate', 'category': 'B2B/B2C'},
        {'name': 'Legal Tech', 'category': 'B2B'},
        {'name': 'HR Tech', 'category': 'B2B'},
        {'name': 'Marketing & Sales Tools', 'category': 'B2B'},
        {'name': 'Developer Tools', 'category': 'B2B'},
        {'name': 'Cybersecurity', 'category': 'B2B'},
        {'name': 'E-commerce Enablement', 'category': 'B2B'},
        {'name': 'Food & Beverage', 'category': 'B2C'},
        {'name': 'Wellness & Fitness', 'category': 'B2C'},
        {'name': 'Gaming & Entertainment', 'category': 'B2C'},
        {'name': 'Climate Tech', 'category': 'B2B/B2C'}
    ]
    
    # 3. Problems
    problems = [
        {'name': 'Manual Process Inefficiency', 'description': 'Tasks that are done manually and could be automated'},
        {'name': 'Information Asymmetry', 'description': 'One party has more information than another'},
        {'name': 'High Transaction Costs', 'description': 'Expensive intermediary or friction in transactions'},
        {'name': 'Coordination Failure', 'description': 'Multiple parties fail to coordinate effectively'},
        {'name': 'Trust Deficit', 'description': 'Lack of trust between parties'},
        {'name': 'Discovery Problem', 'description': 'Hard to find the right solution/product/service'},
        {'name': 'Quality Assurance Gap', 'description': 'No way to verify quality or authenticity'},
        {'name': 'Time Waste', 'description': 'Excessive time spent on low-value activities'},
        {'name': 'Access Barrier', 'description': 'Underserved population can\'t access solution'},
        {'name': 'Complexity Overload', 'description': 'Existing solutions are too complex'}
    ]
    
    # 4. Personas
    personas = [
        {'name': 'Small Business Owner', 'description': '1-50 employees, budget-conscious'},
        {'name': 'Enterprise IT Manager', 'description': 'Large org, security-focused'},
        {'name': 'Freelancer / Solopreneur', 'description': 'Individual, time-constrained'},
        {'name': 'Mid-market Operations Lead', 'description': '50-500 employees, efficiency-focused'},
        {'name': 'Consumer (Gen Z)', 'description': 'Digital native, mobile-first'},
        {'name': 'Consumer (Millennial)', 'description': 'Tech-savvy, value-conscious'},
        {'name': 'Consumer (Boomer)', 'description': 'Less tech-savvy, trust-focused'},
        {'name': 'Developer / Engineer', 'description': 'Technical, tool-driven'},
        {'name': 'Marketing Professional', 'description': 'Growth-focused, data-driven'},
        {'name': 'Healthcare Provider', 'description': 'Compliance-focused, patient-centric'}
    ]
    
    # 5. Constraints
    constraints = [
        {'name': 'Low Upfront Capital', 'description': 'Can be built with minimal funding'},
        {'name': 'Must be Regulatory Compliant', 'description': 'Heavy compliance requirements'},
        {'name': 'Network Effects Required', 'description': 'Value increases with more users'},
        {'name': 'Asset-Light Model', 'description': 'No physical inventory or assets'},
        {'name': 'Fast Time-to-Market', 'description': 'Can MVP in under 30 days'},
        {'name': 'Data Privacy Critical', 'description': 'Must handle sensitive data'},
        {'name': 'High Switching Costs', 'description': 'Sticky once adopted'},
        {'name': 'Platform Play', 'description': 'Multi-sided marketplace'},
        {'name': 'API-First', 'description': 'Designed for integration'},
        {'name': 'Mobile-Only', 'description': 'No desktop version needed'}
    ]
    
    # 6. Technologies
    technologies = [
        {'name': 'AI/ML (LLMs)', 'category': 'AI/ML'},
        {'name': 'AI/ML (Computer Vision)', 'category': 'AI/ML'},
        {'name': 'Blockchain / Web3', 'category': 'Blockchain'},
        {'name': 'No-Code / Low-Code', 'category': 'Developer Tools'},
        {'name': 'API Aggregation', 'category': 'Integration'},
        {'name': 'IoT Sensors', 'category': 'Hardware'},
        {'name': 'Edge Computing', 'category': 'Infrastructure'},
        {'name': 'Progressive Web App', 'category': 'Frontend'},
        {'name': 'Serverless Architecture', 'category': 'Backend'},
        {'name': 'Real-time Collaboration', 'category': 'Product'}
    ]
    
    # 7. Business Models
    business_models = [
        {'name': 'SaaS (Per Seat)', 'description': 'Monthly subscription per user'},
        {'name': 'Usage-Based Pricing', 'description': 'Pay for what you use'},
        {'name': 'Freemium', 'description': 'Free tier + paid upgrades'},
        {'name': 'Marketplace (Take Rate)', 'description': 'Commission on transactions'},
        {'name': 'Enterprise Licensing', 'description': 'Annual contracts with custom pricing'},
        {'name': 'Advertising', 'description': 'Free product, ad-supported'},
        {'name': 'Affiliate / Referral', 'description': 'Commission on referrals'},
        {'name': 'One-Time Purchase', 'description': 'Upfront payment, lifetime access'},
        {'name': 'Subscription Box', 'description': 'Recurring physical product delivery'},
        {'name': 'Professional Services', 'description': 'Consulting or implementation fees'}
    ]

    seeding_map = {
        'idea_dimensions_geography': geographies,
        'idea_dimensions_industry': industries,
        'idea_dimensions_problem': problems,
        'idea_dimensions_persona': personas,
        'idea_dimensions_constraint': constraints,
        'idea_dimensions_technology': technologies,
        'idea_dimensions_business_model': business_models
    }

    for table, data in seeding_map.items():
        logger.info(f"Seeding table {table} with {len(data)} rows...")
        try:
            # Using upsert (if possible) or just insert with onConflict
            # But the library might vary. Let's try simple insert first.
            res = client.table(table).upsert(data, on_conflict='name').execute()
            if res.data:
                 logger.info(f"Successfully seeded {table}")
            else:
                 logger.warning(f"No data returned for {table}")
        except Exception as e:
            logger.error(f"Failed to seed {table}: {e}")

if __name__ == '__main__':
    asyncio.run(seed_dimensions())
