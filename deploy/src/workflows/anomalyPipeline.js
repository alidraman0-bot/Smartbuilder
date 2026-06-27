// deploy/src/workflows/anomalyPipeline.js
const telemetryService = require('../services/telemetry');
const alertsService = require('../services/alerts');
const aiAnalysisPipeline = require('./aiAnalysisPipeline');
const alertPipeline = require('./alertPipeline');

/**
 * Detects anomalies in metric telemetry and triggers remediation pipelines.
 * Called by AlertsService when a critical latency or error-rate breach occurs.
 */
async function runAnomalyCheck(metric) {
  // Simple rule: if latency > 450ms or error_rate > 5% trigger AI analysis
  if (metric.latency_ms >= 450 || metric.error_rate >= 0.05) {
    // Emit an internal alert event for any listeners
    telemetryService.emit('alert', { type: 'anomaly', data: metric });

    // Run AI analysis pipeline for deeper insight and possible remediation
    if (aiAnalysisPipeline && typeof aiAnalysisPipeline.analyzeDeployment === 'function') {
      await aiAnalysisPipeline.analyzeDeployment(metric.deployment_id);
    }

    // Dispatch to the generic alert pipeline which will forward to UI/Webhooks
    if (alertPipeline && typeof alertPipeline.dispatch === 'function') {
      await alertPipeline.dispatch(metric);
    }
  }
}

module.exports = { runAnomalyCheck };
