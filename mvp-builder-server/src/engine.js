const { analyzeIdea } = require('./agents/planningEngine');
const { designArchitecture } = require('./agents/architectureEngine');
const { generateCodebase } = require('./agents/generationEngine');
const { enhanceFeatures } = require('./agents/enhancementEngine');
const { deployToSandbox } = require('./agents/executionRuntime');
const { diagnoseAndFix } = require('./agents/debugAgent');

async function buildMVP(userIdea) {
  console.log("Starting buildMVP pipeline for idea:", userIdea);
  let status = "Analyzing";
  
  let result = { plan: null, architecture: null, app: null, preview_url: null, status: null };

  const stages = [
    { name: "Analyze", action: async () => { result.plan = await analyzeIdea(userIdea); } },
    { name: "Design", action: async () => { result.architecture = await designArchitecture(result.plan); } },
    { name: "Generate & Scaffold", action: async () => { result.app = await generateCodebase(result.plan, result.architecture); } },
    { name: "Optimize", action: async () => { await enhanceFeatures(result.app, "Apply premium aesthetics"); } },
    { name: "Deploy", action: async () => { 
        const deployRes = await deployToSandbox(result.app.projectDir); 
        result.preview_url = deployRes.previewUrl; 
    } }
  ];

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    status = stage.name;
    console.log(`[Engine] Running Stage: ${stage.name}`);

    let attemptCount = 0;
    let success = false;

    while (!success) {
      try {
        await stage.action();
        success = true;
      } catch (err) {
        console.error(`[Engine] Error in ${stage.name}:`, err.message);
        // Step 7: Verify (Self-repair loop)
        const debugContext = { stage: stage.name, message: err.message };
        const fixResult = await diagnoseAndFix(debugContext, attemptCount);
        attemptCount = fixResult.nextAttempt;
      }
    }
  }

  result.status = "Deployed";
  console.log("buildMVP pipeline complete.");
  return result;
}

async function improveMVP(existingApp, instruction) {
  console.log(`Starting improveMVP for project ${existingApp.projectName}...`);
  // triggers targeted refinement via Gemini or Claude
  await enhanceFeatures(existingApp, instruction);
  console.log("Redeploying...");
  const deployRes = await deployToSandbox(existingApp.projectDir);
  return { status: "Updated", preview_url: deployRes.previewUrl };
}

module.exports = { buildMVP, improveMVP };
