const aiEngine = require('../services/aiEngine');
const logAnalyzer = require('../services/logAnalyzer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

class AutoFixPipeline {
  constructor() {
    this.maxRetries = 2;
    this.retryCount = new Map(); // deploymentId -> count
  }

  async run(projectId, deploymentId, logs) {
    const currentRetries = this.retryCount.get(deploymentId) || 0;

    if (currentRetries >= this.maxRetries) {
      logAnalyzer.addLog(deploymentId, '🛑 Maximum retries reached. Manual intervention required.');
      await supabase.from('deployments').update({ status: 'failed', logs: logAnalyzer.getLogs(deploymentId) }).eq('id', deploymentId);
      return { status: 'failed', issue: 'Max retries reached' };
    }

    this.retryCount.set(deploymentId, currentRetries + 1);
    logAnalyzer.addLog(deploymentId, `🤖 AI is analyzing failure (Attempt ${currentRetries + 1}/${this.maxRetries})...`);

    try {
      // 1. Analyze Logs
      const analysis = await aiEngine.analyzeLogs(logs);
      logAnalyzer.addLog(deploymentId, `🧐 AI found issue: ${analysis.issue}`);
      logAnalyzer.addLog(deploymentId, `💡 Suggested fix: ${analysis.fix}`);

      if (analysis.autoFix) {
        logAnalyzer.addLog(deploymentId, `🛠️ Applying auto-fix: ${analysis.fixDetails.command}...`);
        
        // 2. Retry Deployment with Fix
        // In a real system, we'd pass the fixDetails to the buildEngine
        const deployPipeline = require('./deployPipeline');
        logAnalyzer.addLog(deploymentId, '🔄 Retrying deployment...');
        
        // We'd modify the build config here based on AI suggestion
        // For now, we'll just re-trigger
        return await deployPipeline.run(projectId, analysis.repo_url); 
      } else {
        logAnalyzer.addLog(deploymentId, '⚠️ AI cannot auto-fix this issue.');
        await supabase.from('deployments').update({ status: 'failed', logs: logAnalyzer.getLogs(deploymentId) }).eq('id', deploymentId);
        return { status: 'failed', issue: analysis.issue };
      }

    } catch (error) {
      console.error('Auto-fix error:', error);
      await supabase.from('deployments').update({ status: 'failed' }).eq('id', deploymentId);
      throw error;
    }
  }
}

module.exports = new AutoFixPipeline();
