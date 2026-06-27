"""
Base44 Build System — Code Generation & Project Scaffolding

Wraps intelligent code generation into a unified interface that simulates
the Base44 CLI workflow:
  • base44 init <project-name>  →  init_project()
  • Code synthesis              →  generate_codebase()
  • Scaffold assembly           →  scaffold_project()

Uses the project's AIClient with full fallback chain.
"""

import logging
import json
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from app.core.ai_client import get_ai_client

logger = logging.getLogger(__name__)


@dataclass
class GeneratedFile:
    path: str
    content: str
    language: str = "typescript"
    description: str = ""


@dataclass
class ProjectScaffold:
    project_name: str
    files: List[GeneratedFile]
    package_json: Dict[str, Any]
    database_ddl: str
    env_template: str
    total_files: int = 0

    def __post_init__(self):
        self.total_files = len(self.files)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "project_name": self.project_name,
            "files": [asdict(f) for f in self.files],
            "package_json": self.package_json,
            "database_ddl": self.database_ddl,
            "env_template": self.env_template,
            "total_files": self.total_files,
        }


# ============================================================================
# System prompt for code generation
# ============================================================================

CODE_GEN_SYSTEM_PROMPT = """You are BASE44 — an elite AI full-stack application builder.

CRITICAL CONSTRAINT:
- You are ONLY generating the application the user described.
- NOT a landing page. NOT a dashboard. NOT your platform's UI.
- The EXACT application described in the architecture spec.

TECHNOLOGY STACK:
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Lucide icons
- Backend: Base44 SDK (@base44/sdk)
- Database: Base44 Entities (base44.entities)
- State: Zustand
- Auth: Base44 Auth (base44.auth.loginViaEmailPassword)

CODE STANDARDS:
- Strict TypeScript (no `any`)
- async/await for all async operations
- Comprehensive error handling and loading states
- Input validation on all endpoints
- JSDoc comments on exported functions
- Proper logging with structured messages
- 'use client' directive on interactive React components

SECURITY:
- Parameterized queries only
- Input sanitization
- Rate limiting on API routes
- Secure headers

PREMIUM UI:
- Use vibrant HSL color palettes (not plain red/blue/green)
- Glassmorphism or modern card-based design
- Micro-animations with Framer Motion
- Responsive layouts (mobile-first)
- Loading skeletons, empty states, error boundaries

OUTPUT FORMAT (strict JSON):
{
  "files": [
    {"path": "src/app/page.tsx", "content": "full file content", "language": "typescript", "description": "Main entry page"}
  ]
}

MANDATORY FILES:
1. package.json — with all real dependencies including @base44/sdk
2. src/app/layout.tsx — root layout with fonts and providers
3. src/app/page.tsx — STUNNING LANDING PAGE with hero, features, and pricing
4. src/app/dashboard/page.tsx — PREMIUM DASHBOARD for core app functionality
5. src/app/dashboard/payments/page.tsx — PAYMENT & BILLING DASHBOARD
6. src/app/marketing/page.tsx — MARKETING ASSETS (e.g. social media copy, email templates)
7. src/app/globals.css — Tailwind directives + custom styles
8. tailwind.config.ts — Tailwind configuration
9. tsconfig.json — TypeScript config
10. next.config.mjs — Next.js config
11. src/lib/base44.ts — Base44 Client initialization
12. At least 3-5 feature components in src/components/
13. At least 2 zustand stores in src/store/ (one for app state, one for billing/user)

PREMIUM DESIGN MANDATE:
- Use Framer Motion for entrance animations and transitions
- Use Glassmorphism (backdrop-blur-md) for cards and overlays
- Use a coherent, high-end color palette (e.g. Deep Indigo, Electric Purple, and Slate)
- Ensure the landing page (src/app/page.tsx) is visually stunning and conversion-optimized
- Ensure the dashboard feels fast and professional with sidebar navigation and quick-action widgets
- Include a 'Payment Success' and 'Payment Cancel' flow simulation"""


class Base44BuildSystem:
    """
    Unified code generation and scaffolding system.
    Simulates the Base44 CLI build workflow using AI-powered generation.
    """

    def __init__(self):
        self.ai_client = get_ai_client()

    async def init_project(self, project_name: str) -> Dict[str, Any]:
        """
        Executes real `base44 init <project-name>` via CLI.
        Falls back to simulation if CLI is not found.
        """
        import subprocess
        import os
        slug = project_name.lower().replace(" ", "-").replace("'", "")[:30]
        
        try:
            # Attempt to run real CLI
            logger.info(f"Base44: Running `base44 init {slug}`")
            # We use shell=True on Windows if needed, or just list
            subprocess.run(["base44", "init", slug], check=True, capture_output=True, text=True)
            return {
                "project_name": project_name,
                "slug": slug,
                "initialized": True,
                "directory": os.path.abspath(slug),
                "method": "cli"
            }
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            logger.warning(f"Base44 CLI not found or failed ({e}). Falling back to simulation.")
            return {
                "project_name": project_name,
                "slug": slug,
                "initialized": True,
                "directory": f"/home/user/{slug}",
                "method": "simulated"
            }

    async def generate_codebase(
        self,
        architecture: Dict[str, Any],
        prd: Dict[str, Any],
    ) -> List[GeneratedFile]:
        """
        Step 3: GENERATE — Synthesize full-stack codebase from architecture spec.
        """
        logger.info("Base44: Generating codebase from architecture spec")

        product_name = prd.get("product_name", "My App")
        features = prd.get("core_features", [])
        data_model = prd.get("data_model", [])

        prompt = f"""Generate a COMPLETE, PRODUCTION-READY application.

Product: {product_name}
Features: {json.dumps(features, indent=2)}

Architecture:
{json.dumps(architecture, indent=2)}

Data Model:
{json.dumps(data_model, indent=2)}

Generate ALL files needed for a working application. Include every file listed
in the project_structure. Each file must contain COMPLETE, runnable code — no
placeholders, no TODOs, no stubs."""

        try:
            response = await self.ai_client.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                system_prompt=CODE_GEN_SYSTEM_PROMPT,
                max_tokens=2500,
                temperature=0.7,
                response_format={"type": "json_object"},
            )

            content = response.get("content", "")
            data = self._parse_json(content)
            files_raw = data.get("files", [])

            if not files_raw:
                raise ValueError("Base44: No files generated")

            files = [
                GeneratedFile(
                    path=f.get("path", "unknown.ts"),
                    content=f.get("content", ""),
                    language=f.get("language", "typescript"),
                    description=f.get("description", ""),
                )
                for f in files_raw
            ]

            # Ensure critical files exist
            files = self._ensure_critical_files(files, product_name)

            logger.info("Base44: Generated %d files", len(files))
            return files

        except Exception as e:
            logger.error("Base44 generation failed: %s", e)
            raise

    async def scaffold_project(
        self, project_name: str, files: List[GeneratedFile], architecture: Dict[str, Any]
    ) -> ProjectScaffold:
        """
        Step 4: SCAFFOLD — Assemble the generated files into a complete project scaffold.
        """
        logger.info("Base44: Scaffolding project '%s'", project_name)

        # Extract or generate package.json
        pkg_file = next((f for f in files if "package.json" in f.path), None)
        if pkg_file:
            try:
                package_json = json.loads(pkg_file.content)
            except json.JSONDecodeError:
                package_json = self._default_package_json(project_name)
        else:
            package_json = self._default_package_json(project_name)

        # Generate DDL from architecture
        database_ddl = self._generate_ddl(architecture)

        # Generate env template
        env_template = self._generate_env_template()

        scaffold = ProjectScaffold(
            project_name=project_name,
            files=files,
            package_json=package_json,
            database_ddl=database_ddl,
            env_template=env_template,
        )

        logger.info("Base44: Scaffold complete — %d files", scaffold.total_files)
        return scaffold

    def _parse_json(self, text: str) -> Dict[str, Any]:
        """Extract JSON from LLM response."""
        import re
        if not text:
            return {}
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        m = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(1))
            except json.JSONDecodeError:
                pass
        start, end = text.find('{'), text.rfind('}')
        if start != -1 and end > start:
            try:
                return json.loads(text[start:end + 1])
            except json.JSONDecodeError:
                pass
        return {}

    def _ensure_critical_files(self, files: List[GeneratedFile], product_name: str) -> List[GeneratedFile]:
        """Ensure package.json and entry points exist."""
        paths = {f.path for f in files}
        slug = product_name.lower().replace(" ", "-")[:20]

        if not any("package.json" in p for p in paths):
            files.append(GeneratedFile(
                path="package.json",
                content=json.dumps(self._default_package_json(product_name), indent=2),
                language="json",
                description="npm package manifest",
            ))

        if not any("src/lib/base44" in p for p in paths):
            files.append(GeneratedFile(
                path="src/lib/base44.ts",
                content="import { createClient } from '@base44/sdk';\n\nexport const base44 = createClient({\n  appId: process.env.NEXT_PUBLIC_BASE44_APP_ID || 'demo-app-id'\n});\n",
                language="typescript",
                description="Base44 SDK Client Instance",
            ))

        if not any("tsconfig.json" in p for p in paths):
            files.append(GeneratedFile(
                path="tsconfig.json",
                content=json.dumps({
                    "compilerOptions": {
                        "target": "es5", "lib": ["dom", "dom.iterable", "esnext"],
                        "allowJs": True, "skipLibCheck": True, "strict": True,
                        "noEmit": True, "esModuleInterop": True,
                        "module": "esnext", "moduleResolution": "bundler",
                        "resolveJsonModule": True, "isolatedModules": True,
                        "jsx": "preserve", "incremental": True,
                        "paths": {"@/*": ["./src/*"]}
                    },
                    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
                    "exclude": ["node_modules"]
                }, indent=2),
                language="json",
                description="TypeScript configuration",
            ))

        if not any("next.config" in p for p in paths):
            files.append(GeneratedFile(
                path="next.config.mjs",
                content="/** @type {import('next').NextConfig} */\nconst nextConfig = {};\nexport default nextConfig;\n",
                language="javascript",
                description="Next.js configuration",
            ))

        if not any("globals.css" in p for p in paths):
            files.append(GeneratedFile(
                path="src/app/globals.css",
                content="@tailwind base;\n@tailwind components;\n@tailwind utilities;\n",
                language="css",
                description="Global styles with Tailwind directives",
            ))

        return files

    def _default_package_json(self, name: str) -> Dict[str, Any]:
        slug = name.lower().replace(" ", "-")[:30]
        return {
            "name": slug,
            "version": "0.1.0",
            "private": True,
            "scripts": {
                "dev": "next dev",
                "build": "next build",
                "start": "next start",
                "lint": "next lint",
            },
            "dependencies": {
                "next": "14.2.0",
                "react": "^18",
                "react-dom": "^18",
                "@base44/sdk": "latest",
                "zustand": "^4.5.0",
                "lucide-react": "^0.350.0",
                "framer-motion": "^11",
                "clsx": "^2.1.0",
            },
            "devDependencies": {
                "typescript": "^5",
                "@types/react": "^18",
                "@types/node": "^20",
                "tailwindcss": "^3.4",
                "autoprefixer": "^10",
                "postcss": "^8",
            },
        }

    def _generate_ddl(self, architecture: Dict[str, Any]) -> str:
        """Generate PostgreSQL DDL from architecture schema."""
        tables = architecture.get("database_schema", [])
        if not tables:
            return "-- No database schema defined\n"

        lines = ["-- Database schema generated by Smartbuilder AI", ""]
        for table in tables:
            name = table.get("table", table.get("name", "unnamed"))
            columns = table.get("columns", [])
            lines.append(f"CREATE TABLE IF NOT EXISTS {name} (")
            col_strs = []
            for col in columns:
                if isinstance(col, str):
                    col_strs.append(f"  {col}")
                elif isinstance(col, dict):
                    col_strs.append(f"  {col.get('name', 'col')} {col.get('type', 'TEXT')}")
            lines.append(",\n".join(col_strs))
            lines.append(");")
            if table.get("rls", False):
                lines.append(f"ALTER TABLE {name} ENABLE ROW LEVEL SECURITY;")
            lines.append("")

        return "\n".join(lines)

    def _generate_env_template(self) -> str:
        return "\n".join([
            "NEXT_PUBLIC_BASE44_APP_ID=your-base44-app-id",
            "BASE44_API_KEY=your-base44-api-key",
            "",
        ])
