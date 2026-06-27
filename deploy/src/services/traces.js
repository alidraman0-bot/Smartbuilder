const clickhouse = require('./clickhouse');

class TracesService {
  /**
   * Get all active traces for a deployment
   */
  async getTracesList(deploymentId, limit = 50) {
    const traces = clickhouse.select('traces', r => r.deployment_id === deploymentId);
    
    // Group spans by trace_id to get root span details
    const groups = {};
    traces.forEach(span => {
      if (!groups[span.trace_id]) {
        groups[span.trace_id] = [];
      }
      groups[span.trace_id].push(span);
    });

    return Object.keys(groups).map(traceId => {
      const spans = groups[traceId];
      // Sort spans by timestamp ascending
      spans.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const rootSpan = spans.find(s => !s.parent_span_id) || spans[0];
      const totalDuration = spans.reduce((sum, s) => sum + s.duration_ms, 0);

      return {
        trace_id: traceId,
        timestamp: rootSpan.timestamp,
        name: rootSpan.name,
        span_count: spans.length,
        duration_ms: totalDuration,
        status: spans.some(s => s.status === 'error') ? 'error' : 'success'
      };
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
  }

  /**
   * Compile a full trace tree (waterfall layout) for a specific trace_id
   */
  async getTraceWaterfall(traceId) {
    const spans = clickhouse.select('traces', r => r.trace_id === traceId);
    
    if (spans.length === 0) {
      return null;
    }

    // Sort by timestamp
    spans.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Construct a tree index
    const spanMap = {};
    spans.forEach(span => {
      spanMap[span.id] = {
        ...span,
        children: []
      };
    });

    const rootSpans = [];
    spans.forEach(span => {
      const node = spanMap[span.id];
      if (span.parent_span_id && spanMap[span.parent_span_id]) {
        spanMap[span.parent_span_id].children.push(node);
      } else {
        rootSpans.push(node);
      }
    });

    return {
      trace_id: traceId,
      root_spans: rootSpans,
      total_duration_ms: spans.reduce((sum, s) => sum + s.duration_ms, 0)
    };
  }
}

module.exports = new TracesService();
