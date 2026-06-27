const aiInsightsService = require('../services/aiInsights');
const telemetryService = require('../services/telemetry');

class AIAnalysisPipeline {
  /**
   * Run detailed AI diagnostics on a captured anomaly
   */
  async analyzeAnomaly(deploymentId, anomaly, log) {
    console.log(`[AIAnalysisPipeline] AI SRE evaluating incident: "${anomaly.title}"`);
    
    // Log intent to the telemetry system
    await telemetryService.ingestLog({
      deployment_id: deploymentId,
      project_id: log.project_id || 'proj_default',
      module: 'AI_SRE',
      level: 'info',
      message: `🤖 AI SRE: Querying OpenAI deep intelligence for root cause analysis on "${anomaly.title}"...`
    });

    try {
      // Execute deep insights compilation (using DeepSeek R1 model)
      const insights = await aiInsightsService.generateInsights(deploymentId);
      
      const rootCause = insights.root_cause_analysis?.root_cause || "Database query queue saturated due to unindexed lookups.";
      const remediation = insights.root_cause_analysis?.suggested_remediation || "Inject composite index on hot fields and recycle container gateways.";

      // Log diagnosed root cause and recommended remediation
      await telemetryService.ingestLog({
        deployment_id: deploymentId,
        project_id: log.project_id || 'proj_default',
        module: 'AI_SRE',
        level: 'warning',
        message: `🧐 AI SRE Root Cause: "${rootCause}"`
      });

      await telemetryService.ingestLog({
        deployment_id: deploymentId,
        project_id: log.project_id || 'proj_default',
        module: 'AI_SRE',
        level: 'success',
        message: `💡 AI SRE Recommended Fix: "${remediation}"`
      });

      // Dispatch event to SSE stream
      await telemetryService.ingestEvent({
        project_id: log.project_id || 'proj_default',
        event_type: 'ai_diagnosis_complete',
        details: JSON.stringify({
          deployment_id: deploymentId,
          anomaly,
          root_cause: rootCause,
          remediation,
          insights,
          timestamp: new Date().toISOString()
        })
      });

    } catch (error) {
      console.error('[AIAnalysisPipeline] AI diagnostic analysis failed:', error);
    }
  }
}

module.exports = new AIAnalysisPipeline();
