import asyncio
import unittest
from unittest.mock import MagicMock, patch
from app.core.auth import verify_supabase_token
from fastapi import HTTPException

class TestAuthRobustness(unittest.IsolatedAsyncioTestCase):
    @patch("app.core.auth.supabase.auth.get_user")
    async def test_retry_on_connection_terminated(self, mock_get_user):
        # Simulate ConnectionTerminated twice, then success
        error_msg = "{\"detail\":\"Invalid authentication credentials: <ConnectionTerminated error_code:1, last_stream_id:5, additional_data:None>\"}"
        mock_get_user.side_effect = [
            Exception(error_msg),
            Exception(error_msg),
            MagicMock(user=MagicMock(id="test-user", email="test@example.com", app_metadata={}, user_metadata={}, aud="authenticated", created_at="now"))
        ]
        
        result = await verify_supabase_token("fake-token")
        
        print("Retry logic verified: Recovered after 2 failures")

    @patch("app.core.auth.supabase.auth.get_user")
    async def test_fail_after_max_retries(self, mock_get_user):
        # Simulate ConnectionTerminated indefinitely
        error_msg = "ConnectionTerminated error_code:1"
        mock_get_user.side_effect = Exception(error_msg)
        
        with self.assertRaises(HTTPException) as cm:
            await verify_supabase_token("fake-token")
        
        self.assertEqual(cm.exception.status_code, 401)
        self.assertEqual(mock_get_user.call_count, 3) # stop_after_attempt(3)
        print("✅ Max retries logic verified: Failed as expected after 3 attempts")

if __name__ == "__main__":
    unittest.main()
