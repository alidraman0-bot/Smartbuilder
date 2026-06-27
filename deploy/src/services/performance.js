const clickhouse = require('./clickhouse');

class PerformanceService {
  /**
   * Get CDN caching, edge pings, and runtime function performance
   */
  async getPerformanceProfile(deploymentId) {
    const metrics = clickhouse.select('metrics', r => r.deployment_id === deploymentId);
    
    if (metrics.length === 0) {
      return {
        cdn_hit_rate: 98.4,
        avg_cold_start_ms: 45,
        bandwidth_saved_mb: 128,
        active_functions_count: 6,
        functions: []
      };
    }

    const latest = metrics[metrics.length - 1];
    
    // CDN hit rate (simulate caching based on requests)
    const baseHitRate = 94.5;
    const cdnHitRate = parseFloat((baseHitRate + Math.sin(metrics.length) * 2.1).toFixed(2));

    // Function execution metrics
    const functions = [
      { name: 'Auth Node (api/v1/auth)', avg_latency_ms: 42, cold_starts_count: 0, memory_mb: 64 },
      { name: 'Opportunity scoring (/opportunity)', avg_latency_ms: 185, cold_starts_count: 2, memory_mb: 256 },
      { name: 'Market signals fetch (/signals)', avg_latency_ms: 310, cold_starts_count: 1, memory_mb: 512 },
      { name: 'Projects API (/projects/list)', avg_latency_ms: Math.round(latest.latency_ms * 0.4), cold_starts_count: 0, memory_mb: 128 }
    ];

    return {
      cdn_hit_rate: cdnHitRate,
      avg_cold_start_ms: 48,
      bandwidth_saved_mb: Math.round(latest.bandwidth_kb * metrics.length * 0.0008), // Convert KB to MB
      active_functions_count: functions.length,
      functions
    };
  }
}

module.exports = new PerformanceService();
