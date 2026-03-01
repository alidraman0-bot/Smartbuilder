import sys
import os
import requests
import json

# Add current dir to sys.path
sys.path.append(os.getcwd())

from app.core.config import settings
from app.services.paystack_service import paystack_service

def probe():
    print(f"Testing Paystack Initialization...")
    print(f"Secret Key first 8 chars: {settings.PAYSTACK_SECRET_KEY[:8]}...")
    
    email = "test@example.com"
    amount = 2900 # $29 or 2900 kobo
    plan = "starter"
    org_id = "test-org-123"
    
    try:
        url = f"{paystack_service.BASE_URL}/transaction/initialize"
        payload = {
            "email": email,
            "amount": 100000, # 1000 units
            "metadata": {
                "org_id": org_id,
                "plan": plan
            }
        }
        
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        
        print(f"Payload (no currency): {json.dumps(payload, indent=2)}")
        
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # If it returns success, we know the default currency
        if response.status_code == 200:
            data = response.json()
            # Note: Paystack doesn't always return currency in data, but sometimes it does
            print(f"Success! Access Code: {data.get('data', {}).get('access_code')}")
        
        print("\nTrying GHS just in case...")
        payload["currency"] = "GHS"
        response = requests.post(url, json=payload, headers=headers)
        print(f"GHS Status Code: {response.status_code}")
        print(f"GHS Response: {response.text}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    probe()
