const clickhouse = require('./clickhouse');

class MonitoringService {
  constructor() {
    this.shutdownDeployments = new Set();
  }

  async recordTelemetry(payload) {
    const telemetry = require('./telemetry');
    telemetry.emit('telemetry', payload);
    return { recorded: true };
  }

  /**
   * Return high-level infrastructure overview
   */
  async getOverviewStats(deploymentId) {
    const metricsService = require('./metrics');
    const alertsService = require('./alerts');
    
    const summary = await metricsService.getMetricsSummary(deploymentId);
    const activeAlerts = await alertsService.getActiveAlerts(deploymentId);

    // If shutdown, return offline status
    if (this.shutdownDeployments.has(deploymentId)) {
      return {
        deployment_id: deploymentId,
        health_status: 'critical',
        uptime: 0.0,
        response_time_ms: 0,
        error_rate: 100.0,
        requests_count: 0,
        pulse_summary: 'System Offline: Environment terminated by admin.',
        alerts: ['CRITICAL: SYSTEM SHUTDOWN - Environment resources terminated']
      };
    }

    return {
      ...summary,
      alerts: activeAlerts
    };
  }

  /**
   * Execute structural remediation actions on deployments
   */
  async handleAction(deploymentId, action) {
    const now = new Date().toISOString();
    
    // Log action to ClickHouse events
    await clickhouse.insert('events', {
      timestamp: now,
      project_id: 'proj_default',
      event_type: 'monitor_action',
      details: `Operator triggered action: ${action} on deployment ${deploymentId}`
    });

    // Write logs to console/ClickHouse
    await clickhouse.insert('logs', {
      timestamp: now,
      project_id: 'proj_default',
      deployment_id: deploymentId,
      module: 'SRE_EXEC',
      level: 'warning',
      message: `OPERATIONAL INTERVENTION: Running execution hook for action: ${action}`
    });

    if (action === 'shutdown') {
      this.shutdownDeployments.add(deploymentId);
      
      await clickhouse.insert('logs', {
        timestamp: now,
        project_id: 'proj_default',
        deployment_id: deploymentId,
        module: 'SRE_EXEC',
        level: 'critical',
        message: 'SYSTEM DOWN: Disconnected edge gateways and spun down 4 compute clusters.'
      });

      return {
        status: 'success',
        message: 'Irreversible environment termination processed successfully.',
        timestamp: now
      };
    }

    if (action === 'restart' || action === 'iterate') {
      // Simulate rolling restart
      await clickhouse.insert('logs', {
        timestamp: now,
        project_id: 'proj_default',
        deployment_id: deploymentId,
        module: 'SRE_EXEC',
        level: 'info',
        message: 'Rolling restart initiated for Edge Gateway router containers...'
      });

      setTimeout(async () => {
        await clickhouse.insert('logs', {
          timestamp: new Date().toISOString(),
          project_id: 'proj_default',
          deployment_id: deploymentId,
          module: 'SRE_EXEC',
          level: 'success',
          message: 'All containers restarted. DB pool fully re-allocated. Uptime restored.'
        });
      }, 3000);

      return {
        status: 'success',
        message: 'Rolling gateway restart triggered.',
        timestamp: now
      };
    }

    return {
      status: 'error',
      message: `Action ${action} not recognized.`
    };
  }
}

module.exports = new MonitoringService();
