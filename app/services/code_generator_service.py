"""
Code Generator Service

AI-powered code generation for each build task.
IMPORTANT: Never asks AI to "build a full app" — always generates
database, backend, and frontend SEPARATELY.

Each generator returns a list of file objects: {path, content, type}
"""

import logging
import json
from typing import Dict, Any, List
from app.core.ai_client import get_ai_client

logger = logging.getLogger(__name__)


class CodeGeneratorService:
    def __init__(self):
        self.ai = get_ai_client()

    async def generate_architecture(self, build_plan: Dict[str, Any]) -> Dict[str, Any]:
        """
        Task 1: ARCHITECTURE
        Resolve the complete file tree from the build plan.
        """
        app_name = build_plan.get("app_name", "my-app")
        pages = build_plan.get("frontend", {}).get("pages", [])
        endpoints = build_plan.get("backend", {}).get("endpoints", [])

        # Build deterministic file tree from plan
        file_tree = []

        # Root config files
        file_tree.append("package.json")
        file_tree.append("next.config.js")
        file_tree.append("tailwind.config.js")
        file_tree.append("postcss.config.js")
        file_tree.append(".env.local")

        # App layout
        file_tree.append("src/app/layout.tsx")
        file_tree.append("src/app/globals.css")

        # Pages
        for page in pages:
            path = page.get("path", "/")
            if path == "/":
                file_tree.append("src/app/page.tsx")
            else:
                route = path.strip("/")
                file_tree.append(f"src/app/{route}/page.tsx")

            # Components for this page
            for comp in page.get("components", []):
                file_tree.append(f"src/components/{comp}.tsx")

        # API routes
        for endpoint in endpoints:
            api_path = endpoint.get("path", "").replace("/api/", "")
            if ":" in api_path:
                # Dynamic route: /api/projects/:id → src/app/api/projects/[id]/route.ts
                parts = api_path.split("/")
                clean_parts = []
                for p in parts:
                    if p.startswith(":"):
                        clean_parts.append(f"[{p[1:]}]")
                    else:
                        clean_parts.append(p)
                file_tree.append(f"src/app/api/{'/'.join(clean_parts)}/route.ts")
            else:
                file_tree.append(f"src/app/api/{api_path}/route.ts")

        # Database
        file_tree.append("src/lib/supabase.ts")
        file_tree.append("schema.sql")

        # Deduplicate
        file_tree = list(dict.fromkeys(file_tree))

        return {
            "file_tree": file_tree,
            "total_files": len(file_tree),
        }

    async def generate_database(self, build_plan: Dict[str, Any]) -> Dict[str, Any]:
        """
        Task 2: DATABASE
        Generate PostgreSQL schema from build plan.
        """
        tables = build_plan.get("database_tables", [])
        description = build_plan.get("description", "")
        app_name = build_plan.get("app_name", "my-app")

        prompt = f"""Generate PostgreSQL schema for this SaaS application.

App: {app_name}
Description: {description}

Tables needed:
{json.dumps(tables, indent=2)}

RULES:
- Use uuid_generate_v4() for primary keys
- Add created_at and updated_at timestamps to every table
- Add proper foreign key constraints
- Add RLS policies for Supabase
- Include CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
- Keep it clean and production-ready

Return ONLY valid SQL. No markdown, no explanations."""

        try:
            response = await self.ai.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                system_prompt="You are a senior database architect. Return only valid PostgreSQL SQL.",
                max_tokens=4000,
            )
            sql_content = response["content"].strip()
            # Clean markdown fences if present
            if sql_content.startswith("```"):
                lines = sql_content.split("\n")
                sql_content = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

            return {
                "files": [
                    {"path": "schema.sql", "content": sql_content, "type": "sql"}
                ],
                "tables_count": len(tables),
            }
        except Exception as e:
            logger.error(f"Database generation failed: {e}")
            return self._fallback_database(tables)

    async def generate_backend(self, build_plan: Dict[str, Any], schema_sql: str = "") -> Dict[str, Any]:
        """
        Task 3: BACKEND
        Generate API routes from build plan.
        """
        endpoints = build_plan.get("backend", {}).get("endpoints", [])
        app_name = build_plan.get("app_name", "my-app")

        prompt = f"""Create Next.js API route files for this application.

App: {app_name}
Database Schema: {schema_sql[:2000] if schema_sql else 'Standard CRUD tables'}

Endpoints to create:
{json.dumps(endpoints, indent=2)}

RULES:
- Use Next.js App Router format (route.ts with GET, POST, PUT, DELETE exports)
- Use Supabase client from '@/lib/supabase'
- Return proper JSON responses with error handling
- Use TypeScript
- Each endpoint is a separate file

Return a JSON object with this structure:
{{
  "files": [
    {{
      "path": "src/app/api/resource/route.ts",
      "content": "// full file content here",
      "type": "ts"
    }}
  ]
}}

Also include the Supabase client utility file:
{{
  "path": "src/lib/supabase.ts",
  "content": "// supabase client setup"
}}"""

        try:
            response = await self.ai.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                system_prompt="You are a senior backend engineer. Return only valid JSON with file contents.",
                response_format={"type": "json_object"},
                max_tokens=8192,
            )
            result = json.loads(response["content"])
            files = result.get("files", [])
            return {
                "files": files,
                "endpoints_count": len(files),
            }
        except Exception as e:
            logger.error(f"Backend generation failed: {e}")
            return self._fallback_backend(endpoints)

    async def generate_frontend(self, build_plan: Dict[str, Any], api_routes: List[str] = None) -> Dict[str, Any]:
        """
        Task 4: FRONTEND
        Generate Next.js pages and components.
        """
        pages = build_plan.get("frontend", {}).get("pages", [])
        app_name = build_plan.get("app_name", "my-app")
        app_type = build_plan.get("app_type", "saas_dashboard")
        features = build_plan.get("features", [])

        prompt = f"""Generate a complete Next.js frontend for this SaaS application.

App: {app_name}
Type: {app_type}
Features: {json.dumps(features, indent=2)}

Pages to create:
{json.dumps(pages, indent=2)}

API Routes available: {json.dumps(api_routes or [])}

RULES:
- Use Next.js App Router ('use client' where needed)
- Use Tailwind CSS for styling
- Create a modern, dark-mode SaaS dashboard aesthetic
- Use vibrant accent colors (indigo/violet/emerald gradients)
- Include responsive layouts
- Add loading states and empty states
- Use Lucide React for icons (import from 'lucide-react')
- Include the root layout.tsx with Inter font
- Include globals.css with Tailwind directives
- Each page and component is a SEPARATE file

Return a JSON object:
{{
  "files": [
    {{
      "path": "src/app/layout.tsx",
      "content": "// full file content",
      "type": "tsx"
    }},
    {{
      "path": "src/app/page.tsx",
      "content": "// dashboard page",
      "type": "tsx"
    }},
    {{
      "path": "src/components/ComponentName.tsx",
      "content": "// component content",
      "type": "tsx"
    }}
  ]
}}"""

        try:
            response = await self.ai.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                system_prompt="You are a senior frontend engineer specializing in Next.js and modern UI design. Return only valid JSON.",
                response_format={"type": "json_object"},
                max_tokens=8192,
            )
            result = json.loads(response["content"])
            files = result.get("files", [])
            return {
                "files": files,
                "pages_count": sum(1 for f in files if "/app/" in f.get("path", "") and f.get("path", "").endswith("page.tsx")),
                "components_count": sum(1 for f in files if "/components/" in f.get("path", "")),
            }
        except Exception as e:
            logger.error(f"Frontend generation failed: {e}")
            return self._fallback_frontend(pages, app_name)

    async def generate_integration(self, build_plan: Dict[str, Any], all_files: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Task 5: INTEGRATION
        Generate config/wiring files (package.json, next.config, tailwind.config, etc.)
        """
        app_name = build_plan.get("app_name", "my-app")

        package_json = json.dumps({
            "name": app_name,
            "version": "0.1.0",
            "private": True,
            "scripts": {
                "dev": "next dev",
                "build": "next build",
                "start": "next start",
                "lint": "next lint"
            },
            "dependencies": {
                "next": "14.2.0",
                "react": "^18",
                "react-dom": "^18",
                "@supabase/supabase-js": "^2.39.0",
                "lucide-react": "^0.300.0"
            },
            "devDependencies": {
                "typescript": "^5",
                "@types/node": "^20",
                "@types/react": "^18",
                "@types/react-dom": "^18",
                "tailwindcss": "^3.4.0",
                "postcss": "^8",
                "autoprefixer": "^10"
            }
        }, indent=2)

        next_config = """/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
"""

        tailwind_config = """/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: 'class',
};
"""

        postcss_config = """module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
"""

        tsconfig = json.dumps({
            "compilerOptions": {
                "target": "es5",
                "lib": ["dom", "dom.iterable", "esnext"],
                "allowJs": True,
                "skipLibCheck": True,
                "strict": True,
                "noEmit": True,
                "esModuleInterop": True,
                "module": "esnext",
                "moduleResolution": "bundler",
                "resolveJsonModule": True,
                "isolatedModules": True,
                "jsx": "preserve",
                "incremental": True,
                "plugins": [{"name": "next"}],
                "paths": {"@/*": ["./src/*"]}
            },
            "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
            "exclude": ["node_modules"]
        }, indent=2)

        env_local = """# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
"""

        config_files = [
            {"path": "package.json", "content": package_json, "type": "json"},
            {"path": "next.config.js", "content": next_config, "type": "js"},
            {"path": "tailwind.config.js", "content": tailwind_config, "type": "js"},
            {"path": "postcss.config.js", "content": postcss_config, "type": "js"},
            {"path": "tsconfig.json", "content": tsconfig, "type": "json"},
            {"path": ".env.local", "content": env_local, "type": "env"},
        ]

        return {
            "files": config_files,
            "config_count": len(config_files),
        }

    # --- Fallback generators ---

    def _fallback_database(self, tables: List[Dict]) -> Dict[str, Any]:
        """Fallback SQL when AI fails."""
        sql_parts = ['CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n']
        for table in tables:
            cols = []
            for col in table.get("columns", []):
                col_def = f"  {col['name']} {col['type']}"
                if col.get("primary"):
                    col_def += " PRIMARY KEY DEFAULT uuid_generate_v4()"
                elif not col.get("nullable", True):
                    col_def += " NOT NULL"
                cols.append(col_def)
            if not any(c["name"] == "created_at" for c in table.get("columns", [])):
                cols.append("  created_at TIMESTAMPTZ DEFAULT NOW()")
                cols.append("  updated_at TIMESTAMPTZ DEFAULT NOW()")
            sql_parts.append(f"CREATE TABLE {table['name']} (\n{','.join(cols)}\n);\n")
        return {
            "files": [{"path": "schema.sql", "content": "\n".join(sql_parts), "type": "sql"}],
            "tables_count": len(tables),
        }

    def _fallback_backend(self, endpoints: List[Dict]) -> Dict[str, Any]:
        """Fallback API routes when AI fails."""
        files = []
        # Supabase client
        files.append({
            "path": "src/lib/supabase.ts",
            "content": """import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
""",
            "type": "ts"
        })

        # Group endpoints by resource
        resources = {}
        for ep in endpoints:
            path = ep.get("path", "").replace("/api/", "")
            base = path.split("/")[0] if "/" in path else path
            if base not in resources:
                resources[base] = []
            resources[base].append(ep)

        for resource, eps in resources.items():
            methods = []
            for ep in eps:
                method = ep.get("method", "GET").upper()
                methods.append(f"""export async function {method}(request: Request) {{
  try {{
    return Response.json({{ message: "{ep.get('description', method + ' ' + resource)}" }});
  }} catch (error) {{
    return Response.json({{ error: "Internal server error" }}, {{ status: 500 }});
  }}
}}""")
            content = f"""import {{ supabase }} from '@/lib/supabase';

{chr(10).join(methods)}
"""
            files.append({
                "path": f"src/app/api/{resource}/route.ts",
                "content": content,
                "type": "ts"
            })

        return {"files": files, "endpoints_count": len(files)}

    def _fallback_frontend(self, pages: List[Dict], app_name: str) -> Dict[str, Any]:
        """Fallback frontend when AI fails."""
        files = []

        # Layout
        files.append({
            "path": "src/app/layout.tsx",
            "content": f"""import type {{ Metadata }} from 'next';
import './globals.css';

export const metadata: Metadata = {{
  title: '{app_name}',
  description: 'Built with Smartbuilder',
}};

export default function RootLayout({{ children }}: {{ children: React.ReactNode }}) {{
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-white min-h-screen">{{children}}</body>
    </html>
  );
}}
""",
            "type": "tsx"
        })

        # Globals CSS
        files.append({
            "path": "src/app/globals.css",
            "content": "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n",
            "type": "css"
        })

        # Pages
        for page in pages:
            path = page.get("path", "/")
            name = page.get("name", "Page")
            desc = page.get("description", "")

            if path == "/":
                file_path = "src/app/page.tsx"
            else:
                route = path.strip("/")
                file_path = f"src/app/{route}/page.tsx"

            files.append({
                "path": file_path,
                "content": f"""'use client';

export default function {name.replace(' ', '')}Page() {{
  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">{name}</h1>
        <p className="text-gray-400">{desc}</p>
      </div>
    </div>
  );
}}
""",
                "type": "tsx"
            })

        return {
            "files": files,
            "pages_count": len(pages),
            "components_count": 0,
        }
