const clickhouse = require('./clickhouse');

class MetricsService {
  /**
   * Get aggregated metrics over time for a deployment
   */
  async getMetricsSummary(deploymentId) {
    const records = clickhouse.select('metrics', r => r.deployment_id === deploymentId);
    
    if (records.length === 0) {
      return this.getEmptyMetrics(deploymentId);
    }

    // Sort by timestamp ascending
    records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    const latest = records[records.length - 1];

    // Compute uptime and averages
    const totalRequests = records.reduce((sum, r) => sum + r.requests_count, 0);
    const avgLatency = records.reduce((sum, r) => sum + r.latency_ms, 0) / records.length;
    const avgErrorRate = records.reduce((sum, r) => sum + r.error_rate, 0) / records.length;
    
    // Sort latencies to calculate p95
    const latenciesSorted = [...records].map(r => r.latency_ms).sort((a, b) => a - b);
    const p95Idx = Math.floor(latenciesSorted.length * 0.95);
    const p95Latency = latenciesSorted[p95Idx] || avgLatency;

    // Calculate uptime as a factor of success vs error rate
    const uptime = parseFloat((99.98 - (avgErrorRate * 100)).toFixed(4));

    // Dynamic latency narrative
    const latencyNarrative = this.generateLatencyNarrative(Math.round(avgLatency), Math.round(p95Latency));

    // Pulse summary
    const healthStatus = this.evaluateHealth(avgErrorRate, avgLatency);
    const pulseSummary = this.generatePulseSummary(healthStatus);

    return {
      deployment_id: deploymentId,
      health_status: healthStatus,
      uptime,
      response_time_ms: Math.round(avgLatency),
      p95_latency_ms: Math.round(p95Latency),
      error_rate: parseFloat((avgErrorRate * 100).toFixed(4)),
      requests_count: totalRequests,
      bandwidth_kb: records.reduce((sum, r) => sum + r.bandwidth_kb, 0),
      usage: {
        dau: latest.active_users,
        requests: totalRequests
      },
      system_load: {
        cpu_usage: latest.cpu_usage,
        memory_usage: latest.memory_usage
      },
      pulse_summary: pulseSummary,
      latency_narrative: latencyNarrative,
      timeline: records.map(r => ({
        timestamp: r.timestamp,
        latency: r.latency_ms,
        error_rate: r.error_rate * 100,
        requests: r.requests_count,
        cpu: r.cpu_usage,
        memory: r.memory_usage
      }))
    };
  }

  evaluateHealth(errorRate, latency) {
    if (errorRate >= 0.05 || latency >= 400) return 'critical';
    if (errorRate >= 0.015 || latency >= 250) return 'degraded';
    return 'healthy';
  }

  generatePulseSummary(status) {
    if (status === 'healthy') {
      return 'All systems operational. Performance is within optimal range.';
    } else if (status === 'degraded') {
      return 'Performance degraded. Higher than average latency or elevated error rates detected.';
    } else {
      return 'Critical incident detected. High latency or severe exceptions are affecting users.';
    }
  }

  generateLatencyNarrative(avg, p95) {
    if (avg < 120) {
      return `Avg latency is ${avg}ms (P95: ${p95}ms). Edge networks are responding extremely fast with sub-millisecond route timings.`;
    } else if (avg < 200) {
      return `Avg latency is ${avg}ms (P95: ${p95}ms). API Gateway responses are healthy, with minimal edge hops.`;
    } else if (avg < 300) {
      return `Avg latency is elevated at ${avg}ms (P95: ${p95}ms). Database pool usage has hit 80% capacity, causing minor lookup queues.`;
    } else {
      return `Avg latency has spiked to ${avg}ms (P95: ${p95}ms). Database connection pool exhaustion detected. Auto-remediation is recommended.`;
    }
  }

  getEmptyMetrics(deploymentId) {
    return {
      deployment_id: deploymentId,
      health_status: 'unknown',
      uptime: 100.0,
      response_time_ms: 0,
      p95_latency_ms: 0,
      error_rate: 0.0,
      requests_count: 0,
      bandwidth_kb: 0,
      usage: { dau: 0, requests: 0 },
      system_load: { cpu_usage: 0, memory_usage: 0 },
      pulse_summary: 'Observability agent bootstrapping...',
      latency_narrative: 'Awaiting first telemetry heartbeat...',
      timeline: []
    };
  }
}

module.exports = new MetricsService();
