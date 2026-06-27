const express = require('express');
const router = express.Router();
const githubService = require('../../services/github');

/**
 * GET /api/github/repos
 * Fetch user repositories
 */
router.get('/repos', async (req, res) => {
  try {
    const repos = await githubService.getRepositories();
    res.json(repos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
