import datetime
from typing import List, Dict, Any, Optional
from app.core.supabase import supabase
from app.models.preferences import SystemPreference

class PreferenceService:
    def __init__(self):
        self.table = "system_preferences"

    def get_all_preferences(self, user_id: str) -> Dict[str, Any]:
        """Fetch all preferences for a user and return as a key-value dict."""
        try:
            response = supabase.table(self.table).select("*").eq("user_id", user_id).execute()
            preferences = {}
            for item in response.data:
                preferences[item["key"]] = item["value"]
            return preferences
        except Exception as e:
            print(f"Error fetching preferences: {e}")
            return {}

    def get_preference(self, user_id: str, key: str, default: Any = None) -> Any:
        try:
            response = supabase.table(self.table).select("value").eq("user_id", user_id).eq("key", key).single().execute()
            if response.data:
                return response.data["value"]
            return default
        except Exception:
            return default

    def set_preference(self, user_id: str, key: str, value: Any) -> Dict[str, Any]:
        try:
            # Check if preference exists
            existing = supabase.table(self.table).select("id").eq("user_id", user_id).eq("key", key).execute()
            
            data = {
                "user_id": user_id,
                "key": key,
                "value": value,
                "updated_at": datetime.datetime.now().isoformat()
            }

            if existing.data:
                response = supabase.table(self.table).update(data).eq("id", existing.data[0]["id"]).execute()
            else:
                response = supabase.table(self.table).insert(data).execute()
            
            return response.data[0] if response.data else {}
        except Exception as e:
            print(f"Error setting preference {key}: {e}")
            raise e

    def set_preferences(self, user_id: str, preferences: Dict[str, Any]) -> List[Dict[str, Any]]:
        results = []
        for key, value in preferences.items():
            result = self.set_preference(user_id, key, value)
            results.append(result)
        return results

preference_service = PreferenceService()
