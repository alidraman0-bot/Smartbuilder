const express = require('express');
const router = express.Router();
const telemetryService = require('../services/telemetry');

/**
 * GET /telemetry/stream
 * Server-Sent Events (SSE) endpoint for real-time telemetry streaming.
 * Clients connect once and receive a continuous stream of metrics, logs,
 * traces, events, payments, and AI insights as they are ingested.
 */
router.get('/', (req, res) => {
  // SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no'
  });

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Telemetry stream established', timestamp: new Date().toISOString() })}\n\n`);

  // Bind to EventEmitter bus
  const onTelemetry = (payload) => {
    try {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (err) {
      // Client disconnected
    }
  };

  telemetryService.on('telemetry', onTelemetry);

  // Heartbeat every 15 seconds to keep the connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
    } catch (err) {
      clearInterval(heartbeat);
    }
  }, 15000);

  // Synthetic telemetry generator — emits realistic live metrics every 3 seconds
  // so the dashboard always has fresh data flowing
  const syntheticInterval = setInterval(async () => {
    try {
      const now = new Date();
      const hour = now.getHours();
      const isBusinessHours = hour >= 8 && hour <= 22;
      const baseLatency = isBusinessHours ? 95 + Math.random() * 80 : 60 + Math.random() * 40;
      const baseErrorRate = 0.002 + Math.random() * 0.008;
      const baseCpu = isBusinessHours ? 35 + Math.random() * 30 : 15 + Math.random() * 20;
      const baseMemory = 45 + Math.random() * 25;
      const baseUsers = isBusinessHours ? Math.floor(80 + Math.random() * 120) : Math.floor(20 + Math.random() * 40);

      // Inject a live metric
      await telemetryService.ingestMetric({
        project_id: 'proj_default',
        deployment_id: 'dep_init_4a8b',
        latency_ms: Math.round(baseLatency),
        error_rate: parseFloat(baseErrorRate.toFixed(4)),
        requests_count: Math.floor(50 + Math.random() * 200),
        cpu_usage: Math.round(baseCpu),
        memory_usage: Math.round(baseMemory),
        bandwidth_kb: Math.round(200 + Math.random() * 800),
        active_users: baseUsers
      });

      // Inject a live log entry periodically
      if (Math.random() > 0.5) {
        const logTemplates = [
          { module: 'API_GATEWAY', level: 'info', message: `GET /api/v1/projects responded in ${Math.round(baseLatency * 0.6)}ms` },
          { module: 'AUTH', level: 'info', message: `Token refresh successful for session_${Math.random().toString(36).substring(2, 8)}` },
          { module: 'BUILD_ENGINE', level: 'info', message: `Container health check passed — CPU: ${Math.round(baseCpu)}%, MEM: ${Math.round(baseMemory)}%` },
          { module: 'EDGE_CDN', level: 'info', message: `Cache HIT ratio: ${(92 + Math.random() * 6).toFixed(1)}% across 4 PoPs` },
          { module: 'DATABASE', level: 'info', message: `Connection pool: ${Math.floor(20 + Math.random() * 30)}/100 active, avg query: ${Math.round(8 + Math.random() * 15)}ms` },
          { module: 'SCHEDULER', level: 'info', message: `Cron job [cleanup_expired_sessions] completed in ${Math.round(50 + Math.random() * 100)}ms` },
          { module: 'AI_ENGINE', level: 'info', message: `AI Router inference completed: ${Math.round(800 + Math.random() * 1200)}ms, ${Math.round(200 + Math.random() * 500)} tokens` }
        ];

        // Occasionally inject warnings/errors for realism
        if (Math.random() > 0.92) {
          logTemplates.push(
            { module: 'DATABASE', level: 'warning', message: `Slow query detected: SELECT * FROM deployments WHERE status='active' — ${Math.round(300 + Math.random() * 400)}ms` },
            { module: 'API_GATEWAY', level: 'error', message: `Upstream timeout: POST /api/v1/deploy/start — connection refused after 5000ms` }
          );
        }

        const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
        await telemetryService.ingestLog({
          deployment_id: 'dep_init_4a8b',
          project_id: 'proj_default',
          ...template
        });
      }
    } catch (err) {
      // Silently continue
    }
  }, 3000);

  // Cleanup on disconnect
  req.on('close', () => {
    telemetryService.removeListener('telemetry', onTelemetry);
    clearInterval(heartbeat);
    clearInterval(syntheticInterval);
    console.log('[SSE] Client disconnected from telemetry stream');
  });
});

module.exports = router;
