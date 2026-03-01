"""
Paystack Webhook Handler - Revenue-Critical Infrastructure
Handles all Paystack webhook events with signature verification
"""

from fastapi import APIRouter, Request, HTTPException, Header
from typing import Optional
import hashlib
import hmac
import logging
from datetime import datetime, timedelta

from app.core.config import settings
from app.services.billing_service import billing_service

router = APIRouter()
logger = logging.getLogger(__name__)


def verify_paystack_signature(payload: bytes, signature: str) -> bool:
    """
    Verify Paystack webhook signature using SHA-512 HMAC
    
    Args:
        payload: Raw request body as bytes
        signature: x-paystack-signature header value
    
    Returns:
        True if signature is valid, False otherwise
    """
    if not settings.PAYSTACK_SECRET_KEY:
        logger.error("PAYSTACK_SECRET_KEY not configured")
        return False
    
    # Compute HMAC SHA-512
    computed_signature = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode('utf-8'),
        payload,
        hashlib.sha512
    ).hexdigest()
    
    # Constant-time comparison to prevent timing attacks
    return hmac.compare_digest(computed_signature, signature)


@router.post("/webhook")
async def paystack_webhook(
    request: Request,
    x_paystack_signature: Optional[str] = Header(None)
):
    """
    Paystack webhook endpoint - Single source of truth for billing
    
    Handles events:
    - subscription.create: Activate subscription
    - charge.success: Extend billing period
    - invoice.payment_failed: Set to past_due
    - subscription.disable: Cancel subscription
    """
    
    # Get raw body for signature verification
    body = await request.body()
    
    # STEP 1: VERIFY SIGNATURE (MANDATORY)
    if not x_paystack_signature:
        logger.warning("Webhook received without signature")
        raise HTTPException(status_code=401, detail="Missing signature")
    
    if not verify_paystack_signature(body, x_paystack_signature):
        logger.warning("Webhook signature verification failed")
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    # STEP 2: PARSE EVENT
    try:
        event = await request.json()
    except Exception as e:
        logger.error(f"Failed to parse webhook payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    event_type = event.get("event")
    data = event.get("data", {})
    
    logger.info(f"Processing Paystack webhook: {event_type}")
    
    # STEP 3: ROUTE TO HANDLER
    try:
        if event_type == "subscription.create":
            await handle_subscription_create(data)
        
        elif event_type == "charge.success":
            await handle_charge_success(data)
        
        elif event_type == "invoice.payment_failed":
            await handle_payment_failed(data)
        
        elif event_type == "subscription.disable":
            await handle_subscription_cancelled(data)
        
        else:
            # Log unknown events but don't fail
            logger.info(f"Ignoring unknown event: {event_type}")
    
    except Exception as e:
        logger.error(f"Error processing webhook {event_type}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Webhook processing error")
    
    # ALWAYS return 200 to acknowledge receipt
    return {"status": "success"}


async def handle_subscription_create(data: dict):
    """
    Handle subscription.create event
    Activates the subscription and saves customer details
    """
    try:
        metadata = data.get("metadata", {})
        org_id = metadata.get("org_id")
        
        if not org_id:
            logger.error("subscription.create missing org_id in metadata")
            return
        
        customer = data.get("customer", {})
        plan_data = data.get("plan", {})
        
        # Extract plan name from Paystack plan
        # Paystack plan names should be: "Smartbuilder Starter", "Smartbuilder Pro", etc.
        plan_name = plan_data.get("name", "").lower()
        if "pro" in plan_name or "founder" in plan_name:
            plan = "pro"
        elif "team" in plan_name:
            plan = "team"
        elif "starter" in plan_name or "builder" in plan_name:
            plan = "starter"
        else:
            # Fallback to metadata plan if name doesn't match
            plan = metadata.get("plan", "free")
        
        # Calculate period end (next payment date)
        next_payment = data.get("next_payment_date")
        if next_payment:
            period_end = datetime.fromisoformat(next_payment.replace('Z', '+00:00'))
        else:
            # Default to 30 days from now
            period_end = datetime.utcnow() + timedelta(days=30)
        
        # Create or update subscription
        subscription_data = {
            "org_id": org_id,
            "provider": "paystack",
            "plan": plan,
            "status": "active",
            "provider_customer_id": customer.get("customer_code"),
            "provider_subscription_id": data.get("subscription_code"),
            "current_period_start": datetime.utcnow().isoformat(),
            "current_period_end": period_end.isoformat(),
            "cancel_at_period_end": False
        }
        
        # Check if subscription exists
        existing = billing_service.get_subscription(org_id)
        if existing:
            billing_service.update_subscription(org_id, subscription_data)
        else:
            billing_service.create_subscription(subscription_data)
        
        # Log event
        billing_service.log_billing_event(
            org_id=org_id,
            event_type="subscription_created",
            payload=data,
            provider="paystack"
        )
        
        logger.info(f"Subscription created for org {org_id}: {plan}")
        
    except Exception as e:
        logger.error(f"Error in handle_subscription_create: {e}", exc_info=True)
        raise


async def handle_charge_success(data: dict):
    """
    Handle charge.success event
    Extends subscription period and logs successful payment
    """
    try:
        metadata = data.get("metadata", {})
        org_id = metadata.get("org_id")
        
        # Try to get org_id from subscription if not in metadata
        if not org_id:
            customer_code = data.get("customer", {}).get("customer_code")
            subscription_code = data.get("subscription", {}).get("subscription_code")
            
            if customer_code or subscription_code:
                # Query DB for org_id
                from app.core.supabase import supabase
                query = supabase.table("subscriptions").select("org_id")
                if subscription_code:
                    query = query.eq("provider_subscription_id", subscription_code)
                else:
                    query = query.eq("provider_customer_id", customer_code)
                
                res = query.single().execute()
                if res.data:
                    org_id = res.data['org_id']
        
        if not org_id:
            logger.error("charge.success missing org_id in metadata and lookup failed")
            return
        
        amount = data.get("amount")  # in cents
        currency = data.get("currency", "USD")
        
        # Update subscription period
        subscription = billing_service.get_subscription(org_id)
        if subscription:
            # Extend period by 30 days from current end
            current_end = datetime.fromisoformat(
                subscription['current_period_end'].replace('Z', '+00:00')
            )
            new_end = current_end + timedelta(days=30)
            
            billing_service.update_subscription(org_id, {
                "status": "active",
                "current_period_end": new_end.isoformat()
            })
        
        # Log payment event
        billing_service.log_billing_event(
            org_id=org_id,
            event_type="payment_succeeded",
            payload=data,
            amount=amount,
            currency=currency,
            provider="paystack"
        )
        
        logger.info(f"Payment succeeded for org {org_id}: {amount} {currency}")
        
    except Exception as e:
        logger.error(f"Error in handle_charge_success: {e}", exc_info=True)
        raise


async def handle_payment_failed(data: dict):
    """
    Handle invoice.payment_failed event
    Sets subscription to past_due status (grace period)
    """
    try:
        metadata = data.get("metadata", {})
        org_id = metadata.get("org_id")
        
        if not org_id:
            logger.warning("invoice.payment_failed missing org_id in metadata")
            return
        
        amount = data.get("amount")
        
        # Update subscription to past_due
        billing_service.update_subscription(org_id, {
            "status": "past_due"
        })
        
        # Log event
        billing_service.log_billing_event(
            org_id=org_id,
            event_type="payment_failed",
            payload=data,
            amount=amount,
            provider="paystack"
        )
        
        logger.warning(f"Payment failed for org {org_id}: {amount}")
        
    except Exception as e:
        logger.error(f"Error in handle_payment_failed: {e}", exc_info=True)
        raise


async def handle_subscription_cancelled(data: dict):
    """
    Handle subscription.disable event
    Marks subscription as cancelled but preserves data
    """
    try:
        subscription_code = data.get("subscription_code")
        
        if not subscription_code:
            logger.warning("subscription.disable missing subscription_code")
            return
        
        # Find subscription by provider_subscription_id
        # We need to query this differently since we don't have org_id
        # For now, update using service role with subscription_code
        
        # Use raw Supabase query
        from app.core.supabase import supabase
        response = supabase.table("subscriptions")\
            .select("org_id")\
            .eq("provider_subscription_id", subscription_code)\
            .single()\
            .execute()
        
        if not response.data:
            logger.warning(f"Subscription not found: {subscription_code}")
            return
        
        org_id = response.data['org_id']
        
        # Update subscription: Downgrade to free
        billing_service.update_subscription(org_id, {
            "plan": "free",
            "status": "cancelled",
            "cancelled_at": datetime.utcnow().isoformat(),
            "cancel_at_period_end": False,
            "provider_subscription_id": None # Clear to allow new sub
        })
        
        # Log event
        billing_service.log_billing_event(
            org_id=org_id,
            event_type="subscription_cancelled",
            payload=data,
            provider="paystack"
        )
        
        logger.info(f"Subscription cancelled for org {org_id}")
        
    except Exception as e:
        logger.error(f"Error in handle_subscription_cancelled: {e}", exc_info=True)
        raise
