const express = require('express');
const router = express.Router();
const telemetryPipeline = require('../workflows/telemetryPipeline');

/**
 * POST /telemetry/ingest
 * Ingests a new telemetry packet (metric, log, trace, event, payment)
 */
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.type) {
      return res.status(400).json({ error: 'Payload body must contain a "type" field.' });
    }

    const result = await telemetryPipeline.process(payload);
    res.status(202).json(result);
  } catch (error) {
    console.error('[Telemetry Ingest] Ingestion failure:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
