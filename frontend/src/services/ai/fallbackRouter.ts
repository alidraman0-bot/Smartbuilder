import { apiClient } from "./apiClient";

// Curated list of models that are known to be stable and have sufficient rate limits.
export const MARKET_RESEARCH_MODELS = [
  "openai/gpt-4.1",
  "openai/gpt-4.1-mini"
];

export async function generateWithFallback(messages: any[]) {
  const maxRetries = 3;
  for (const model of MARKET_RESEARCH_MODELS) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const completion = await apiClient.chat.completions.create({
          model,
          messages,
          temperature: 0.2,
          max_tokens: 5000
        });

        const content = completion?.choices?.[0]?.message?.content;
        if (!content) { attempt++; continue; }

        // Extract JSON if needed
        let parsed = null;
        if (content.includes('{') || content.includes('```json')) {
          let jsonStr = content;
          if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0];
          } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0];
          }
          try {
            parsed = JSON.parse(jsonStr.trim());
          } catch (e) {
            console.error(`Model ${model} produced invalid JSON, skipping`);
            // Skip this model entirely on JSON parse error
            break;
          }
        }

        return {
          success: true,
          model,
          content: parsed ? JSON.stringify(parsed) : content
        };
      } catch (error: any) {
        // Handle rate limiting (429) with exponential back‑off.
        if (error?.code === 429) {
          const wait = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          console.warn(`Rate limited on ${model}, retrying in ${wait}ms`);
          await new Promise(res => setTimeout(res, wait));
          attempt++;
          continue;
        }
        // Skip models that return 404 (not found) or other client errors.
        if (error?.code === 404) {
          console.warn(`Model ${model} not available (404), skipping.`);
          break; // move to next model
        }
        console.error("Model failed:", model, error);
        break; // move to next model on other errors
      }
    }
  }

    // If all models exhausted without success, return a failure object instead of throwing.
    return { success: false, error: 'All market research models failed.' };
}


