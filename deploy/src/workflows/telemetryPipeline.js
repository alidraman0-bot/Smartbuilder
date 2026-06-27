const telemetryService = require('../services/telemetry');

class TelemetryPipeline {
  /**
   * Process a batch or single telemetry packet
   */
  async process(payload) {
    if (!payload || !payload.type) {
      throw new Error('Invalid telemetry payload: "type" is required');
    }

    const { type, data } = payload;
    let result = null;

    switch (type.toLowerCase()) {
      case 'metric':
        result = await telemetryService.ingestMetric(data);
        break;
      case 'log':
        result = await telemetryService.ingestLog(data);
        break;
      case 'trace':
        result = await telemetryService.ingestTrace(data);
        break;
      case 'event':
        result = await telemetryService.ingestEvent(data);
        break;
      case 'payment':
        result = await telemetryService.ingestPayment(data);
        break;
      default:
        throw new Error(`Unsupported telemetry type: ${type}`);
    }

    return {
      status: 'ingested',
      type,
      id: result.id,
      timestamp: result.timestamp
    };
  }
}

module.exports = new TelemetryPipeline();
