const express = require('express');
const router = express.Router();
const alertsService = require('../services/alerts');

/**
 * GET /api/monitor/alerts
 * Returns active alerts for a deployment (from alertsService)
 */
router.get('/', async (req, res) => {
  try {
    const deploymentId = req.query.deployment_id || 'dep_init_4a8b';
    const active = await alertsService.getActiveAlerts(deploymentId);
    res.json({ deployment_id: deploymentId, alerts: active });
  } catch (error) {
    console.error('[Alerts API]', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
