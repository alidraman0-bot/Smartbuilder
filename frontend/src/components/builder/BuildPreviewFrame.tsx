'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
    ExternalLink, Maximize2, Minimize2, Loader2, AlertCircle, 
    RefreshCw, Terminal, ChevronDown, ChevronUp, X, Wifi, Monitor 
} from 'lucide-react';

interface ConsoleEntry {
    id: number;
    level: 'log' | 'warn' | 'error' | 'info';
    message: string;
    timestamp: string;
}

interface Props {
    previewUrl: string | null;
    isReady: boolean;
    isFailed?: boolean;
    projectType?: string;
    onIngestLogs?: (logs: string, errorType?: string) => Promise<void>;
    onRestart?: () => void;
}

export default function BuildPreviewFrame({ previewUrl, isReady, isFailed, projectType, onIngestLogs, onRestart }: Props) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [iframeError, setIframeError] = useState(false);
    const [iframeKey, setIframeKey] = useState(0);
    const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>(
        projectType === 'mobile' || projectType === 'app' ? 'mobile' : 'desktop'
    );
    const [showConsole, setShowConsole] = useState(false);
    const [consoleLogs, setConsoleLogs] = useState<ConsoleEntry[]>([]);
    const [consoleFilter, setConsoleFilter] = useState<'all' | 'error' | 'warn'>('all');
    const logCounter = useRef(0);

    // Listen for postMessage events from the iframe
    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (!event.data) return;
            const { type, level, message } = event.data as any;

            if (type === 'console' || type === 'preview_error') {
                const entry: ConsoleEntry = {
                    id: ++logCounter.current,
                    level: level || (type === 'preview_error' ? 'error' : 'log'),
                    message: typeof message === 'string' ? message : JSON.stringify(message),
                    timestamp: new Date().toLocaleTimeString(),
                };
                setConsoleLogs(prev => [...prev.slice(-199), entry]);

                if (entry.level === 'error' && onIngestLogs) {
                    onIngestLogs(entry.message, 'runtime');
                }
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, [onIngestLogs]);

    const handleRefresh = () => {
        setIframeKey(k => k + 1);
        setIframeLoaded(false);
    };

    const clearConsole = () => setConsoleLogs([]);
    const filteredLogs = consoleLogs.filter(l =>
        consoleFilter === 'all' ? true : l.level === consoleFilter
    );
    const errorCount = consoleLogs.filter(l => l.level === 'error').length;
    const warnCount = consoleLogs.filter(l => l.level === 'warn').length;

    if (isFailed) {
        return (
            <div className="w-full h-full min-h-[400px] bg-zinc-950 rounded-2xl border border-red-900/50 flex items-center justify-center">
                <div className="text-center space-y-3 p-6">
                    <AlertCircle size={32} className="text-red-500 mx-auto" />
                    <h3 className="text-lg font-medium text-white mb-2">Generation Failed</h3>
                    <p className="text-sm text-zinc-400 max-w-sm">
                        The AI was unable to generate the application, likely due to a rate limit or API error. Please check the timeline logs for details.
                    </p>
                </div>
            </div>
        );
    }

    if (!previewUrl) {
        return (
            <div className="w-full h-full min-h-[400px] bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <Loader2 size={24} className="text-zinc-600 animate-spin mx-auto" />
                    <p className="text-zinc-600 text-sm">Waiting for build to start...</p>
                </div>
            </div>
        );
    }

    const isInitializing = !isReady;

    const isMobile = deviceMode === 'mobile';

    return (
        <div className={`
            ${isFullscreen
                ? 'fixed inset-0 z-50 bg-black p-4 flex items-center justify-center'
                : 'w-full'
            }
        `}>
            {/* Toolbar */}
            {!isFullscreen && (
                <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-t-xl px-4 py-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/60" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                            <div className="w-3 h-3 rounded-full bg-green-500/60" />
                        </div>
                        <div className="ml-3 flex-1 bg-zinc-800/50 rounded-lg px-3 py-1 text-xs text-zinc-400 font-mono truncate">
                            {previewUrl}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-3">
                        <button
                            onClick={handleRefresh}
                            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                            title="Refresh"
                        >
                            <RefreshCw size={14} className={!iframeLoaded ? 'animate-spin' : ''} />
                        </button>
                        {onRestart && (
                            <button
                                onClick={onRestart}
                                className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                                title="Restart Server"
                            >
                                <Wifi size={14} />
                            </button>
                        )}
                        <div className="flex items-center bg-zinc-800 rounded-lg p-1 mx-2">
                            <button
                                onClick={() => setDeviceMode('desktop')}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${!isMobile ? 'bg-white text-black' : 'text-zinc-500'}`}
                            >
                                WEB
                            </button>
                            <button
                                onClick={() => setDeviceMode('mobile')}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${isMobile ? 'bg-white text-black' : 'text-zinc-500'}`}
                            >
                                MOBILE
                            </button>
                        </div>
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                            title="Open in new tab"
                        >
                            <ExternalLink size={16} />
                        </a>
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                        >
                            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>
                </div>
            )}

            {/* Preview Container */}
            <div className={`
                relative flex items-center justify-center transition-all duration-500
                ${isFullscreen ? 'w-full h-full' : 'w-full bg-zinc-950 border-x border-b border-zinc-800 rounded-b-xl py-8'}
            `}>
                {/* Mobile Mockup */}
                <div className={`
                    relative transition-all duration-500
                    ${isMobile 
                        ? 'w-[320px] h-[640px] border-[8px] border-zinc-900 rounded-[3rem] shadow-[0_0_0_2px_rgba(255,255,255,0.05),0_20px_50px_rgba(0,0,0,0.5)] bg-black overflow-hidden' 
                        : 'w-full h-[500px] bg-white'
                    }
                `}>
                    {/* Notch */}
                    {isMobile && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-20 flex items-center justify-center">
                            <div className="w-12 h-1 bg-zinc-800 rounded-full" />
                        </div>
                    )}

                    {!iframeLoaded && !iframeError && previewUrl !== "http://localhost:3000/mock-preview" && !previewUrl?.includes("/mock-preview") && (
                        <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center z-10">
                            <Loader2 size={28} className="text-indigo-500 animate-spin" />
                        </div>
                    )}

                    {iframeError && (
                        <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center z-10 p-6 text-center">
                            <div className="space-y-4">
                                <AlertCircle size={32} className="text-amber-500 mx-auto" />
                                <p className="text-zinc-400 text-sm">Preview could not be loaded.</p>
                            </div>
                        </div>
                    )}

                    {/* Iframe or Mock */}
                    <div className="relative w-full h-full bg-zinc-900 flex items-center justify-center">
                        {isInitializing ? (
                            <div className="absolute inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center text-center p-6">
                                <div className="space-y-4 max-w-xs scale-in-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 animate-ping opacity-25 bg-blue-500 rounded-full" />
                                        <Loader2 size={32} className="text-blue-500 animate-spin relative z-10 mx-auto" />
                                    </div>
                                    <h3 className="text-white font-medium">Sandbox Initializing...</h3>
                                    <p className="text-xs text-zinc-400">
                                        We are preparing your secure environment. 
                                        Once the AI finishes generating the code, your app will automatically appear here.
                                    </p>
                                    <div className="flex gap-2 justify-center pt-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse [animation-delay:0.2s]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <iframe
                            key={iframeKey}
                            src={previewUrl || ''}
                            className={`w-full h-full bg-white border-0 transition-opacity duration-300 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setIframeLoaded(true)}
                            onError={() => setIframeError(true)}
                            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads"
                            allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                        />
                        
                        {!iframeLoaded && !isInitializing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 pointer-events-none">
                                <Loader2 size={24} className="text-zinc-600 animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Console Integration (Only for Web view or if explicit) */}
                {!isMobile && (
                    <div className={`absolute bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950 transition-all duration-300 ${showConsole ? 'h-52' : 'h-9'} z-30`}>
                        <div
                            className="h-9 flex items-center gap-2 px-4 cursor-pointer select-none"
                            onClick={() => setShowConsole(s => !s)}
                        >
                            <Terminal size={12} className="text-zinc-500" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex-1">Console</span>
                            {errorCount > 0 && <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">{errorCount}</span>}
                            {showConsole ? <ChevronDown size={12} className="text-zinc-600" /> : <ChevronUp size={12} className="text-zinc-600" />}
                        </div>
                        {showConsole && (
                            <div className="flex flex-col h-[calc(100%-2.25rem)]">
                                <div className="flex items-center gap-2 px-4 py-1.5 border-b border-zinc-900">
                                    <button onClick={clearConsole} className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1"><X size={10} /> Clear</button>
                                </div>
                                <div className="flex-1 overflow-y-auto font-mono text-[11px] p-3 space-y-1">
                                    {filteredLogs.map(entry => (
                                        <div key={entry.id} className={`flex items-start gap-3 ${entry.level === 'error' ? 'text-red-400' : 'text-zinc-400'}`}>
                                            <span className="text-zinc-600 shrink-0">{entry.timestamp}</span>
                                            <span>{entry.message}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {isFullscreen && (
                   <button
                        onClick={() => setIsFullscreen(false)}
                        className="fixed top-6 right-6 p-3 bg-zinc-900/80 hover:bg-white/10 rounded-full text-white backdrop-blur-md transition-all z-50 border border-white/10"
                    >
                        <Minimize2 size={24} />
                    </button>
                )}
            </div>
        </div>
    );
}

