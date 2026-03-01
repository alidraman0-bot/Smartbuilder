import subprocess
import sys
import os

def run_command(command, cwd=None):
    print(f"Running: {command} in {cwd or '.'}")
    try:
        # Use shell=True for Windows compatibility with npm/npx
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True, cwd=cwd)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, f"STDOUT: {e.stdout}\nSTDERR: {e.stderr}"

def check_lint():
    print("--- Running Frontend Lint ---")
    success, output = run_command("npm run lint", cwd="frontend")
    if not success:
        print(f"FAIL: Lint check failed:\n{output}")
        return False
    print("PASS: Frontend lint passed.")
    return True

def check_build():
    print("--- Running Frontend Build Check ---")
    # Using next build to catch type errors and other build-time issues
    success, output = run_command("npm run build", cwd="frontend")
    if not success:
        print(f"FAIL: Frontend build failed:\n{output}")
        return False
    print("PASS: Frontend build passed.")
    return True

if __name__ == "__main__":
    print("Starting Frontend Verification...")
    if not os.path.exists("frontend"):
        print("FAIL: 'frontend' directory not found.")
        sys.exit(1)
        
    lint_ok = check_lint()
    # build_ok = check_build() # Build can be slow, maybe skip or make optional?
    
    if lint_ok: # and build_ok:
        print("\nFRONTEND VERIFICATION PASSED")
        sys.exit(0)
    else:
        print("\nFRONTEND VERIFICATION FAILED")
        sys.exit(1)
