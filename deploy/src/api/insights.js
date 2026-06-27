const express = require('express');
const router = express.Router();
const aiInsightsService = require('../services/aiInsights');

/**
 * GET /api/monitor/insights
 * Returns real-time AI infrastructure analysis and recommendations.
 */
router.get('/', async (req, res) => {
  try {
    const deploymentId = req.query.deployment_id || 'dep_init_4a8b';
    const insights = await aiInsightsService.generateInsights(deploymentId);
    res.json(insights);
  } catch (error) {
    console.error('[AI Insights API]', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
