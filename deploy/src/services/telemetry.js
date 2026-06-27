const EventEmitter = require('events');
const clickhouse = require('./clickhouse');

class TelemetryService extends EventEmitter {
  constructor() {
    super();
    this.bus = this;
  }

  /**
   * Ingest system metrics, persist, evaluate alerts, and stream
   */
  async ingestMetric(metric) {
    const record = {
      timestamp: metric.timestamp || new Date().toISOString(),
      project_id: metric.project_id || 'proj_default',
      deployment_id: metric.deployment_id || 'dep_init_4a8b',
      latency_ms: metric.latency_ms || 0,
      error_rate: metric.error_rate || 0,
      requests_count: metric.requests_count || 1,
      cpu_usage: metric.cpu_usage || 0,
      memory_usage: metric.memory_usage || 0,
      bandwidth_kb: metric.bandwidth_kb || 0,
      active_users: metric.active_users || 0
    };

    const persisted = await clickhouse.insert('metrics', record);
    
    // Broadcast to real-time streams
    this.emit('metric', persisted);
    this.emit('telemetry', { type: 'metric', data: persisted });

    // Run alert check pipeline asynchronously
    const alertsService = require('./alerts');
    alertsService.evaluateMetricAlerts(persisted);

    return persisted;
  }

  /**
   * Ingest system logs, persist, and stream
   */
  async ingestLog(log) {
    const record = {
      timestamp: log.timestamp || new Date().toISOString(),
      project_id: log.project_id || 'proj_default',
      deployment_id: log.deployment_id || 'dep_init_4a8b',
      module: log.module || 'SYSTEM',
      level: log.level || 'info',
      message: log.message
    };

    const persisted = await clickhouse.insert('logs', record);
    
    this.emit('log', persisted);
    this.emit('telemetry', { type: 'log', data: persisted });

    // Run log analysis if it's a critical error
    if (record.level === 'error' || record.level === 'critical') {
      const anomalyPipeline = require('../workflows/anomalyPipeline');
      anomalyPipeline.runLogCheck(persisted);
    }

    return persisted;
  }

  /**
   * Ingest distributed request traces, persist, and stream
   */
  async ingestTrace(trace) {
    const record = {
      timestamp: trace.timestamp || new Date().toISOString(),
      project_id: trace.project_id || 'proj_default',
      deployment_id: trace.deployment_id || 'dep_init_4a8b',
      trace_id: trace.trace_id || `tr_${Math.random().toString(36).substring(2, 10)}`,
      name: trace.name,
      duration_ms: trace.duration_ms || 0,
      parent_span_id: trace.parent_span_id || null,
      status: trace.status || 'success'
    };

    const persisted = await clickhouse.insert('traces', record);
    
    this.emit('trace', persisted);
    this.emit('telemetry', { type: 'trace', data: persisted });

    return persisted;
  }

  /**
   * Ingest operational events, persist, and stream
   */
  async ingestEvent(event) {
    const record = {
      timestamp: event.timestamp || new Date().toISOString(),
      project_id: event.project_id || 'proj_default',
      event_type: event.event_type,
      details: event.details
    };

    const persisted = await clickhouse.insert('events', record);
    
    this.emit('event', persisted);
    this.emit('telemetry', { type: 'event', data: persisted });

    return persisted;
  }

  /**
   * Ingest payment observability events, persist, and stream
   */
  async ingestPayment(payment) {
    const record = {
      timestamp: payment.timestamp || new Date().toISOString(),
      amount: payment.amount || 0,
      currency: payment.currency || 'USD',
      status: payment.status || 'success',
      provider: payment.provider || 'Paystack',
      customer_email: payment.customer_email || 'anonymous@smartbuilder.io',
      type: payment.type || 'Subscription Payment',
      country: payment.country || 'NG'
    };

    const persisted = await clickhouse.insert('payments', record);
    
    this.emit('payment', persisted);
    this.emit('telemetry', { type: 'payment', data: persisted });

    return persisted;
  }
}

module.exports = new TelemetryService();
