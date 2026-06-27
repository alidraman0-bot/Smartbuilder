export async function generateAIResponse({ prompt, mode = "basic" }: { prompt: string, mode?: string }) {
  const models = [
    "openai/gpt-4.1-mini",
    "google/gemini-2.5-flash",
    "deepseek/deepseek-chat"
  ];

  const apiHost = typeof window !== "undefined"
    ? ""
    : (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000");

  try {
    console.log("API CALLED - Native Multi-Provider Routing", models);
    const res = await fetch(`${apiHost}/api/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        models: models,
        messages: [
          {
            role: "system",
            content: "You are a world-class AI system. Always return valid JSON only. Do not wrap in markdown blocks, just return raw JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;

    console.log(`MODEL RESPONSE (via provider: ${data.provider || 'unknown'}, model: ${data.model || 'unknown'}):`, text);

    if (!text) throw new Error("Empty response");

    const parsed = parseJSON(text);
    return {
      ...parsed,
      _metadata: {
        model: data.model,
        provider: data.provider
      }
    };

  } catch (err) {
    console.error("Multi-provider routing API failed:", err);
    return {
      error: true,
      message: "All models failed"
    };
  }
}

function parseJSON(text: string) {
  try {
    // Sometimes models return wrapped in markdown code blocks like ```json ... ```
    // So let's try to clean it first
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
    }
    return JSON.parse(cleaned);
  } catch (err) {
    return {
      error: true,
      raw: text
    };
  }
}
