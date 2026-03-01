import requests

# Test the live backend API
try:
    # Get plans endpoint
    response = requests.get("http://127.0.0.1:8000/api/v1/billing/plans", timeout=5)
    print("=== PLANS ENDPOINT ===")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        plans = response.json().get("plans", [])
        for plan in plans:
            print(f"\nPlan: {plan['id']}")
            print(f"  Price: {plan['price']}")
            print(f"  Currency: {plan['currency']}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Failed to connect: {e}")
