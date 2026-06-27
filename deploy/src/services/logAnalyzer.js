class LogAnalyzer {
  constructor() {
    this.logs = new Map(); // deploymentId -> logs[]
  }

  addLog(deploymentId, log) {
    if (!this.logs.has(deploymentId)) {
      this.logs.set(deploymentId, []);
    }
    const timestamp = new Date().toISOString();
    const logEntry = typeof log === 'string' ? `[${timestamp}] ${log}` : log;
    this.logs.get(deploymentId).push(logEntry);
    console.log(`[RepoLog][${deploymentId}] ${logEntry}`);
  }

  getLogs(deploymentId) {
    return this.logs.get(deploymentId) || [];
  }

  clearLogs(deploymentId) {
    this.logs.delete(deploymentId);
  }
}

module.exports = new LogAnalyzer();
