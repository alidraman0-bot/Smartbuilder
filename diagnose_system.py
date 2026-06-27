import os
import requests
import sys
import socket
from dotenv import load_dotenv

def check_env():
    print("--- 1. Environment Variables ---")
    load_dotenv(os.path.join("frontend", ".env.local"))
    load_dotenv() # Fallback to root .env
    vars_to_check = [
        "NEXT_PUBLIC_BACKEND_URL",
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_URL",
        "SUPABASE_KEY"
    ]
    all_ok = True
    for var in vars_to_check:
        val = os.getenv(var)
        if val:
            print(f"✅ {var}: [PRESENT]")
        else:
            print(f"❌ {var}: [MISSING]")
            all_ok = False
    return all_ok

def check_port(host, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(2)
        return s.connect_ex((host, port)) == 0

def check_connectivity():
    print("\n--- 2. Connectivity ---")
    backend_url = os.getenv("NEXT_PUBLIC_BACKEND_URL", "http://127.0.0.1:8000")
    print(f"Target Backend: {backend_url}")
    
    # Check if port is open
    try:
        host = backend_url.split("//")[-1].split(":")[0]
        port = int(backend_url.split(":")[-1])
        if check_port(host, port):
            print(f"✅ Port {port} is OPEN on {host}")
        else:
            print(f"❌ Port {port} is CLOSED on {host}")
            return False
    except Exception as e:
        print(f"⚠️ Could not parse backend URL: {e}")
        return False
    
    endpoints = ["/", "/api/v1/health/status", "/api/v1/health/ping", "/api/v1/billing/ping"]
    for ep in endpoints:
        url = f"{backend_url.rstrip('/')}{ep}"
        try:
            resp = requests.get(url, timeout=5)
            print(f"✅ {ep}: HTTP {resp.status_code}")
        except Exception as e:
            print(f"❌ {ep}: Connection Failed ({e})")
            return False
    return True

def check_supabase():
    print("\n--- 3. Supabase Connection ---")
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        print("❌ Supabase credentials missing in env")
        return False
        
    try:
        # Simple health check to Supabase REST API
        resp = requests.get(f"{url}/rest/v1/", headers={"apikey": key, "Authorization": f"Bearer {key}"}, timeout=5)
        if resp.status_code in [200, 204]:
            print("✅ Supabase REST API: OK")
        else:
            print(f"❌ Supabase REST API: HTTP {resp.status_code}")
            return False
    except Exception as e:
        print(f"❌ Supabase Connection Failed: {e}")
        return False
    return True

if __name__ == "__main__":
    print("🚀 SMARTBUILDER SYSTEM DIAGNOSTICS")
    env_ok = check_env()
    conn_ok = check_connectivity()
    sb_ok = check_supabase()
    
    print("\n--- Summary ---")
    if env_ok and conn_ok and sb_ok:
        print("🎉 ALL SYSTEMS GO")
        sys.exit(0)
    else:
        print("🛑 DIAGNOSTIC FAILURES DETECTED")
        sys.exit(1)
