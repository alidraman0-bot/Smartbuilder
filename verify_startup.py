import sys
import os

# Add current directory to python path
sys.path.append(os.getcwd())

print("Attempting to import app.main...")
try:
    from app.main import app
    print("SUCCESS: app.main imported successfully.")
except Exception as e:
    print("FAILURE: Could not import app.main")
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
