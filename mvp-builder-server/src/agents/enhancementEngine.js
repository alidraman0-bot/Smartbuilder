const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function enhanceFeatures(projectState, instructions) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a Senior UI/UX Developer and Optimization Expert.
We have an existing project state. Please provide an array of specific file patches or optimizations to implement the latest UI/UX trends and the following enhancement instructions.

Project State metadata: ${JSON.stringify(projectState)}
Instructions: ${instructions || "Enhance visual aesthetics, performance, and add micro-animations."}

Output MUST be valid JSON matching this schema:
{
  "optimizations": [
    {
      "filePath": "string",
      "instruction": "string"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let content = response.text();
    
    if (content.startsWith("\`\`\`json")) {
        content = content.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    } else if (content.startsWith("\`\`\`")) {
        content = content.replace(/\`\`\`/g, "").trim();
    }

    const enhancements = JSON.parse(content);
    return enhancements;
  } catch (error) {
    console.error("Gemini Enhancement Engine failed:", error);
    throw new Error("ENHANCEMENT_FAILED: " + error.message);
  }
}

module.exports = { enhanceFeatures };
