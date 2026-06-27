import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Try reading debug.log as utf-8 (ignoring bad bytes)
try:
    with open("debug.log", "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()
        print(f"Read {len(lines)} lines from debug.log")
        for line in lines[-100:]:
            print(line.strip())
except Exception as e:
    print(f"Error: {e}")
