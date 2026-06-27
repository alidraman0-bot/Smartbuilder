const githubService = require('../services/github');
const detector = require('../services/detector');
const buildEngine = require('../services/buildEngine');
const cloudflare = require('../services/cloudflare');
const logAnalyzer = require('../services/logAnalyzer');
const aiEngine = require('../services/aiEngine');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

class DeployPipeline {
  /**
   * Run the full deployment pipeline
   */
  async run(projectId, repoUrl) {
    let deploymentId = null;
    try {
      // 1. Initialize Deployment Record
      const { data: deployment, error: depError } = await supabase
        .from('deployments')
        .insert([{ project_id: projectId, status: 'building', logs: [] }])
        .select()
        .single();

      if (depError) throw depError;
      deploymentId = deployment.id;

      logAnalyzer.addLog(deploymentId, '🚀 Starting deployment pipeline...');

      // 2. Extract Owner/Repo from URL
      const parts = repoUrl.replace('https://github.com/', '').split('/');
      const owner = parts[0];
      const repo = parts[1];

      // 3. Detect Framework
      logAnalyzer.addLog(deploymentId, '🔍 Detecting framework...');
      const frameworkConfig = await detector.detect(owner, repo);
      logAnalyzer.addLog(deploymentId, `✅ Detected framework: ${frameworkConfig.framework}`);

      // 4. Run Build in Sandbox
      logAnalyzer.addLog(deploymentId, '🏗️  Starting sandboxed build...');
      const buildResult = await buildEngine.build(repoUrl, frameworkConfig);
      
      buildResult.logs.forEach(log => logAnalyzer.addLog(deploymentId, log));

      if (!buildResult.success) {
        throw new Error('Build failed');
      }

      // 5. Deploy to Cloudflare
      logAnalyzer.addLog(deploymentId, '🌥️  Deploying to Cloudflare Pages...');
      // Extract build output from zip buffer (we'd need to unzip it locally first)
      const buildDir = await this.prepareBuildDir(deploymentId, buildResult.artifact);
      
      const deployResult = await cloudflare.deploy(repo, buildDir);
      logAnalyzer.addLog(deploymentId, `✅ Live! URL: ${deployResult.url}`);

      // 6. Finalize Deployment Record
      await supabase
        .from('deployments')
        .update({ 
          status: 'success', 
          url: deployResult.url, 
          logs: logAnalyzer.getLogs(deploymentId) 
        })
        .eq('id', deploymentId);

      return { status: 'success', url: deployResult.url, deployment_id: deploymentId };

    } catch (error) {
      console.error('Pipeline error:', error);
      if (deploymentId) {
        logAnalyzer.addLog(deploymentId, `❌ Error: ${error.message}`);
        
        // Trigger Auto-Fix Pipeline
        const autoFixPipeline = require('./autoFixPipeline');
        return await autoFixPipeline.run(projectId, deploymentId, logAnalyzer.getLogs(deploymentId));
      }
      throw error;
    }
  }

  async prepareBuildDir(deploymentId, artifactBuffer) {
    // In a real system, we'd unzip the buffer to a temp directory
    const path = require('path');
    const fs = require('fs');
    const tempDir = path.join(process.cwd(), 'tmp', deploymentId);
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    // For this prototype, we'll just mock the directory structure 
    // or use a mock path if we're in a restricted environment
    const zipPath = path.join(tempDir, 'output.zip');
    fs.writeFileSync(zipPath, artifactBuffer);
    
    // In real usage: spawn('unzip', [zipPath, '-d', tempDir])
    return tempDir;
  }
}

module.exports = new DeployPipeline();
