
import sys
import os
import time

def log(msg):
    print(msg, flush=True)

log("Starting import test...")
start_time = time.time()

try:
    os.environ["AI_PROVIDER"] = "mock"
    
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    sys.path.append(project_root)
    log(f"Project root added to path: {project_root}")
    
    log("Importing app.core.config...")
    from app.core.config import settings
    
    log("Importing app.api.v1.billing_api...")
    import app.api.v1.billing_api
    
    log("Importing app.api.v1.mvp_builder...")
    import app.api.v1.mvp_builder
    
    log("Importing app.api.v1.ideas_api...")
    import app.api.v1.ideas_api
    
    log("Importing app.api.v1.startup_api...")
    import app.api.v1.startup_api
    
    log("Importing app.api.v1.projects_api...")
    import app.api.v1.projects_api
    
    log("Importing app.api.v1.market_signals_api...")
    import app.api.v1.market_signals_api
    
    log("Importing backend.api.v1.mvp...")
    import backend.api.v1.mvp
    
    log("Importing backend.api.v1.endpoints.research...")
    import backend.api.v1.endpoints.research
    
    log("Importing backend.main...")
    import backend.main
    
    log(f"Import successful in {time.time() - start_time:.2f} seconds!")
    
except Exception as e:
    log(f"Import failed: {e}")
    import traceback
    traceback.print_exc()
