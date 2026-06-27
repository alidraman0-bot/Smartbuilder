import { generateAIResponse } from "@/services/aiRouter";

export async function generateBusinessStrategy(idea: string) {
  const prompt = `You are a startup strategist.
Analyze the startup idea and generate a business strategy.
Return JSON:
{
"target_market": "",
"customer_segments": [],
"problem_statement": "",
"value_proposition": "",
"monetization": "",
"pricing_model": "",
"go_to_market": [],
"growth_strategy": [],
"competitive_advantage": ""
}

Idea:
${idea}
`;

  const response = await generateAIResponse({ prompt, mode: "deep" });

  if (response?.error) {
    throw new Error("Failed to generate business strategy: " + (response.message || response.raw));
  }

  return response;
}
