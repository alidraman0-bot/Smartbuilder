const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * GET /api/deployments
 * GET /api/deployments/list
 * Return deployment history for a project
 */
router.get(['/', '/list'], async (req, res) => {
  const { project_id } = req.query;

  try {
    let query = supabase.from('deployments').select('*').order('created_at', { ascending: false });
    
    if (project_id) {
      query = query.eq('project_id', project_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
