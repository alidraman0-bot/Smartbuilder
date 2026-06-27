const express = require('express');
const router = express.Router();
const logAnalyzer = require('../../services/logAnalyzer');

/**
 * GET /api/logs
 * Return real-time logs for a deployment
 */
router.get('/', (req, res) => {
  const { deployment_id } = req.query;

  if (!deployment_id) {
    return res.status(400).json({ error: 'deployment_id is required' });
  }

  const logs = logAnalyzer.getLogs(deployment_id);
  res.json(logs);
});

module.exports = router;
