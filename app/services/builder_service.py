import logging
import json
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.ai_client import get_ai_client

logger = logging.getLogger(__name__)

class BuilderService:
    def __init__(self):
        self.ai_client = get_ai_client()
        self.data_store: Dict[str, Dict[str, Any]] = {}

    async def generate_business_plan(self, idea: Dict[str, Any], research: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert research insights into an investor-grade business plan.
        """
        if not settings.OPENAI_API_KEY:
            return self._get_mock_business_plan(idea)

        prompt = f"""
        You are an AI Product Strategist. Convert the following research into an investor-grade business plan.
        
        Idea: {idea.get('title')}
        Research Summary: {research.get('summary')}
        Research Modules: {json.dumps(research.get('modules'))}
        
        Write a precise, structured business plan. No hype. Signal over narrative.
        
        RETURN ONLY A JSON OBJECT:
        {{
            "sections": [
                {{ "title": "Executive Summary", "content": "..." }},
                {{ "title": "Problem & Market Opportunity", "content": "..." }},
                {{ "title": "Solution Overview", "content": "..." }},
                {{ "title": "Business Model", "content": "..." }},
                {{ "title": "Go-To-Market Strategy", "content": "..." }},
                {{ "title": "Competitive Positioning", "content": "..." }},
                {{ "title": "Risks & Constraints", "content": "..." }}
            ],
            "viability_score": 0.0-100.0,
            "risks": ["risk 1", "risk 2"]
        }}
        """

        try:
            response = await self.ai_client.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                system_prompt="You are a senior product strategist.",
                response_format={"type": "json_object"}
            )
            return json.loads(response["content"])
        except Exception as e:
            logger.error(f"BP Generation error: {e}")
            return self._get_mock_business_plan(idea)

    async def generate_prd(self, idea: Dict[str, Any], business_plan: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert a business plan into an engineering-ready PRD.
        """
        if not self.ai_client.has_provider(settings.AI_PROVIDER) and not settings.OPENAI_API_KEY:
            return self._get_mock_prd(idea)

        prompt = f"""
        You are a Technical Product Manager. Convert the following business plan into an engineering-ready PRD.
        
        Idea: {idea.get('title')}
        Business Plan: {json.dumps(business_plan)}
        
        The PRD must be machine-readable and executable.
        LIMIT FEATURES TO EXACTLY 5 CORE FEATURES.
        
        RETURN ONLY A JSON OBJECT:
        {{
            "product_overview": "string",
            "target_user": "string",
            "problem_statement": "string",
            "features": [
                {{ "name": "name", "description": "desc", "priority": "P0|P1" }}
            ],
            "non_functional_requirements": ["req 1", "req 2"],
            "success_metrics": ["metric 1", "metric 2"],
            "constraints": ["MVP limitation 1"]
        }}
        """

        try:
            response = await self.ai_client.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                system_prompt="You are a senior technical product manager.",
                response_format={"type": "json_object"}
            )
            return json.loads(response["content"])
        except Exception as e:
            logger.error(f"PRD Generation error: {e}")
            return self._get_mock_prd(idea)

    def _get_mock_business_plan(self, idea: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "sections": [
                { "title": "Executive Summary", "content": f"{idea.get('title')} is a high-performance solution for the identified gap in enterprise data synchronization. It leverages distributed ledger tech to ensure 100% data integrity across multi-cloud environments." },
                { "title": "Problem & Market Opportunity", "content": "Enterprise data teams currently lose $2.1M annually due to synchronization latency. The market for multi-cloud data tools is growing at 22% CAGR." },
                { "title": "Solution Overview", "content": "A lightweight agent-based architecture that provides real-time state reconciliation without the overhead of traditional ETL." },
                { "title": "Business Model", "content": "Tiered SaaS subscription based on data throughput. Target LTV/CAC ratio of 3.5x." },
                { "title": "Go-To-Market Strategy", "content": "Initial focus on series B+ fintech startups. Distribution via cloud marketplaces and direct sales to CTO offices." },
                { "title": "Competitive Positioning", "content": "Superior to legacy giants like IBM due to 'security-first' local-first architecture. 40% cheaper than modern cloud-native incumbents." },
                { "title": "Risks & Constraints", "content": "Cloud provider egress costs and regulatory compliance in EMEA region." }
            ],
            "viability_score": 88.5,
            "risks": ["Cloud egress costs", "EMEA regulatory overhead"]
        }

    def _get_mock_prd(self, idea: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "product_overview": f"MVP for {idea.get('title')}, focusing on core synchronization primitives.",
            "target_user": "Infrastructure Engineers & Data Architects",
            "problem_statement": "Inefficient data state reconciliation across heterogeneous cloud environments.",
            "features": [
                { "name": "Real-time Sync Node", "description": "Core engine for lightweight state diffing.", "priority": "P0" },
                { "name": "Auth & Identity", "description": "RBAC for multi-tenant access control.", "priority": "P0" },
                { "name": "Conflict Resolution API", "description": "Last-write-wins and custom override logic.", "priority": "P0" },
                { "name": "Observability Dashboard", "description": "Real-time latency and error tracking.", "priority": "P1" },
                { "name": "Automated Deployment Script", "description": "One-click setup for AWS/GCP regions.", "priority": "P1" }
            ],
            "non_functional_requirements": ["Latency < 100ms", "99.9% uptime for core sync", "End-to-end encryption"],
            "success_metrics": ["Sync success rate > 99.5%", "Time to first sync < 5 mins"],
            "constraints": ["Max 10 nodes in MVP", "AWS only for initial deployment"]
        }

builder_service = BuilderService()
