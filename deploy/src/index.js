const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const githubRoutes = require('./api/github');
const projectRoutes = require('./api/projects');
const deployRoutes = require('./api/deploy');
const deploymentRoutes = require('./api/deployments');
const logRoutes = require('./api/logs');
const ingestRouter = require('./telemetry/ingest');
const streamRouter = require('./telemetry/stream');
const overviewRouter = require('./api/overview');
const metricsRouter = require('./api/metrics');
const monitorLogsRouter = require('./api/monitorLogs');
const tracesRouter = require('./api/traces');
const analyticsRouter = require('./api/analytics');
const paymentsRouter = require('./api/payments');
const alertsRouter = require('./api/alerts');
const insightsRouter = require('./api/insights');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Main entry point
app.get('/', (req, res) => {
  res.json({ status: 'SmartBuilder Launch Platform API is Online' });
});

// Routes
app.use('/api/github', githubRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/deploy', deployRoutes);
app.use('/api/deployments', deploymentRoutes);
app.use('/api/logs', logRoutes);
app.use('/telemetry/ingest', ingestRouter);
app.use('/telemetry/stream', streamRouter);
app.use('/api/monitor/overview', overviewRouter);
app.use('/api/monitor/metrics', metricsRouter);
app.use('/api/monitor/logs', monitorLogsRouter);
app.use('/api/monitor/traces', tracesRouter);
app.use('/api/monitor/analytics', analyticsRouter);
app.use('/api/monitor/payments', paymentsRouter);
app.use('/api/monitor/alerts', alertsRouter);
app.use('/api/monitor/insights', insightsRouter);

app.listen(PORT, () => {
  console.log(`🚀 Launch Platform Server running on port ${PORT}`);
});
