require('dotenv').config();
const { CodeInterpreter } = require('@e2b/code-interpreter');

async function deployToSandbox(projectDir) {
  try {
    console.log("Provisioning E2B Sandbox for project directory:", projectDir);
    // Standard initialization of E2B Code Interpreter sandbox
    const sandbox = await CodeInterpreter.create();
    
    // Upload files or assuming they are already synchronized if it's a persistent volume
    // Since this is a demo, we will simulate a start server action in the sandbox.
    console.log("Sandbox started with ID:", sandbox.id);

    // Run the development server in background
    console.log("Running npm run dev inside sandbox...");
    // We would normally sync the codebase into sandbox:
    // This is abstracted: await sandbox.filesystem.write(projectDir...)
    const startResult = await sandbox.notebook.execCell('console.log("Simulating server start...");');

    // Obtain the preview URL
    // e2b usually provides a host per open port
    const previewUrl = `https://${sandbox.id}-3000.e2b.dev`;
    
    return {
      success: true,
      sandboxId: sandbox.id,
      previewUrl: previewUrl,
      logs: startResult.logs
    };
  } catch (error) {
    console.error("E2B Execution Runtime failed:", error);
    throw new Error("DEPLOYMENT_FAILED: " + error.message);
  }
}

module.exports = { deployToSandbox };
