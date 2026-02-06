"use client";

import React, { useRef, useEffect } from 'react';
import { Terminal, Copy } from 'lucide-react';

interface LogEntry {
    time: string;
    type: string;
    module: string;
    message: string;
}

export default function LatestOutputPanel({ logs }: { logs: LogEntry[] }) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    return (
        <div className="flex flex-col h-full border border-[#27272a] rounded-md bg-[#18181b] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272a] bg-[#18181b]">
                <h3 className="text-xs font-bold text-[#52525b] uppercase tracking-widest flex items-center space-x-2">
                    <Terminal size={14} />
                    <span>System Output</span>
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono-data text-xs space-y-1 bg-[#09090b]">
                {logs && logs.length > 0 ? (
                    logs.map((log, i) => (
                        <div key={i} className="flex space-x-3 text-[#a1a1aa] hover:bg-[#18181b] p-0.5 -mx-1 px-1 rounded transition-colors duration-75">
                            <span className="text-[#52525b] shrink-0 w-16 select-none">{log.time}</span>
                            <span className={`shrink-0 w-24 font-bold uppercase ${log.type === 'error' ? 'text-[#ef4444]' :
                                    log.type === 'success' ? 'text-[#10b981]' :
                                        log.type === 'warning' ? 'text-[#f59e0b]' :
                                            'text-blue-500'
                                }`}>{log.module}</span>
                            <span className="text-[#f4f4f5] break-all">{log.message}</span>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-[#52525b] space-y-2">
                        <Terminal size={24} className="opacity-20" />
                        <span>No output generated. System idle.</span>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
