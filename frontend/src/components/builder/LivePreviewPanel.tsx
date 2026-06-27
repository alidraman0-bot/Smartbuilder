'use client';

/**
 * LivePreviewPanel — Enhanced iframe preview with connection status,
 * URL bar, console log paneel, and real-time WS-ready error capture.
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  RefreshCw, ExternalLink, Link2, Wifi, WifiOff, Terminal,
  ChevronDown, ChevronUp, X, AlertTriangle, CheckCircle2
} from 'lucide-react';

interface ConsoleEntry {
  id: number;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: string;
}

interface LivePreviewPanelProps {
  previewUrl: string;
  isReady: boolean;
  sessionId?: string | null;
  onIngestLogs?: (logs: string, errorType?: string) => Promise<void>;
  onRestart?: () => void;
}

const STATUS_DOT: Record<string, string> = {
  connected: 'bg-emerald-500',
  loading: 'bg-amber-400 animate-pulse',
  error: 'bg-red-500',
  idle: 'bg-gray-300',
};

export default function LivePreviewPanel({
  previewUrl,
  isReady,
  sessionId,
  onIngestLogs,
  onRestart,
}: LivePreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [connection, setConnection] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleEntry[]>([]);
  const [consoleFilter, setConsoleFilter] = useState<'all' | 'error' | 'warn'>('all');
  const logCounter = useRef(0);

  // Listen for postMessage events from the iframe (error capturing)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data) return;
      const { type, level, message } = event.data as any;

      if (type === 'console') {
        const entry: ConsoleEntry = {
          id: ++logCounter.current,
          level: level || 'log',
          message: typeof message === 'string' ? message : JSON.stringify(message),
          timestamp: new Date().toLocaleTimeString(),
        };
        setConsoleLogs(prev => [...prev.slice(-199), entry]);

        // Auto-forward errors to the backend
        if (level === 'error' && onIngestLogs) {
          onIngestLogs(entry.message, 'console');
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onIngestLogs]);

  // Track iframe load state
  const handleIframeLoad = useCallback(() => {
    setConnection('connected');
  }, []);
  const handleIframeError = useCallback(() => {
    setConnection('error');
  }, []);

  const handleRefresh = () => {
    setIframeKey(k => k + 1);
    setConnection('loading');
  };

  const clearConsole = () => setConsoleLogs([]);

  const filteredLogs = consoleLogs.filter(l =>
    consoleFilter === 'all' ? true : l.level === consoleFilter
  );

  const errorCount = consoleLogs.filter(l => l.level === 'error').length;
  const warnCount = consoleLogs.filter(l => l.level === 'warn').length;

  const connectionStatus = !isReady ? 'idle' : connection;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
      {/* ── Top Bar ── */}
      <div className="h-11 flex items-center gap-3 px-4 border-b border-gray-100 bg-gray-50/80 shrink-0">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>

        {/* URL bar */}
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-500 truncate">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[connectionStatus]}`} />
          <span className="truncate">{previewUrl || 'Waiting for build...'}</span>
        </div>

        {/* Actions */}
        <button
          onClick={handleRefresh}
          disabled={!isReady}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40"
          title="Refresh preview"
        >
          <RefreshCw size={13} />
        </button>
        {onRestart && (
          <button
            onClick={onRestart}
            disabled={!isReady}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40"
            title="Restart dev server"
          >
            <Wifi size={13} />
          </button>
        )}
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>

      {/* ── iframe / Loading State ── */}
      <div className="flex-1 relative overflow-hidden">
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center mb-6 animate-bounce">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Building your workspace</h3>
            <p className="text-xs text-gray-400 mb-6 text-center max-w-xs">
              Agents are provisioning your E2B sandbox and spinning up the dev server.
            </p>
            <div className="w-48 bg-gray-200 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-1/2 animate-pulse rounded-full" />
            </div>
          </div>
        )}

        {isReady && previewUrl && (
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full border-0"
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}

        {isReady && !previewUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <WifiOff className="w-10 h-10 text-gray-300 mb-4" />
            <p className="text-sm text-gray-400 font-medium">No preview URL yet</p>
            <p className="text-xs text-gray-300 mt-1">The sandbox URL will appear once the dev server starts.</p>
          </div>
        )}
      </div>

      {/* ── Console Panel ── */}
      <div className={`border-t border-gray-100 bg-gray-950 transition-all duration-300 ${showConsole ? 'h-52' : 'h-9'} shrink-0`}>
        {/* Console header */}
        <div
          className="h-9 flex items-center gap-2 px-4 cursor-pointer select-none"
          onClick={() => setShowConsole(s => !s)}
        >
          <Terminal size={12} className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex-1">Console</span>
          {errorCount > 0 && (
            <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
              {errorCount} error{errorCount > 1 ? 's' : ''}
            </span>
          )}
          {warnCount > 0 && (
            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
              {warnCount} warning{warnCount > 1 ? 's' : ''}
            </span>
          )}
          {showConsole ? <ChevronDown size={12} className="text-gray-500" /> : <ChevronUp size={12} className="text-gray-500" />}
        </div>

        {/* Console body */}
        {showConsole && (
          <div className="flex flex-col h-[calc(100%-2.25rem)]">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-1.5 border-b border-gray-800">
              {(['all', 'error', 'warn'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setConsoleFilter(f)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${consoleFilter === f ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {f === 'all' ? 'All' : f === 'error' ? 'Errors' : 'Warnings'}
                </button>
              ))}
              <div className="flex-1" />
              <button onClick={clearConsole} className="text-[10px] text-gray-500 hover:text-gray-300 flex items-center gap-1">
                <X size={10} /> Clear
              </button>
            </div>

            {/* Log entries */}
            <div className="flex-1 overflow-y-auto font-mono text-[11px] p-3 space-y-0.5">
              {filteredLogs.length === 0 ? (
                <div className="text-gray-600 text-center pt-4">No {consoleFilter === 'all' ? 'logs' : consoleFilter + 's'} yet</div>
              ) : filteredLogs.map(entry => (
                <div
                  key={entry.id}
                  className={`flex items-start gap-3 py-0.5 ${
                    entry.level === 'error' ? 'text-red-400' :
                    entry.level === 'warn' ? 'text-amber-400' :
                    'text-gray-300'
                  }`}
                >
                  <span className="text-gray-600 shrink-0">{entry.timestamp}</span>
                  <span className="truncate">{entry.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
