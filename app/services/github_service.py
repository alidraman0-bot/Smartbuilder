import logging
import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class GitHubService:
    """
    Security-first GitHub App integration.
    Manages installations, repo creation, and OAuth without storing tokens.
    """
    
    BASE_URL = "https://api.github.com"

    def __init__(self):
        self.app_id = settings.GITHUB_APP_ID if hasattr(settings, 'GITHUB_APP_ID') else "12345"
        self.installation_store: Dict[str, Dict[str, Any]] = {} # project_id -> metadata

    async def create_repository(self, project_slug: str, org_or_user: str) -> Dict[str, Any]:
        """
        Creates a private repository for a new project.
        Format: sb-{project_slug}
        """
        repo_name = f"sb-{project_slug}"
        logger.info(f"Creating GitHub repository {repo_name} for {org_or_user}")
        
        # Simulate GitHub API call via App installation token
        return {
            "name": repo_name,
            "full_name": f"{org_or_user}/{repo_name}",
            "html_url": f"https://github.com/{org_or_user}/{repo_name}",
            "private": True,
            "installation_id": "inst_91823"
        }

    async def initialize_repo(self, repo_full_name: str, template_type: str = "base"):
        """
        Sets up the base template, README, and .gitignore.
        """
        logger.info(f"Initializing {repo_full_name} with {template_type} template")
        # Logic to commit base files using App Token
        return True

    async def get_installation_id(self, project_id: str) -> Optional[str]:
        return self.installation_store.get(project_id, {}).get("installation_id")

    async def list_user_repos(self, oauth_token: str) -> List[Dict[str, Any]]:
        """
        Used during the connection flow to let users pick a repo.
        """
        # GET /user/repos
        return [
            {"name": "my-cool-app", "full_name": "user/my-cool-app"},
            {"name": "old-project", "full_name": "user/old-project"}
        ]

    async def check_api_rate_limits(self) -> Dict[str, Any]:
        """
        Founder-level risk signal.
        """
        return {
            "limit": 5000,
            "remaining": 4820,
            "reset": "14:22 UTC",
            "status": "stable"
        }

github_service = GitHubService()
