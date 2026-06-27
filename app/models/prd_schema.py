from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class ProductOverview(BaseModel):
    vision: str
    mission: str
    strategic_purpose: str

    class Config:
        extra = "allow"


class ProductGoals(BaseModel):
    business_goals: List[str]
    technical_goals: List[str]
    user_goals: List[str]

    class Config:
        extra = "allow"


class UserPersona(BaseModel):
    name: str
    role: str
    demographics: str
    pain_points: List[str]
    goals: List[str]
    tech_savviness: str

    class Config:
        extra = "allow"


class UserStoryDetail(BaseModel):
    story: str
    acceptance_criteria: List[str]

    class Config:
        extra = "allow"


class UserStories(BaseModel):
    primary_flows: List[UserStoryDetail]
    edge_cases: List[UserStoryDetail]
    admin_flows: List[UserStoryDetail]

    class Config:
        extra = "allow"


class Feature(BaseModel):
    name: str
    description: str
    priority: str
    business_value: str
    technical_logic: str
    user_flow: List[str]
    api_interactions: List[str]
    edge_cases: List[str]
    validation_rules: List[str]

    class Config:
        extra = "allow"


class SystemArchitecture(BaseModel):
    frontend: Dict[str, Any]
    backend: Dict[str, Any]
    database: Dict[str, Any]
    ai_pipeline: str
    event_system: str

    class Config:
        extra = "allow"


class DatabaseDesign(BaseModel):
    tables: List[Dict[str, Any]]
    relationships: List[str]
    scalability_strategy: str

    class Config:
        extra = "allow"


class APIDesign(BaseModel):
    endpoints: List[Dict[str, Any]]

    class Config:
        extra = "allow"


class AISystemDesign(BaseModel):
    models: List[Dict[str, Any]]
    prompts_strategy: str
    pipeline_description: str
    validation: str

    class Config:
        extra = "allow"


class SecurityDesign(BaseModel):
    authentication: str
    authorization: str
    encryption: str
    tenant_isolation: str
    abuse_prevention: List[str]

    class Config:
        extra = "allow"


class ScalabilityPlan(BaseModel):
    caching_strategy: str
    queue_system: str
    edge_architecture: str
    async_processing: str
    cdn_strategy: str

    class Config:
        extra = "allow"


class AnalyticsMonitoring(BaseModel):
    telemetry: str
    observability: str
    logging: str
    metrics: List[str]
    tracing: str
    ai_insights: str

    class Config:
        extra = "allow"


class DeploymentInfrastructure(BaseModel):
    cicd: str
    hosting: str
    github_integration: str
    database_hosting: str
    containerization: str

    class Config:
        extra = "allow"


class MVPScope(BaseModel):
    mvp_features: List[str]
    v2_features: List[str]
    enterprise_roadmap: List[str]
    timeline: str

    class Config:
        extra = "allow"


class PRDFull(BaseModel):
    product_overview: ProductOverview
    product_goals: ProductGoals
    user_personas: List[UserPersona]
    user_stories: UserStories
    features: List[Feature]
    system_architecture: SystemArchitecture
    database_design: DatabaseDesign
    api_design: APIDesign
    ai_system_design: AISystemDesign
    security_design: SecurityDesign
    scalability_plan: ScalabilityPlan
    analytics_monitoring: AnalyticsMonitoring
    deployment_infrastructure: DeploymentInfrastructure
    mvp_scope: MVPScope

    class Config:
        extra = "allow"
