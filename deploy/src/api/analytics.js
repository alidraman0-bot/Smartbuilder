const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analytics');

/**
 * GET /api/monitor/analytics
 * Returns active user metrics, session counts, and top endpoint usage
 */
router.get('/', async (req, res) => {
  try {
    const deploymentId = req.query.deployment_id || 'dep_init_4a8b';
    const analytics = await analyticsService.getUsageAnalytics(deploymentId);
    res.json(analytics);
  } catch (error) {
    console.error('[Analytics API]', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
