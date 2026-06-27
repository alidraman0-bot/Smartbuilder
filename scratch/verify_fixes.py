
try:
    from app.core.config import settings
    print("Config imported successfully")
    from app.models.schemas import ViabilityScore
    print("Schemas imported successfully")
    import supabase
    print("Supabase imported successfully")
    import pydantic_settings
    print("Pydantic Settings imported successfully")
    print("All good!")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
