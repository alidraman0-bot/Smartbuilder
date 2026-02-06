/**
 * MonacoEditor Component
 * 
 * A robust, real-time synchronized code editor utilizing Monaco Editor.
 */

"use client";

import React, { useRef, useEffect, useState } from 'react';
import Editor, { OnChange } from '@monaco-editor/react';
import { useCodeSync } from '@/hooks/useCodeSync';

interface MonacoEditorProps {
    appId: string;
    clientId: string;
    filePath: string;
    initialContent: string;
}

export default function MonacoEditor({ appId, clientId, filePath, initialContent }: MonacoEditorProps) {
    const [editorValue, setEditorValue] = useState(initialContent);
    const lastPushedValue = useRef(initialContent);
    const isRemoteUpdate = useRef(false);

    const onRemoteChange = (remotePath: string, remoteContent: string) => {
        if (remotePath === filePath && remoteContent !== editorValue) {
            console.log(`Remote change received for ${filePath}`);
            isRemoteUpdate.current = true;
            setEditorValue(remoteContent);
            lastPushedValue.current = remoteContent;

            // Reset remote update flag after a delay to allow Monaco to render
            setTimeout(() => {
                isRemoteUpdate.current = false;
            }, 100);
        }
    };

    const { status, pushChange } = useCodeSync({
        clientId,
        appId,
        onRemoteChange
    });

    // Handle local changes with debounce
    const handleEditorChange: OnChange = (value) => {
        const newValue = value || "";
        setEditorValue(newValue);

        if (isRemoteUpdate.current) return;

        // Clear existing debounce timer
        if ((window as any).syncTimer) clearTimeout((window as any).syncTimer);

        // Set new debounce timer (300ms)
        (window as any).syncTimer = setTimeout(() => {
            if (newValue !== lastPushedValue.current) {
                console.log(`Pushing local change for ${filePath}`);
                pushChange(filePath, newValue);
                lastPushedValue.current = newValue;
            }
        }, 300);
    };

    // Update editor value if the file path changes
    useEffect(() => {
        setEditorValue(initialContent);
        lastPushedValue.current = initialContent;
    }, [filePath, initialContent]);

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden shadow-2xl">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
                <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-zinc-400">{filePath}</span>
                    {status === 'connected' ? (
                        <div className="flex items-center space-x-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Sync Active</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-1.5">
                            <div className="w-2 h-2 rounded-full bg-zinc-600" />
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Sync Inactive</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-3">
                    <button className="text-[10px] text-zinc-500 hover:text-white transition-colors uppercase font-bold tracking-widest">Format</button>
                    <button className="text-[10px] text-zinc-500 hover:text-white transition-colors uppercase font-bold tracking-widest">Diff</button>
                </div>
            </div>

            {/* Monaco Editor Instance */}
            <div className="flex-1 min-h-0 relative">
                <Editor
                    height="100%"
                    defaultLanguage="typescript"
                    theme="vs-dark"
                    value={editorValue}
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: true },
                        fontSize: 13,
                        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                        fontLigatures: true,
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        smoothScrolling: true,
                        padding: { top: 16, bottom: 16 },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                    }}
                />
            </div>

            {/* Status Footer */}
            <div className="h-6 bg-[#007acc] flex items-center justify-between px-3 text-[10px] text-white">
                <div className="flex items-center space-x-4">
                    <span>UTF-8</span>
                    <span>TypeScript JSX</span>
                </div>
                <div>
                    Smartbuilder Real-Time Sync v1.0
                </div>
            </div>
        </div>
    );
}
