const clickhouse = require('./clickhouse');

class AlertsService {
  constructor() {
    this.activeAlerts = [];
  }

  /**
   * Evaluate freshly ingested metrics against SLA thresholds
   */
  async evaluateMetricAlerts(metric) {
    const alerts = [];
    const now = new Date().toISOString();

    // 1. Latency Threshold Checks
    if (metric.latency_ms >= 500) {
      alerts.push({
        type: 'critical',
        message: `CRITICAL: Latency breached SLA limit: ${metric.latency_ms}ms (Threshold: 500ms)`
      });
    } else if (metric.latency_ms >= 300) {
      alerts.push({
        type: 'warning',
        message: `WARNING: Elevated P95 latency detected: ${metric.latency_ms}ms`
      });
    }

    // 2. Error Rate Threshold Checks
    if (metric.error_rate >= 0.05) {
      alerts.push({
        type: 'critical',
        message: `CRITICAL: Server error rate spiked to ${(metric.error_rate * 100).toFixed(2)}%`
      });
    } else if (metric.error_rate >= 0.015) {
      alerts.push({
        type: 'warning',
        message: `WARNING: Elevated server error rate: ${(metric.error_rate * 100).toFixed(2)}%`
      });
    }

    // 3. System Load Checks
    if (metric.cpu_usage >= 90) {
      alerts.push({
        type: 'warning',
        message: `WARNING: High CPU load on primary container node: ${metric.cpu_usage}%`
      });
    }

    // Process new alerts
    for (const alert of alerts) {
      // Check if we already logged this alert recently to avoid spam
      const exists = this.activeAlerts.some(a => a.message === alert.message);
      if (!exists) {
        const persisted = {
          timestamp: now,
          project_id: metric.project_id,
          deployment_id: metric.deployment_id,
          module: 'ALERTER',
          level: alert.type === 'critical' ? 'critical' : 'warning',
          message: alert.message
        };

        await clickhouse.insert('logs', persisted);
        this.activeAlerts.push(alert);

        // Keep alerts bounded
        if (this.activeAlerts.length > 20) this.activeAlerts.shift();

        // Dispatch trigger workflow
        const alertPipeline = require('../workflows/alertPipeline');
        alertPipeline.dispatch(persisted);

        // Trigger self-healing if critical DB latency spike occurs
        if (alert.message.includes('SLA limit') && metric.latency_ms >= 450) {
          const anomalyPipeline = require('../workflows/anomalyPipeline');
          anomalyPipeline.triggerAutoRemediation(metric.deployment_id, 'latency_spike');
        }
      }
    }

    // Clear resolved alerts
    if (metric.latency_ms < 250 && metric.error_rate < 0.005) {
      this.activeAlerts = [];
    }
  }

  async getActiveAlerts(deploymentId) {
    // Return all warning/critical logs in last 10 minutes
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    const logs = clickhouse.select('logs', r => 
      r.deployment_id === deploymentId && 
      (r.level === 'warning' || r.level === 'error' || r.level === 'critical') && 
      new Date(r.timestamp) >= tenMinAgo
    );
    
    return logs.map(l => l.message);
  }
}

module.exports = new AlertsService();
