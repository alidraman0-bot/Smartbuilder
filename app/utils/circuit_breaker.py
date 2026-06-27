import pybreaker
import logging

logger = logging.getLogger(__name__)

# Production Circuit Breaker
# Fails after 5 consecutive failures, resets after 60 seconds
breaker = pybreaker.CircuitBreaker(
    fail_max=5,
    reset_timeout=60,
    listeners=[pybreaker.CircuitBreakerListener()]
)

logger.info("Circuit Breaker (pybreaker) initialized for production.")
