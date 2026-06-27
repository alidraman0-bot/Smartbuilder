# Base44 Clone - Live Preview & Real-Time Sync Engine

This document describes the live preview system that enables users to see their generated applications in real-time as code is being generated, powered by WebContainer and WebSocket synchronization.

---

## Live Preview Architecture

The live preview system consists of three core components working in concert:

1. **WebContainer** - Browser-based development environment that runs the application
2. **WebSocket Server** - Real-time communication between AI engine and preview
3. **File Synchronization** - Automatic file updates as code is generated

```
AI Code Generation Engine
    ↓
┌─────────────────────────────────┐
│ Code Streaming System           │
│ - Stream files as generated     │
│ - Batch updates for efficiency  │
│ - Maintain file structure       │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ WebSocket Server                │
│ - Bidirectional communication   │
│ - Real-time file updates        │
│ - Event streaming               │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ WebContainer                    │
│ - Virtual file system           │
│ - Vite dev server               │
│ - Hot module replacement        │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ Browser Preview                 │
│ - Render application            │
│ - Show real-time updates        │
│ - Display errors                │
└──────────────┬──────────────────┘
               ↓
User sees live preview of generated app
```

---

## WebContainer Integration

### WebContainer Setup

WebContainer provides a complete development environment in the browser, enabling instant preview without server-side compilation.

```typescript
// webcontainer-setup.ts
import { WebContainer } from '@webcontainer/api';

interface WebContainerConfig {
  projectName: string;
  files: Record<string, string>;
  environment?: Record<string, string>;
}

export async function initializeWebContainer(
  config: WebContainerConfig
): Promise<WebContainerInstance> {
  // Boot WebContainer
  const webcontainer = await WebContainer.boot();

  // Create file structure
  await webcontainer.fs.mkdir(`/app/${config.projectName}`, { recursive: true });

  // Write files to virtual file system
  for (const [filePath, content] of Object.entries(config.files)) {
    const fullPath = `/app/${config.projectName}/${filePath}`;
    const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));

    // Create directory if needed
    try {
      await webcontainer.fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Write file
    await webcontainer.fs.writeFile(fullPath, content);
  }

  // Install dependencies
  console.log('📦 Installing dependencies...');
  const installProcess = await webcontainer.spawn('npm', ['install'], {
    cwd: `/app/${config.projectName}`,
  });

  const installExitCode = await installProcess.exit;
  if (installExitCode !== 0) {
    throw new Error('Failed to install dependencies');
  }

  // Start development server
  console.log('🚀 Starting development server...');
  const devProcess = await webcontainer.spawn('npm', ['run', 'dev'], {
    cwd: `/app/${config.projectName}`,
  });

  // Capture server output
  devProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        console.log('[Dev Server]', data);
      },
    })
  );

  // Wait for server to be ready
  await waitForServerReady(webcontainer, config.projectName);

  return {
    webcontainer,
    projectName: config.projectName,
    devProcess,
  };
}

async function waitForServerReady(
  webcontainer: WebContainer,
  projectName: string
): Promise<void> {
  let ready = false;
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds

  while (!ready && attempts < maxAttempts) {
    try {
      // Try to connect to the dev server
      const response = await fetch('http://localhost:5173');
      ready = response.ok;
    } catch (error) {
      // Server not ready yet
    }

    if (!ready) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
  }

  if (!ready) {
    throw new Error('Development server failed to start');
  }

  console.log('✓ Development server ready');
}

interface WebContainerInstance {
  webcontainer: WebContainer;
  projectName: string;
  devProcess: any;
}
```

### File Updates in WebContainer

Implement efficient file synchronization as code is generated.

```typescript
// file-sync.ts
export async function updateFileInWebContainer(
  webcontainerInstance: WebContainerInstance,
  filePath: string,
  content: string
): Promise<void> {
  const { webcontainer, projectName } = webcontainerInstance;
  const fullPath = `/app/${projectName}/${filePath}`;

  // Create directory if needed
  const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
  try {
    await webcontainer.fs.mkdir(dir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  // Write file
  await webcontainer.fs.writeFile(fullPath, content);

  console.log(`✓ Updated: ${filePath}`);
}

export async function deleteFileInWebContainer(
  webcontainerInstance: WebContainerInstance,
  filePath: string
): Promise<void> {
  const { webcontainer, projectName } = webcontainerInstance;
  const fullPath = `/app/${projectName}/${filePath}`;

  try {
    await webcontainer.fs.rm(fullPath);
    console.log(`✓ Deleted: ${filePath}`);
  } catch (error) {
    console.error(`Failed to delete ${filePath}:`, error);
  }
}

export async function listFilesInWebContainer(
  webcontainerInstance: WebContainerInstance,
  dirPath: string = ''
): Promise<string[]> {
  const { webcontainer, projectName } = webcontainerInstance;
  const fullPath = `/app/${projectName}/${dirPath}`;

  const files: string[] = [];

  async function walk(path: string, prefix: string = '') {
    const entries = await webcontainer.fs.readdir(path, { withFileTypes: true });

    for (const entry of entries) {
      const fullName = prefix ? `${prefix}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        await walk(`${path}/${entry.name}`, fullName);
      } else {
        files.push(fullName);
      }
    }
  }

  await walk(fullPath);
  return files;
}
```

---

## WebSocket Real-Time Sync

### WebSocket Server Setup

Implement a WebSocket server for real-time communication between the AI engine and the preview.

```typescript
// websocket-server.ts
import WebSocket from 'ws';
import { Server } from 'http';

interface WebSocketMessage {
  type: 'file_update' | 'file_delete' | 'console_log' | 'error' | 'status';
  payload: any;
  timestamp: number;
}

export class PreviewWebSocketServer {
  private wss: WebSocket.Server;
  private clients: Map<string, WebSocket> = new Map();
  private projectInstances: Map<string, WebContainerInstance> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on('connection', (ws: WebSocket, req) => {
      const projectId = this.extractProjectId(req.url);
      console.log(`✓ Client connected for project: ${projectId}`);

      this.clients.set(projectId, ws);

      ws.on('message', (data: string) => {
        this.handleMessage(projectId, data);
      });

      ws.on('close', () => {
        console.log(`✓ Client disconnected for project: ${projectId}`);
        this.clients.delete(projectId);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for project ${projectId}:`, error);
      });

      // Send initial status
      this.sendMessage(projectId, {
        type: 'status',
        payload: { status: 'connected', message: 'Preview connected' },
      });
    });
  }

  private extractProjectId(url: string | undefined): string {
    if (!url) return 'unknown';
    const match = url.match(/projectId=([^&]+)/);
    return match ? match[1] : 'unknown';
  }

  private handleMessage(projectId: string, data: string): void {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'file_update':
          this.handleFileUpdate(projectId, message.payload);
          break;
        case 'file_delete':
          this.handleFileDelete(projectId, message.payload);
          break;
        case 'console_log':
          this.handleConsoleLog(projectId, message.payload);
          break;
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private async handleFileUpdate(
    projectId: string,
    payload: { filePath: string; content: string }
  ): Promise<void> {
    const instance = this.projectInstances.get(projectId);
    if (!instance) {
      console.error(`Project instance not found: ${projectId}`);
      return;
    }

    try {
      await updateFileInWebContainer(instance, payload.filePath, payload.content);

      this.sendMessage(projectId, {
        type: 'status',
        payload: { status: 'file_updated', filePath: payload.filePath },
      });
    } catch (error) {
      this.sendMessage(projectId, {
        type: 'error',
        payload: { message: `Failed to update file: ${error}` },
      });
    }
  }

  private async handleFileDelete(
    projectId: string,
    payload: { filePath: string }
  ): Promise<void> {
    const instance = this.projectInstances.get(projectId);
    if (!instance) {
      console.error(`Project instance not found: ${projectId}`);
      return;
    }

    try {
      await deleteFileInWebContainer(instance, payload.filePath);

      this.sendMessage(projectId, {
        type: 'status',
        payload: { status: 'file_deleted', filePath: payload.filePath },
      });
    } catch (error) {
      this.sendMessage(projectId, {
        type: 'error',
        payload: { message: `Failed to delete file: ${error}` },
      });
    }
  }

  private handleConsoleLog(
    projectId: string,
    payload: { level: string; message: string }
  ): void {
    console.log(`[${projectId}] ${payload.level}: ${payload.message}`);
  }

  public sendMessage(projectId: string, message: WebSocketMessage): void {
    const client = this.clients.get(projectId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  public registerProjectInstance(
    projectId: string,
    instance: WebContainerInstance
  ): void {
    this.projectInstances.set(projectId, instance);
  }

  public unregisterProjectInstance(projectId: string): void {
    this.projectInstances.delete(projectId);
  }
}
```

### WebSocket Client (Frontend)

Implement the client-side WebSocket connection for receiving updates.

```typescript
// preview-client.ts
export class PreviewWebSocketClient {
  private ws: WebSocket | null = null;
  private projectId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private messageHandlers: Map<string, Function[]> = new Map();

  constructor(projectId: string) {
    this.projectId = projectId;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/preview?projectId=${this.projectId}`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✓ Connected to preview server');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('✓ Disconnected from preview server');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay);
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type) || [];

    for (const handler of handlers) {
      try {
        handler(message.payload);
      } catch (error) {
        console.error(`Error in message handler for ${message.type}:`, error);
      }
    }
  }

  public on(type: string, handler: Function): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }

    this.messageHandlers.get(type)!.push(handler);
  }

  public off(type: string, handler: Function): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  public sendMessage(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp?: number;
}
```

---

## Live Preview UI Component

### Preview Component

Implement the React component that displays the live preview.

```typescript
// PreviewPanel.tsx
import React, { useEffect, useRef, useState } from 'react';
import { PreviewWebSocketClient } from './preview-client';

interface PreviewPanelProps {
  projectId: string;
  isGenerating: boolean;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  projectId,
  isGenerating,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>(
    'connecting'
  );
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const wsClientRef = useRef<PreviewWebSocketClient | null>(null);

  useEffect(() => {
    const wsClient = new PreviewWebSocketClient(projectId);
    wsClientRef.current = wsClient;

    // Connect to preview server
    wsClient.connect().then(() => {
      setStatus('connected');
    }).catch((error) => {
      setStatus('error');
      setError(`Failed to connect: ${error.message}`);
    });

    // Handle status updates
    wsClient.on('status', (payload) => {
      console.log('Status update:', payload);
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ${payload.message}`,
      ]);
    });

    // Handle errors
    wsClient.on('error', (payload) => {
      setError(payload.message);
      setLogs((prev) => [
        ...prev,
        `[ERROR] ${payload.message}`,
      ]);
    });

    // Handle console logs
    wsClient.on('console_log', (payload) => {
      setLogs((prev) => [
        ...prev,
        `[${payload.level.toUpperCase()}] ${payload.message}`,
      ]);
    });

    return () => {
      wsClient.disconnect();
    };
  }, [projectId]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              status === 'connected'
                ? 'bg-green-500'
                : status === 'connecting'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
          />
          <span className="text-sm font-medium">
            {status === 'connected'
              ? 'Live Preview'
              : status === 'connecting'
              ? 'Connecting...'
              : 'Connection Error'}
          </span>
        </div>
        {isGenerating && (
          <span className="text-xs text-gray-500">Generating...</span>
        )}
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-hidden">
        {status === 'connected' ? (
          <iframe
            ref={iframeRef}
            src="http://localhost:5173"
            className="w-full h-full border-0"
            title="Live Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                {status === 'connecting' ? (
                  <>
                    <div className="animate-spin mb-2">⏳</div>
                    <p>Connecting to preview server...</p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl mb-2">⚠️</div>
                    <p>{error || 'Connection failed'}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Console Output */}
      <div className="border-t border-gray-200 bg-gray-50 max-h-32 overflow-y-auto">
        <div className="p-2 text-xs font-mono text-gray-600">
          {logs.length === 0 ? (
            <p className="text-gray-400">No logs yet...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="py-0.5">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## Code Streaming

### Stream Generated Code to Preview

Implement efficient streaming of generated code to the preview.

```typescript
// code-streamer.ts
export async function streamCodeToPreview(
  wsServer: PreviewWebSocketServer,
  projectId: string,
  codeStream: AsyncIterable<CodeChunk>
): Promise<void> {
  const fileBuffer: Map<string, string> = new Map();

  for await (const chunk of codeStream) {
    switch (chunk.type) {
      case 'file_start':
        console.log(`📝 Generating: ${chunk.filePath}`);
        fileBuffer.set(chunk.filePath, '');
        break;

      case 'file_content':
        const current = fileBuffer.get(chunk.filePath) || '';
        fileBuffer.set(chunk.filePath, current + chunk.content);
        break;

      case 'file_complete':
        const content = fileBuffer.get(chunk.filePath) || '';
        wsServer.sendMessage(projectId, {
          type: 'file_update',
          payload: {
            filePath: chunk.filePath,
            content,
          },
        });
        fileBuffer.delete(chunk.filePath);
        console.log(`✓ Generated: ${chunk.filePath}`);
        break;

      case 'error':
        wsServer.sendMessage(projectId, {
          type: 'error',
          payload: { message: chunk.message },
        });
        break;

      case 'status':
        wsServer.sendMessage(projectId, {
          type: 'status',
          payload: { message: chunk.message },
        });
        break;
    }
  }
}

interface CodeChunk {
  type: 'file_start' | 'file_content' | 'file_complete' | 'error' | 'status';
  filePath?: string;
  content?: string;
  message?: string;
}
```

---

## Error Handling and Recovery

### Error Display in Preview

Display errors from the development server in the preview UI.

```typescript
// error-handler.ts
export async function captureDevServerErrors(
  webcontainerInstance: WebContainerInstance,
  wsServer: PreviewWebSocketServer,
  projectId: string
): Promise<void> {
  const { devProcess } = webcontainerInstance;

  // Capture stderr
  devProcess.stderr.pipeTo(
    new WritableStream({
      write(data) {
        console.error('[Dev Server Error]', data);

        wsServer.sendMessage(projectId, {
          type: 'error',
          payload: {
            message: data,
            source: 'dev_server',
          },
        });
      },
    })
  );

  // Capture stdout for warnings
  devProcess.stdout.pipeTo(
    new WritableStream({
      write(data) {
        if (data.includes('warning') || data.includes('error')) {
          wsServer.sendMessage(projectId, {
            type: 'console_log',
            payload: {
              level: 'warning',
              message: data,
            },
          });
        }
      },
    })
  );
}
```

---

## Performance Optimization

### Batch File Updates

Optimize by batching multiple file updates together.

```typescript
// batch-updates.ts
export class BatchFileUpdater {
  private queue: Map<string, string> = new Map();
  private timer: NodeJS.Timeout | null = null;
  private batchDelay = 500; // milliseconds
  private wsServer: PreviewWebSocketServer;
  private projectId: string;
  private webcontainerInstance: WebContainerInstance;

  constructor(
    wsServer: PreviewWebSocketServer,
    projectId: string,
    webcontainerInstance: WebContainerInstance
  ) {
    this.wsServer = wsServer;
    this.projectId = projectId;
    this.webcontainerInstance = webcontainerInstance;
  }

  public queueUpdate(filePath: string, content: string): void {
    this.queue.set(filePath, content);

    // Reset timer
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.flushQueue();
    }, this.batchDelay);
  }

  private async flushQueue(): Promise<void> {
    if (this.queue.size === 0) return;

    console.log(`📦 Flushing ${this.queue.size} file updates...`);

    for (const [filePath, content] of this.queue.entries()) {
      try {
        await updateFileInWebContainer(
          this.webcontainerInstance,
          filePath,
          content
        );

        this.wsServer.sendMessage(this.projectId, {
          type: 'file_update',
          payload: { filePath, content },
        });
      } catch (error) {
        this.wsServer.sendMessage(this.projectId, {
          type: 'error',
          payload: { message: `Failed to update ${filePath}: ${error}` },
        });
      }
    }

    this.queue.clear();
  }
}
```

---

## Summary

The live preview and real-time sync engine enables users to see their generated applications come to life instantly. By combining WebContainer for browser-based execution, WebSocket for real-time communication, and efficient file synchronization, the Base44 Clone provides an unparalleled development experience where users can watch their applications being built in real-time.

Key features include:

- **Instant Preview**: See applications rendered immediately in the browser
- **Real-Time Updates**: Watch code changes reflected instantly
- **Error Display**: See compilation and runtime errors immediately
- **Console Output**: Monitor application logs and debug information
- **Efficient Synchronization**: Batch updates for optimal performance
- **Automatic Recovery**: Reconnection and error handling built-in
