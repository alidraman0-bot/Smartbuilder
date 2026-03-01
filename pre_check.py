import subprocess
import sys

def run_verification(script_name):
    print(f"\n========================================")
    print(f"RUNNING {script_name.upper()}...")
    print(f"========================================\n")
    try:
        subprocess.run([sys.executable, script_name], check=True)
        return True
    except subprocess.CalledProcessError:
        return False

if __name__ == "__main__":
    print("STARTER MASTER PRE-CHECK")
    
    backend_ok = run_verification("verify_backend.py")
    frontend_ok = run_verification("verify_frontend.py")
    
    if backend_ok and frontend_ok:
        print("\nSYSTEM IS STABLE - READY TO PROCEED")
        sys.exit(0)
    else:
        print("\nSYSTEM HAS ERRORS - FIX REQUIRED")
        if not backend_ok:
            print("  - Backend verification failed.")
        if not frontend_ok:
            print("  - Frontend verification failed.")
        sys.exit(1)
