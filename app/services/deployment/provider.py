from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class DeploymentProvider(ABC):
    """
    Abstract interface for deployment infrastructure providers.
    Implementations (Vercel, AWS, etc.) must adhere to this contract.
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the provider (e.g., 'vercel', 'aws')."""
        pass

    @abstractmethod
    async def validate_config(self, config: Dict[str, Any]) -> bool:
        """
        Validate provider-specific configuration.
        """
        pass

    @abstractmethod
    async def provision_resources(self, project_id: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Provision necessary infrastructure (buckets, projects, etc.).
        Returns resource identifiers and metadata.
        """
        pass

    @abstractmethod
    async def deploy_build(self, 
                          build_artifact: Dict[str, Any], 
                          environment: str, 
                          env_vars: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Deploy a build artifact to the target environment.
        Returns deployment status, URL, and provider-specific ID.
        """
        pass

    @abstractmethod
    async def get_deployment_status(self, external_deployment_id: str) -> Dict[str, Any]:
        """
        Get the current status of a deployment from the provider.
        """
        pass

    @abstractmethod
    async def promote_to_production(self, external_deployment_id: str) -> Dict[str, Any]:
        """
        Promote a specific deployment to production/live.
        """
        pass

    @abstractmethod
    async def rollback(self, external_deployment_id: str) -> Dict[str, Any]:
        """
        Rollback to a specific deployment.
        """
        pass
