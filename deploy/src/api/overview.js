const express = require('express');
const router = express.Router();
const monitoringService = require('../services/monitoring');

/**
 * GET /api/monitor/overview
 * Returns the high-level infrastructure overview dashboard payload
 */
router.get('/', async (req, res) => {
  try {
    const deploymentId = req.query.deployment_id || 'dep_init_4a8b';
    const overview = await monitoringService.getOverviewStats(deploymentId);
    res.json(overview);
  } catch (error) {
    console.error('[Overview API]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/monitor/overview/action
 * Execute an SRE remediation action (restart, shutdown, iterate)
 */
router.post('/action', async (req, res) => {
  try {
    const { deployment_id, action } = req.body;
    if (!deployment_id || !action) {
      return res.status(400).json({ error: 'deployment_id and action are required' });
    }
    const result = await monitoringService.handleAction(deployment_id, action);
    res.json(result);
  } catch (error) {
    console.error('[Overview Action API]', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
