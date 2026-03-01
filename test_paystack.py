import sys
import os
sys.path.insert(0, os.path.abspath('.'))

from app.services.paystack_service import paystack_service
import logging

logging.basicConfig(level=logging.INFO)

# Test Paystack transaction initialization
result = paystack_service.initialize_transaction(
    email="test@example.com",
    amount_usd=2900,  # $29.00 in cents
    plan="starter",
    org_id="test-org-123",
    callback_url="http://localhost:3000/billing"
)

print("\n=== PAYSTACK RESULT ===")
print(result)
print("\n=== END ===")
