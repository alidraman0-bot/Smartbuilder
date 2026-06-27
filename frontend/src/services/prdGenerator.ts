import { generateAIResponse } from "@/services/aiRouter";

export async function generatePRD(idea: string, strategy: any) {
  const prompt = `You are a senior product manager and system architect.
Based on the startup idea and business strategy, generate a complete PRD.
Return JSON strictly representing this structure:
{
  "product_name": "",
  "overview": "",
  "objectives": [],
  "users": [],
  "features": [],
  "user_flows": [],
  "core_logic": "",
  "edge_cases": [],
  "tech_requirements": {
    "frontend": "",
    "backend": "",
    "database": ""
  },
  "non_functional_requirements": {
    "scalability": "",
    "security": "",
    "performance": ""
  }
}

Idea:
${idea}

Business Strategy:
${JSON.stringify(strategy, null, 2)}
`;

  const response = await generateAIResponse({ prompt, mode: "deep" });

  if (response?.error) {
    throw new Error("Failed to generate PRD: " + (response.message || response.raw));
  }

  return response;
}
