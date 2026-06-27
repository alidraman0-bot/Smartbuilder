const express = require('express');
const router = express.Router();
const deployPipeline = require('../../workflows/deployPipeline');

/**
 * POST /api/deploy
 * Trigger a new deployment
 */
router.post('/', async (req, res) => {
  const { project_id, repo_url } = req.body;

  if (!project_id || !repo_url) {
    return res.status(400).json({ error: 'project_id and repo_url are required' });
  }

  try {
    // Pipeline runs asynchronously and handles its own status updates in Supabase
    // But we'll wait for the initial response or just trigger it
    const result = await deployPipeline.run(project_id, repo_url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
