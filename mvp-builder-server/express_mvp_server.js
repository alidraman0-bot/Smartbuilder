const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
// Removed axios, using local engine
require('dotenv').config();

const { buildMVP, improveMVP } = require('./src/engine');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// ---------------------------------------------------------------------------
// Project Store — track connected WS clients per session
// ---------------------------------------------------------------------------
const sessionConnections = new Map(); // sessionId -> Set<WebSocket>

// ---------------------------------------------------------------------------
// REST API — proxies to FastAPI backend
// ---------------------------------------------------------------------------

const engineSessions = new Map();

// Build MVP
app.post('/api/v1/build', async (req, res) => {
  try {
    const session_id = uuidv4();
    const { idea } = req.body;
    
    // Initialize session state
    engineSessions.set(session_id, {
      state: 'S1', // Starting
      project_name: 'smart-project-' + session_id.substring(0,6),
      idea,
      preview_url: null,
      timeline: []
    });

    res.json({ session_id, message: "Pipeline started" });

    // Run engine async
    try {
        const result = await buildMVP(idea);
        const session = engineSessions.get(session_id);
        session.state = result.status === 'Deployed' ? 'S5' : 'S6'; // Mock states: S5 success
        session.preview_url = result.preview_url;
        session.app = result.app;
        broadcast(session_id, { type: 'state_update', ...session });
    } catch(err) {
        engineSessions.get(session_id).state = 'FAILED';
        engineSessions.get(session_id).last_error = err.message;
        broadcast(session_id, { type: 'state_update', ...engineSessions.get(session_id) });
    }

  } catch (error) {
    console.error('Build Error:', error.message);
    res.status(500).json({ error: 'Failed to start build pipeline' });
  }
});

// Improve MVP
app.post('/api/v1/sessions/:sessionId/improve', async (req, res) => {
  const sessionId = req.params.sessionId;
  const session = engineSessions.get(sessionId);
  if(!session || !session.app) return res.status(404).json({ error: 'App not generated yet' });

  try {
    res.json({ message: "Improvement started" });
    const result = await improveMVP(session.app, req.body.instruction);
    session.preview_url = result.preview_url;
    broadcast(sessionId, { type: 'state_update', ...session });
  } catch (error) {
    console.error('Improve Error:', error.message);
    res.status(500).json({ error: 'Failed to start improvement' });
  }
});

// Get session state
app.get('/api/v1/sessions/:sessionId/state', async (req, res) => {
  const session = engineSessions.get(req.params.sessionId);
  if(session) res.json(session);
  else res.status(404).json({ error: 'Session not found' });
});

// ... mock other endpoints minimally
app.get('/api/v1/sessions/:sessionId/pipeline', (req, res) => res.json([]));
app.get('/api/v1/sessions/:sessionId/files', (req, res) => res.json([]));
app.get('/api/v1/sessions', (req, res) => res.json(Array.from(engineSessions.keys())));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mvp-builder-ws-server', uptime: process.uptime() });
});

// ---------------------------------------------------------------------------
// WebSocket Handling — real-time pipeline events
// ---------------------------------------------------------------------------

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    ws.close(1008, 'Missing sessionId parameter');
    return;
  }

  console.log(`WS client connected for session: ${sessionId}`);

  if (!sessionConnections.has(sessionId)) {
    sessionConnections.set(sessionId, new Set());
  }
  sessionConnections.get(sessionId).add(ws);

  // Send current state immediately
  fetchAndBroadcast(sessionId).catch(() => {});

  ws.on('close', () => {
    sessionConnections.get(sessionId)?.delete(ws);
    if (sessionConnections.get(sessionId)?.size === 0) {
      sessionConnections.delete(sessionId);
    }
  });
});

// ---------------------------------------------------------------------------
// Background Monitoring & WS Broadcasting
// ---------------------------------------------------------------------------

const monitoredSessions = new Map(); // sessionId -> intervalId

function startSessionMonitoring(sessionId) {
  if (monitoredSessions.has(sessionId)) return;

  console.log(`Monitoring session: ${sessionId}`);

  const interval = setInterval(async () => {
    await fetchAndBroadcast(sessionId);
  }, 2000);

  monitoredSessions.set(sessionId, interval);
}

async function fetchAndBroadcast(sessionId) {
  const session = engineSessions.get(sessionId);
  if (!session) return;
  broadcast(sessionId, { type: 'state_update', ...session });
}

function broadcast(sessionId, data) {
  const clients = sessionConnections.get(sessionId);
  if (clients) {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------

server.listen(port, () => {
  console.log(`Smartbuilder WS Server running on http://localhost:${port}`);
  console.log(`FastAPI backend: ${FASTAPI_URL}`);
});
