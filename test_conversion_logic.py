from app.services.paystack_service import PaystackService
import json

def test_conversion():
    service = PaystackService()
    
    # Mock data
    email = "test@example.com"
    plan = "starter"
    amount_usd = 2900 # $29.00
    org_id = "test-org-123"
    
    # We want to see the result of conversion
    rate = service.get_exchange_rate()
    amount_ghs = int(amount_usd * rate)
    
    print(f"USD Amount: {amount_usd} cents ($29.00)")
    print(f"Exchange Rate: {rate}")
    print(f"Converted GHS Amount: {amount_ghs} pesewas (GHS{amount_ghs/100:.2f})")
    
    # Verify exact match with expected GH₵435.00
    expected_ghs = 43500
    if amount_ghs == expected_ghs:
        print("PASS: Conversion matches expected value (43500)")
    else:
        print(f"FAIL: Conversion mismatch! Expected {expected_ghs}, got {amount_ghs}")

if __name__ == "__main__":
    test_conversion()
