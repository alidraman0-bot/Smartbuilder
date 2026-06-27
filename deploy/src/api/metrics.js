const express = require('express');
const router = express.Router();
const metricsService = require('../services/metrics');

/**
 * GET /api/monitor/metrics
 * Returns time-series metrics, P95 latency, health status, and timeline data
 */
router.get('/', async (req, res) => {
  try {
    const deploymentId = req.query.deployment_id || 'dep_init_4a8b';
    const summary = await metricsService.getMetricsSummary(deploymentId);
    res.json(summary);
  } catch (error) {
    console.error('[Metrics API]', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
