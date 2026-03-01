"""
Paystack Service - Payment provider integration
Handles Paystack API calls for subscriptions and payments
"""

from typing import Optional, Dict, Any
import logging
import requests
import uuid
import time
from app.core.config import settings

logger = logging.getLogger(__name__)


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
        Currently hardcoded to 15.0
        """
        return 15.0
    
    def initialize_transaction(
        self,
        email: str,
        amount_usd: int,  # in cents
        plan: str,
        org_id: str,
        callback_url: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Initialize a Paystack transaction for subscription upgrade
        Converts USD to GHS and restricts to card payments
        
        Args:
            email: Customer email
            amount_usd: Amount in USD cents ($29.00 = 2900)
            plan: Plan name
            org_id: Organization ID
            callback_url: Optional redirect URL
        """
        try:
            url = f"{self.BASE_URL}/transaction/initialize"
            
            # Convert USD to GHS
            rate = self.get_exchange_rate()
            amount_ghs = int(amount_usd * rate)
            
            # Generate unique reference to avoid "Duplicate Transaction Reference" errors
            # Using timestamp and short uuid for uniqueness
            reference = f"sb_{uuid.uuid4().hex[:8]}_{int(time.time())}"
            
            payload = {
                "email": email,
                "amount": amount_ghs,
                "currency": "GHS",
                "reference": reference,
                "channels": ["card"],  # Restrict to credit card only
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
                        },
                        {
                            "display_name": "Amount (USD)",
                            "variable_name": "usd_amount",
                            "value": f"${amount_usd/100:.2f}"
                        }
                    ]
                }
            }
            
            if callback_url:
                payload["callback_url"] = callback_url
            
            response = requests.post(
                url,
                json=payload,
                headers=self._get_headers(),
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("status"):
                    data = result.get("data", {})
                    # Add amount_ghs to response so frontend can use matching value
                    data["amount_ghs"] = amount_ghs
                    return data
            
            logger.error(f"Paystack transaction initialization failed: {response.text}")
            return None
            
        except Exception as e:
            logger.error(f"Error initializing Paystack transaction: {e}")
            return None
    
    def verify_transaction(self, reference: str) -> Optional[Dict[str, Any]]:
        """
        Verify a Paystack transaction
        
        Args:
            reference: Transaction reference from Paystack
        
        Returns:
            Transaction data if successful, None otherwise
        """
        try:
            url = f"{self.BASE_URL}/transaction/verify/{reference}"
            
            response = requests.get(
                url,
                headers=self._get_headers(),
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("status") and result.get("data", {}).get("status") == "success":
                    return result.get("data")
            
            logger.error(f"Paystack transaction verification failed: {response.text}")
            return None
            
        except Exception as e:
            logger.error(f"Error verifying Paystack transaction: {e}")
            return None
    
    def create_customer(self, email: str, org_id: str) -> Optional[str]:
        """
        Create a Paystack customer
        
        Returns:
            Customer code if successful, None otherwise
        """
        try:
            url = f"{self.BASE_URL}/customer"
            
            payload = {
                "email": email,
                "metadata": {
                    "org_id": org_id
                }
            }
            
            response = requests.post(
                url,
                json=payload,
                headers=self._get_headers(),
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                if result.get("status"):
                    return result.get("data", {}).get("customer_code")
            
            logger.error(f"Paystack customer creation failed: {response.text}")
            return None
            
        except Exception as e:
            logger.error(f"Error creating Paystack customer: {e}")
            return None
    
    def create_subscription(
        self,
        customer_code: str,
        plan_code: str,
        authorization_code: str
    ) -> Optional[Dict[str, Any]]:
        """
        Create a Paystack subscription
        
        Args:
            customer_code: Paystack customer code
            plan_code: Paystack plan code (configure in Paystack dashboard)
            authorization_code: Payment authorization code from successful transaction
        
        Returns:
            Subscription data if successful, None otherwise
        """
        try:
            url = f"{self.BASE_URL}/subscription"
            
            payload = {
                "customer": customer_code,
                "plan": plan_code,
                "authorization": authorization_code
            }
            
            response = requests.post(
                url,
                json=payload,
                headers=self._get_headers(),
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                if result.get("status"):
                    return result.get("data")
            
            logger.error(f"Paystack subscription creation failed: {response.text}")
            return None
            
        except Exception as e:
            logger.error(f"Error creating Paystack subscription: {e}")
            return None
    
    def cancel_subscription(
        self,
        subscription_code: str,
        email_token: str
    ) -> bool:
        """
        Cancel a Paystack subscription
        
        Args:
            subscription_code: Subscription code from Paystack
            email_token: Token sent to customer's email for cancellation
        
        Returns:
            True if successful, False otherwise
        """
        try:
            url = f"{self.BASE_URL}/subscription/disable"
            
            payload = {
                "code": subscription_code,
                "token": email_token
            }
            
            response = requests.post(
                url,
                json=payload,
                headers=self._get_headers(),
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("status", False)
            
            logger.error(f"Paystack subscription cancellation failed: {response.text}")
            return False
            
        except Exception as e:
            logger.error(f"Error cancelling Paystack subscription: {e}")
            return False
    
    def get_plan_amount(self, plan: str) -> int:
        """
        Get plan pricing in USD cents
        
        Returns amount in cents ($29.00 = 2900)
        """
        pricing = {
            "starter": 2900,
            "pro": 7900,
            "team": 19900,
            "enterprise": 0
        }
        
        return pricing.get(plan.lower(), 0)


# Singleton instance
paystack_service = PaystackService()
