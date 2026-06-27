const fs = require('fs');
const path = require('path');

class ClickHouseEmulator {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.tables = ['metrics', 'logs', 'traces', 'events', 'payments'];
    this.cache = {
      metrics: [],
      logs: [],
      traces: [],
      events: [],
      payments: []
    };
    
    this.initialize();
  }

  initialize() {
    // 1. Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // 2. Open and load files into cache
    this.tables.forEach(table => {
      const filePath = path.join(this.dataDir, `${table}.jsonl`);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '');
      }

      const content = fs.readFileSync(filePath, 'utf8').trim();
      if (content) {
        this.cache[table] = content
          .split('\n')
          .map(line => {
            try {
              return JSON.parse(line);
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean);
      }
    });

    // 3. Seed data if empty
    if (this.cache.metrics.length === 0) {
      this.seedData();
    }
  }

  async insert(table, record) {
    if (!this.tables.includes(table)) {
      throw new Error(`Table ${table} does not exist in ClickHouse emulator`);
    }

    const row = {
      id: Math.random().toString(36).substring(2, 10),
      timestamp: record.timestamp || new Date().toISOString(),
      ...record
    };

    this.cache[table].push(row);

    // Keep cache bounded to last 10,000 records per table to optimize memory
    if (this.cache[table].length > 10000) {
      this.cache[table].shift();
    }

    // Append to JSONL file asynchronously to avoid blocking request pipelines
    const filePath = path.join(this.dataDir, `${table}.jsonl`);
    fs.appendFile(filePath, JSON.stringify(row) + '\n', (err) => {
      if (err) console.error(`Failed to persist to table ${table}:`, err);
    });

    return row;
  }

  select(table, filterFn = () => true) {
    if (!this.tables.includes(table)) {
      throw new Error(`Table ${table} does not exist`);
    }
    return this.cache[table].filter(filterFn);
  }

  aggregate(table, groupByFn, aggregateFn, filterFn = () => true) {
    const data = this.select(table, filterFn);
    const groups = {};

    data.forEach(row => {
      const groupKey = groupByFn(row);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(row);
    });

    return Object.keys(groups).map(key => ({
      key,
      ...aggregateFn(groups[key], key)
    }));
  }

  seedData() {
    console.log('🌱 Seeding real telemetry records into ClickHouse emulator...');
    const now = new Date();
    const projectId = 'proj_default';
    const deploymentId = 'dep_init_4a8b';

    // 1. Seed Metrics (last 24 hours in 5-min intervals)
    for (let i = 288; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60 * 1000);
      const isAnomalous = i > 40 && i < 50; // Latency spike anomaly
      const baseLatency = 110 + (i % 20);
      const latency = isAnomalous ? baseLatency + 350 + Math.random() * 80 : baseLatency + Math.random() * 20;
      const errorRate = isAnomalous ? 0.08 + Math.random() * 0.04 : 0.002 + Math.random() * 0.003;
      const requests = 40 + Math.floor(Math.sin(i / 10) * 20) + Math.floor(Math.random() * 10);
      const cpu = 25 + Math.floor(Math.sin(i / 8) * 15) + (isAnomalous ? 45 : 0) + Math.random() * 5;
      const memory = 54.2 + (isAnomalous ? 12 : 0) + Math.random() * 1;
      const bandwidth = requests * (15 + Math.random() * 5); // KB

      this.cache.metrics.push({
        id: `met_${Math.random().toString(36).substring(2, 8)}`,
        timestamp: time.toISOString(),
        project_id: projectId,
        deployment_id: deploymentId,
        latency_ms: Math.round(latency),
        error_rate: parseFloat(errorRate.toFixed(4)),
        requests_count: requests,
        cpu_usage: parseFloat(cpu.toFixed(2)),
        memory_usage: parseFloat(memory.toFixed(2)),
        bandwidth_kb: Math.round(bandwidth),
        active_users: 15 + Math.floor(Math.sin(i / 15) * 8) + Math.floor(Math.random() * 3)
      });
    }

    // 2. Seed Logs
    const logModules = ['EDGE', 'ROUTER', 'API', 'AUTH', 'DB', 'FUNCTION'];
    const logMessages = [
      { module: 'EDGE', level: 'info', msg: 'Geo-routing connection handled from region region-us-east' },
      { module: 'ROUTER', level: 'info', msg: 'Incoming request parsed: GET /api/v1/projects' },
      { module: 'DB', level: 'info', msg: 'Connection pool acquired: 8 active connections' },
      { module: 'FUNCTION', level: 'info', msg: 'Warm execution in edge region' },
      { module: 'AUTH', level: 'info', msg: 'JWT token validated successfully for session' }
    ];

    for (let i = 500; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3 * 60 * 1000);
      const template = logMessages[i % logMessages.length];
      const isAnomaly = i > 200 && i < 250;
      
      let level = template.level;
      let msg = template.msg;

      if (isAnomaly && template.module === 'DB') {
        level = 'error';
        msg = 'CRITICAL: DB pool exhausted! Connection timeout exceeded after 15000ms';
      }

      this.cache.logs.push({
        id: `log_${Math.random().toString(36).substring(2, 8)}`,
        timestamp: time.toISOString(),
        project_id: projectId,
        deployment_id: deploymentId,
        module: template.module,
        level,
        message: msg
      });
    }

    // 3. Seed Traces
    for (let i = 100; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 15 * 60 * 1000);
      const traceId = `tr_${Math.random().toString(36).substring(2, 10)}`;
      const spans = [
        { name: 'Edge Gateway', duration: 12, parent: null },
        { name: 'API Gateway Router', duration: 18, parent: 'Edge Gateway' },
        { name: 'Auth Middleware', duration: 15, parent: 'API Gateway Router' },
        { name: 'User Controller', duration: 42, parent: 'API Gateway Router' },
        { name: 'Database Query', duration: 25, parent: 'User Controller' }
      ];

      spans.forEach(span => {
        this.cache.traces.push({
          id: `sp_${Math.random().toString(36).substring(2, 8)}`,
          timestamp: time.toISOString(),
          project_id: projectId,
          deployment_id: deploymentId,
          trace_id: traceId,
          name: span.name,
          duration_ms: span.duration,
          parent_span_id: span.parent ? `sp_${Math.random().toString(36).substring(2, 8)}` : null,
          status: 'success'
        });
      });
    }

    // 4. Seed Events
    const eventsTemplates = [
      { type: 'user_signup', desc: 'New founder onboarded' },
      { type: 'app_launch', desc: 'Smartbuilder MVP launched to Cloudflare Pages' },
      { type: 'deployment_success', desc: 'Production build dep_prod_4431 deployed successfully' },
      { type: 'payment_success', desc: 'Subscription payment of $49.00 processed via Paystack' }
    ];

    for (let i = 25; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 1 * 60 * 60 * 1000);
      const template = eventsTemplates[i % eventsTemplates.length];
      this.cache.events.push({
        id: `evt_${Math.random().toString(36).substring(2, 8)}`,
        timestamp: time.toISOString(),
        project_id: projectId,
        event_type: template.type,
        details: template.desc
      });
    }

    // 5. Seed Payments
    const regions = ['NG', 'ZA', 'KE', 'GH', 'US', 'GB'];
    const providers = ['Paystack', 'Stripe'];
    for (let i = 48; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 12 * 60 * 60 * 1000);
      const amount = 49.00 + (Math.random() > 0.8 ? 150.00 : 0.00); // Pro vs Enterprise Plan
      const status = Math.random() > 0.02 ? 'success' : 'failed'; // 2% payment failure rate
      this.cache.payments.push({
        id: `pay_${Math.random().toString(36).substring(2, 8)}`,
        timestamp: time.toISOString(),
        amount,
        currency: 'USD',
        status,
        provider: providers[i % providers.length],
        customer_email: `founder_${i}@smartbuilder.io`,
        type: amount > 100 ? 'Enterprise Plan' : 'Pro Plan',
        country: regions[i % regions.length]
      });
    }

    // Persist all seeded records to files
    this.tables.forEach(table => {
      const filePath = path.join(this.dataDir, `${table}.jsonl`);
      const lines = this.cache[table].map(row => JSON.stringify(row)).join('\n') + '\n';
      fs.writeFileSync(filePath, lines);
    });

    console.log(`✅ ClickHouse seed complete: ${this.cache.metrics.length} metrics, ${this.cache.logs.length} logs, ${this.cache.traces.length} traces persisted.`);
  }
}

module.exports = new ClickHouseEmulator();
