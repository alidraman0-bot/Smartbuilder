const express = require('express');
const router = express.Router();
const tracesService = require('../services/traces');

/**
 * GET /api/monitor/traces
 * Returns a list of recent distributed traces grouped by trace_id
 */
router.get('/', async (req, res) => {
  try {
    const deploymentId = req.query.deployment_id || 'dep_init_4a8b';
    const limit = parseInt(req.query.limit) || 50;
    const traces = await tracesService.getTracesList(deploymentId, limit);
    res.json({ deployment_id: deploymentId, traces });
  } catch (error) {
    console.error('[Traces API]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/monitor/traces/:traceId
 * Returns a full waterfall tree for a specific trace
 */
router.get('/:traceId', async (req, res) => {
  try {
    const waterfall = await tracesService.getTraceWaterfall(req.params.traceId);
    if (!waterfall) {
      return res.status(404).json({ error: 'Trace not found' });
    }
    res.json(waterfall);
  } catch (error) {
    console.error('[Traces Waterfall API]', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
