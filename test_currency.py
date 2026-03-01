import sys
import os
sys.path.insert(0, os.path.abspath('.'))

from app.services.paystack_service import paystack_service
import logging

logging.basicConfig(level=logging.INFO)

# Test with different amounts to see what works
test_amounts = [
    (2900, "USD cents - $29"),
    (29000, "Small kobo - N290"),
    (2900000, "NGN kobo - N29,000"),
]

for amount, description in test_amounts:
    print(f"\n=== Testing {description} (amount={amount}) ===")
    result = paystack_service.initialize_transaction(
        email="test@example.com",
        amount_usd=amount,
        plan="starter",
        org_id="test-org-123",
        callback_url="http://localhost:3000/billing"
    )
    
    if result:
        print(f"SUCCESS: {result.get('authorization_url')}")
        # Verify the transaction to see what currency Paystack assigned
        ref = result.get('reference')
        verified = paystack_service.verify_transaction(ref)
        if verified:
            print(f"   Currency: {verified.get('currency')}")
            print(f"   Amount: {verified.get('amount')}")
        break
    else:
        print(f"❌ FAILED")
