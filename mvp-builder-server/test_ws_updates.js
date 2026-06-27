const WebSocket = require('ws');

const projectId = process.argv[2] || 'test-project';
const ws = new WebSocket(`ws://localhost:3001?projectId=${projectId}`);

console.log(`Connecting to WebSocket for project: ${projectId}...`);

ws.on('open', () => {
    console.log('Connected!');
});

ws.on('message', (data) => {
    const update = JSON.parse(data);
    console.log(`[${update.status}] ${update.message} (${update.progress}%)`);
    
    if (update.status === 'completed' || update.status === 'failed') {
        console.log('Final update received. Closing...');
        ws.close();
        process.exit(0);
    }
});

ws.on('error', (err) => {
    console.error('WS Error:', err.message);
    process.exit(1);
});

ws.on('close', () => {
    console.log('Disconnected.');
});

// Timeout after 60 seconds
setTimeout(() => {
    console.error('Timed out waiting for updates.');
    process.exit(1);
}, 60000);
