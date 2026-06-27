const express = require('express');
const router = express.Router();
const paymentsService = require('../services/payments');

/**
 * GET /api/monitor/payments
 * Returns revenue telemetry: MRR, churn, geographic trends, recent transactions
 */
router.get('/', async (req, res) => {
  try {
    const telemetry = await paymentsService.getPaymentTelemetry();
    res.json(telemetry);
  } catch (error) {
    console.error('[Payments API]', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
