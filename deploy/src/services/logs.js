const clickhouse = require('./clickhouse');

class LogsService {
  /**
   * Query logs from the time-series store with filters
   */
  async queryLogs(deploymentId, options = {}) {
    const {
      level = null,
      module = null,
      search = null,
      limit = 100,
      offset = 0
    } = options;

    let records = clickhouse.select('logs', r => r.deployment_id === deploymentId);

    // Apply filters
    if (level) {
      records = records.filter(r => r.level.toLowerCase() === level.toLowerCase());
    }

    if (module) {
      records = records.filter(r => r.module.toLowerCase() === module.toLowerCase());
    }

    if (search) {
      const query = search.toLowerCase();
      records = records.filter(r => 
        r.message.toLowerCase().includes(query) || 
        r.module.toLowerCase().includes(query)
      );
    }

    // Sort by timestamp descending (newest first)
    records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Slice for pagination
    const paginated = records.slice(offset, offset + limit);

    return {
      deployment_id: deploymentId,
      total_count: records.length,
      limit,
      offset,
      logs: paginated
    };
  }
}

module.exports = new LogsService();
