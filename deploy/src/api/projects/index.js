const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const detector = require('../../services/detector');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', async (req, res) => {
  const { repo_url, user_id, name } = req.body;

  if (!repo_url) {
    return res.status(400).json({ error: 'repo_url is required' });
  }

  try {
    // 1. Detect Framework
    const parts = repo_url.replace('https://github.com/', '').split('/');
    const owner = parts[0];
    const repo = parts[1];
    
    const frameworkConfig = await detector.detect(owner, repo);

    // 2. Store in Supabase
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name: name || repo,
        repo_url,
        framework: frameworkConfig.framework,
        build_config: frameworkConfig,
        user_id: user_id || null
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/projects
 * GET /api/projects/list
 * List all projects
 */
router.get(['/', '/list'], async (req, res) => {
  try {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
