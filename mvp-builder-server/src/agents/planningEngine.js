const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeIdea(userIdea) {
  try {
    const prompt = `You are a product management AI. 
Analyze the following user idea and generate a structured Product Requirements Document (PRD).

User Idea: 
${userIdea}

Output the PRD in strict JSON format with the following keys:
- title: Application name
- targetAudience: Who the app is for
- coreFeatures: Array of core features
- dataModels: Expected entities (e.g. Users, Posts)
- userFlow: Step by step flow of the primary use case
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const prd = JSON.parse(completion.choices[0].message.content);
    return prd;
  } catch (error) {
    console.error("OpenAI Planning Engine failed:", error);
    throw new Error("PLANNING_FAILED: " + error.message);
  }
}

module.exports = { analyzeIdea };
