import sys
import os
import logging

# Add current dir to sys.path
sys.path.append(os.getcwd())

# Configure logging to stdout
logging.basicConfig(level=logging.INFO)

try:
    from app.services.billing_service import billing_service
    from app.core.config import settings
    
    print(f"Supabase URL: {settings.SUPABASE_URL}")
    print(f"Service Role Key set: {bool(settings.SUPABASE_SERVICE_ROLE_KEY)}")
    
    # Use a dummy but valid looking UUID or a real one if available
    # For now, let's just try to initialize and check if we can reach the table
    test_user_id = "00000000-0000-0000-0000-000000000000"
    
    print("\nProbing org_members table...")
    res = billing_service.supabase_service.table("org_members")\
        .select("*")\
        .eq("user_id", test_user_id)\
        .limit(1)\
        .execute()
    print(f"Query success! Data: {res.data}")
    
    print("\nAttempting ensure_default_organization...")
    org_id = billing_service.ensure_default_organization(
        user_id=test_user_id,
        email="probe@test.com",
        full_name="Probe Test"
    )
    print(f"\nResult: {org_id}")
    
except Exception as e:
    print(f"\nCRITICAL ERROR: {e}")
    import traceback
    traceback.print_exc()
