import os
import subprocess
import sys
import py_compile
from glob import glob

def run_command(command, cwd=None):
    print(f"Running: {command}")
    try:
        result = subprocess.run(command, shell=True, check=False, capture_output=True, text=True, cwd=cwd)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_syntax():
    print("--- Checking Python Syntax ---")
    errors = []
    for root, dirs, files in os.walk("app"):
        for file in files:
            if file.endswith(".py"):
                path = os.path.join(root, file)
                try:
                    py_compile.compile(path, doraise=True)
                except py_compile.PyCompileError as e:
                    errors.append(f"Syntax error in {path}: {e}")
    
    if errors:
        for err in errors:
            print(err)
        return False
    print("All Python files passed syntax check.")
    return True

def check_backend_alive():
    print("--- Checking if Backend is Alive ---")
    # Using existing check_backend.py if available, or simple curl
    success, stdout, stderr = run_command("python check_backend.py")
    if not success:
        print(f"FAIL: Backend check failed: {stdout} {stderr}")
        return False
    print(f"PASS: Backend check passed: {stdout.strip()}")
    return True

def run_tests():
    print("--- Running Backend Tests ---")
    test_files = [
        "test_api.py", 
        "test_conversion_logic.py", 
        "test_currency.py", 
        "test_ideas_api.py",
        "test_idea_api.py",
        "test_idea_seeds_table.py",
        "test_idea_service.py",
        "test_live_api.py",
        "test_paystack.py",
        "test_supabase_connection.py"
    ]
    all_passed = True
    for test in test_files:
        if not os.path.exists(test):
            continue
        print(f"Testing {test}...")
        success, stdout, stderr = run_command(f"python {test}")
        if not success:
            print(f"FAIL: Test {test} failed.")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            all_passed = False
        else:
            print(f"PASS: {test} passed.")
    return all_passed

if __name__ == "__main__":
    print("Starting Backend Verification...")
    syntax_ok = check_syntax()
    alive_ok = check_backend_alive()
    tests_ok = run_tests()
    
    if syntax_ok and alive_ok and tests_ok:
        print("\nBACKEND VERIFICATION PASSED")
        sys.exit(0)
    else:
        print("\nBACKEND VERIFICATION FAILED")
        sys.exit(1)
