import sys
import os

# Add the current directory to sys.path
sys.path.append(os.getcwd())

try:
    from app.main import app
    print("Routes registered in FastAPI:")
    for route in app.routes:
        if hasattr(route, "path"):
            path = str(getattr(route, "path"))
            methods = str(getattr(route, "methods", "GET"))
            print(f"{methods} {path}")
except Exception as e:
    print(f"Error listing routes: {e}")
