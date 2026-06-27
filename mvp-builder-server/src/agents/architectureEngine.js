const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function designArchitecture(prd) {
  try {
    const prompt = `You are a Senior Cloud and Software Architect.
Given the following Product Requirements Document (PRD), design the system architecture.

PRD:
${JSON.stringify(prd, null, 2)}

Provide your output as strict JSON with these keys:
- frontendTech: framework (e.g. Next.js, React)
- backendTech: framework/language
- databaseSchema: proposed tables and schemas
- apiRoutes: proposed REST or GraphQL endpoints
- systemDesign: a brief architecture description
`;

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    });

    // We assume the response is JSON-parseable.
    // Anthropic sometimes adds markdown formatting, so we might need to clean it.
    let content = response.content[0].text;
    if (content.startsWith("\`\`\`json")) {
        content = content.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    } else if (content.startsWith("\`\`\`")) {
        content = content.replace(/\`\`\`/g, "").trim();
    }

    const architecture = JSON.parse(content);
    return architecture;
  } catch (error) {
    console.error("Claude Architecture Engine failed:", error);
    throw new Error("ARCHITECTURE_FAILED: " + error.message);
  }
}

module.exports = { designArchitecture };
