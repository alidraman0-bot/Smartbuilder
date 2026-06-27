const express = require('express');
const router = express.Router();
const logsService = require('../services/logs');

/**
 * GET /api/monitor/logs
 * Returns paginated, filtered logs from the ClickHouse time-series store
 */
router.get('/', async (req, res) => {
  try {
    const deploymentId = req.query.deployment_id || 'dep_init_4a8b';
    const options = {
      level: req.query.level || null,
      module: req.query.module || null,
      search: req.query.search || null,
      limit: parseInt(req.query.limit) || 100,
      offset: parseInt(req.query.offset) || 0
    };
    const result = await logsService.queryLogs(deploymentId, options);
    res.json(result);
  } catch (error) {
    console.error('[Logs API]', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
