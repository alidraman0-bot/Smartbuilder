"""
Paystack Service - Payment provider integration
Handles Paystack API calls for subscriptions and payments
"""

from typing import Optional, Dict, Any
import logging
import requests
import uuid
import time
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


from app.core.http_client import http_client

class PaystackService:
    """Service for Paystack payment integration"""
    
    BASE_URL = "https://api.paystack.co"
    
    def __init__(self):
        self.secret_key = settings.PAYSTACK_SECRET_KEY
        self.public_key = settings.PAYSTACK_PUBLIC_KEY
        
        if not self.secret_key:
            logger.warning("PAYSTACK_SECRET_KEY not set - payment operations will fail")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for Paystack API requests"""
        return {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }

    def get_exchange_rate(self) -> float:
        """
        Returns the fixed exchange rate from USD to GHS
        """
        return 15.0
    
    async def initialize_transaction(
        self,
        email: str,
        amount_usd: int,  # in cents
        plan: str,
        org_id: str,
        callback_url: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Initialize a transaction with Paystack (Async)"""
        try:
            email = email.strip()
            url = f"{self.BASE_URL}/transaction/initialize"
            rate = self.get_exchange_rate()
            amount_ghs = int(amount_usd * rate)
            reference = f"sb_{uuid.uuid4().hex[:8]}_{int(time.time())}"
            
            payload = {
                "email": email,
                "amount": amount_ghs,
                "currency": "GHS",
                "reference": reference,
                "channels": ["card"],
                "metadata": {
                    "org_id": org_id,
                    "plan": plan,
                    "usd_amount": amount_usd,
                    "exchange_rate": rate,
                    "custom_fields": [
                        {
                            "display_name": "Plan",
                            "variable_name": "plan",
                            "value": plan.title()
                        }
                    ]
                }
            }
            
            if callback_url:
                payload["callback_url"] = callback_url
            
            logger.info(f"Initializing Paystack for {email} ({amount_ghs} GHS)")
            start_time = time.time()
            
            client = http_client
            response = await client.post(
                url,
                json=payload,
                headers=self._get_headers(),
                timeout=30.0
            )
            
            duration = time.time() - start_time
            logger.info(f"Paystack response in {duration:.2f}s (Status: {response.status_code})")
            
            if response.status_code == 200:
                result = response.json()
                if result.get("status"):
                    data = result.get("data", {})
                    # Ensure amount_ghs is included for the frontend
                    data["amount_ghs"] = amount_ghs
                    data["reference"] = reference  # Ensure we return the same reference we sent
                    return data
            
            logger.error(f"Paystack Init Failed: {response.text}")
            return None
            
        except Exception as e:
            logger.error(f"Error initializing Paystack: {e}")
            return None
    
    async def verify_transaction(self, reference: str) -> Optional[Dict[str, Any]]:
        """Verify a Paystack transaction"""
        try:
            url = f"{self.BASE_URL}/transaction/verify/{reference}"
            
            client = http_client
            response = await client.get(
                url,
                headers=self._get_headers(),
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("status") and result.get("data", {}).get("status") == "success":
                    return result.get("data")
            
            logger.error(f"Paystack verify failed: {response.text}")
            return None
            
        except Exception as e:
            logger.error(f"Error verifying Paystack: {e}")
            return None
    
    async def create_customer(self, email: str, org_id: str) -> Optional[str]:
        """Create a Paystack customer"""
        try:
            url = f"{self.BASE_URL}/customer"
            payload = {"email": email, "metadata": {"org_id": org_id}}
            
            client = http_client
            response = await client.post(url, json=payload, headers=self._get_headers())
            
            if response.status_code in [200, 201]:
                result = response.json()
                return result.get("data", {}).get("customer_code")
            return None
        except Exception as e:
            logger.error(f"Error creating customer: {e}")
            return None
    
    async def create_subscription(self, customer_code: str, plan_code: str, auth_code: str) -> Optional[Dict[str, Any]]:
        """Create a Paystack subscription"""
        try:
            url = f"{self.BASE_URL}/subscription"
            payload = {"customer": customer_code, "plan": plan_code, "authorization": auth_code}
            
            client = http_client
            response = await client.post(url, json=payload, headers=self._get_headers())
            
            if response.status_code in [200, 201]:
                return response.json().get("data")
            return None
        except Exception as e:
            logger.error(f"Error creating subscription: {e}")
            return None

    def get_plan_amount(self, plan: str) -> int:
        pricing = {"starter": 2900, "pro": 7900, "team": 19900, "enterprise": 0}
        return pricing.get(plan.lower(), 0)


# Singleton instance
paystack_service = PaystackService()
