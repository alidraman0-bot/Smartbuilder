const { Sandbox } = require('@e2b/code-interpreter');
require('dotenv').config({ path: '../.env' });

class BuildEngine {
  constructor() {
    this.apiKey = process.env.E2B_API_KEY;
  }

  /**
   * Run build in a sandboxed environment
   */
  async build(repoUrl, frameworkConfig) {
    if (!this.apiKey) {
      console.warn('E2B_API_KEY missing, falling back to local build (limited)');
      return this.localBuild(repoUrl, frameworkConfig);
    }

    try {
      console.log(`Starting sandboxed build for ${repoUrl}...`);
      const sandbox = await Sandbox.create({
        apiKey: this.apiKey,
      });

      // 1. Clone the repository
      // If repo is private, we'd need to inject the GITHUB_TOKEN into the URL
      const repoUrlWithAuth = process.env.GITHUB_TOKEN 
        ? repoUrl.replace('https://', `https://x-access-token:${process.env.GITHUB_TOKEN}@`)
        : repoUrl;

      await sandbox.commands.run(`git clone ${repoUrlWithAuth} repo`);
      
      // 2. Install dependencies
      console.log('Installing dependencies...');
      const installResult = await sandbox.commands.run('cd repo && npm install');
      
      // 3. Run build
      console.log(`Running build command: ${frameworkConfig.buildCommand}...`);
      const buildResult = await sandbox.commands.run(`cd repo && ${frameworkConfig.buildCommand}`);

      // 4. Download built files
      // We need to zip the output directory and download it
      const outputDir = frameworkConfig.outputDir || 'dist';
      await sandbox.commands.run(`cd repo && zip -r ../output.zip ${outputDir}`);
      const zipContent = await sandbox.downloadFile('/home/user/output.zip');

      await sandbox.close();

      return {
        success: buildResult.exitCode === 0,
        logs: [...installResult.stdout, ...installResult.stderr, ...buildResult.stdout, ...buildResult.stderr],
        artifact: zipContent, // Buffer
      };
    } catch (error) {
      console.error('Sandboxed build failed:', error);
      throw error;
    }
  }

  async localBuild(repoUrl, frameworkConfig) {
    // Simple mock or local child_process build for development
    return {
      success: false,
      logs: ['Local build not fully implemented. Please provide E2B_API_KEY.'],
    };
  }
}

module.exports = new BuildEngine();
