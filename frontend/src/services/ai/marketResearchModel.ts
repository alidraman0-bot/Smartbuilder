import { generateWithFallback } from "./fallbackRouter";

export async function analyzeMarketIntelligence(signals: any) {
  const prompt = `
You are a world-class institutional market intelligence analyst.

Analyze all collected internet signals and generate:
- investor-grade market research
- market opportunities
- forecasting
- competitive intelligence
- pricing intelligence
- strategic recommendations
- customer intelligence

Focus ONLY on:
- real-world signals
- measurable demand
- verified trends
- customer pain points
- investment attractiveness

DO NOT hallucinate statistics.

If confidence is low:
- explicitly say so

Return structured JSON only matching exactly this format:
{
  "executive_summary": "",
  "market_size": {
    "tam": "",
    "sam": "",
    "som": "",
    "cagr": ""
  },
  "industry_trends": [],
  "competitors": [],
  "customer_segments": [],
  "pain_points": [],
  "pricing_analysis": [],
  "market_gaps": [],
  "growth_forecast": [],
  "investment_analysis": {},
  "swot": {
    "strengths": [],
    "weaknesses": [],
    "opportunities": [],
    "threats": []
  },
  "risk_analysis": [],
  "strategic_recommendations": [],
  "sources_used": [],
  "confidence_score": 0
}

Here are the signals to analyze:
${JSON.stringify(signals, null, 2)}
`;

  const response = await generateWithFallback([
    { role: "system", content: "You are an institutional market intelligence analyst. Return only JSON." },
    { role: "user", content: prompt }
  ]);

  if (!response.success) {
    console.error("AI fallback failed:", response.error);
    throw new Error(response.error || "AI fallback failed");
  }

  let content = response.content;
  if (!content) {
    throw new Error("AI returned empty content for market intelligence analysis.");
  }
  try {
      return JSON.parse(content.trim());
  } catch(e) {
      console.error("Error parsing AI response JSON in analyzeMarketIntelligence");
      throw new Error("Failed to parse market intelligence model output.");
  }
}
