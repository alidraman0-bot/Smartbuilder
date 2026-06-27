const telemetryService = require('../services/telemetry');

class AlertPipeline {
  /**
   * Dispatches alerts to event streams and triggers Slack/Webhook hooks
   */
  async dispatch(alertLog) {
    console.log(`[AlertPipeline] Dispatching active alert: [${alertLog.level.toUpperCase()}] ${alertLog.message}`);
    
    // Ingest operational event for alert broadcast
    await telemetryService.ingestEvent({
      project_id: alertLog.project_id || 'proj_default',
      event_type: 'alert_triggered',
      details: JSON.stringify({
        level: alertLog.level,
        message: alertLog.message,
        deployment_id: alertLog.deployment_id,
        timestamp: new Date().toISOString()
      })
    });
  }
}

module.exports = new AlertPipeline();
