/**
 * S4: Build Surface
 * 
 * Main workspace area.
 * - Live Preview (Sandboxed iframe)
 * - Code View
 * - File Tree
 */

"use client";

import React, { useState } from 'react';
import {
    Layout, Code as CodeIcon, FolderTree,
    RefreshCw, ExternalLink, Smartphone, Monitor
} from 'lucide-react';
import { useMvpBuilderStore } from '@/store/useMvpBuilderStore';

type Tab = 'preview' | 'code' | 'files';

export default function BuildSurface() {
    const { previewUrl, previewStatus, currentFiles, uiState } = useMvpBuilderStore();
    const [activeTab, setActiveTab] = useState<Tab>('preview');
    const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');

    // If recovering, show overlay
    const isRecovering = uiState === 'S5';

    return (
        <div className="flex-1 flex flex-col bg-[#14141a] relative overflow-hidden">

            {/* Toolbar */}
            <div className="h-10 border-b border-[#27272a] flex items-center justify-between px-4 bg-[#18181b]">
                <div className="flex items-center space-x-1 bg-[#0a0a0f] p-0.5 rounded border border-[#27272a]">
                    <TabButton
                        active={activeTab === 'preview'}
                        icon={<Layout size={14} />}
                        label="Preview"
                        onClick={() => setActiveTab('preview')}
                    />
                    <TabButton
                        active={activeTab === 'code'}
                        icon={<CodeIcon size={14} />}
                        label="Code"
                        onClick={() => setActiveTab('code')}
                    />
                    <TabButton
                        active={activeTab === 'files'}
                        icon={<FolderTree size={14} />}
                        label="Structure"
                        onClick={() => setActiveTab('files')}
                    />
                </div>

                {activeTab === 'preview' && (
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 bg-[#0a0a0f] p-0.5 rounded border border-[#27272a]">
                            <button
                                onClick={() => setViewport('desktop')}
                                className={`p-1 rounded ${viewport === 'desktop' ? 'bg-[#27272a] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <Monitor size={14} />
                            </button>
                            <button
                                onClick={() => setViewport('mobile')}
                                className={`p-1 rounded ${viewport === 'mobile' ? 'bg-[#27272a] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <Smartphone size={14} />
                            </button>
                        </div>
                        <div className="w-px h-4 bg-[#27272a]" />
                        <button className="text-zinc-500 hover:text-white transition-colors">
                            <RefreshCw size={14} />
                        </button>
                        <button className="text-zinc-500 hover:text-white transition-colors">
                            <ExternalLink size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 relative bg-[#0a0a0f] flex items-center justify-center p-4">

                {/* 1. Live Preview */}
                {activeTab === 'preview' && (
                    <div className={`transition-all duration-500 ease-in-out relative shadow-2xl ${viewport === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full'
                        } bg-white rounded-lg overflow-hidden border border-[#27272a]`}>
                        {previewStatus === 'loading' ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]">
                                <div className="flex flex-col items-center space-y-3">
                                    <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                                    <span className="text-xs text-zinc-500">Booting Sandbox...</span>
                                </div>
                            </div>
                        ) : (
                            <iframe
                                src={previewUrl || "about:blank"}
                                className="w-full h-full border-none"
                                title="Live Preview"
                                style={{ pointerEvents: isRecovering ? 'none' : 'auto' }}
                            />
                        )}

                        {/* Recovery Overlay */}
                        {isRecovering && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                                <div className="bg-[#18181b] border border-amber-900/50 p-6 rounded-xl max-w-sm text-center shadow-2xl">
                                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                                        <RefreshCw size={24} className="text-amber-500 animate-spin" />
                                    </div>
                                    <h3 className="text-white font-bold mb-2">Stabilizing Build</h3>
                                    <p className="text-sm text-zinc-400">
                                        An issue was detected. The system is attempting to auto-fix the verify the codebase.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. Code View (Simplified for MVP) */}
                {activeTab === 'code' && (
                    <div className="w-full h-full bg-[#0a0a0f] rounded-lg border border-[#27272a] overflow-hidden flex">
                        <div className="w-48 border-r border-[#27272a] overflow-y-auto">
                            {currentFiles.map((file, idx) => (
                                <div key={idx} className="px-3 py-2 text-xs text-zinc-400 hover:bg-[#18181b] cursor-pointer truncate font-mono">
                                    {file.path}
                                </div>
                            ))}
                        </div>
                        <div className="flex-1 p-4 overflow-auto">
                            <pre className="text-xs font-mono text-zinc-300">
                                {currentFiles[0]?.content || "// Select a file to view content"}
                            </pre>
                        </div>
                    </div>
                )}

                {/* 3. File Structure */}
                {activeTab === 'files' && (
                    <div className="w-full h-full p-8 overflow-y-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {currentFiles.map((file, idx) => (
                                <div key={idx} className="bg-[#18181b] border border-[#27272a] p-3 rounded-lg flex items-center space-x-3">
                                    <div className={`p-2 rounded bg-opacity-10 ${file.type === 'tsx' ? 'bg-blue-500 text-blue-400' :
                                            file.type === 'css' ? 'bg-pink-500 text-pink-400' :
                                                'bg-zinc-500 text-zinc-400'
                                        }`}>
                                        <FileIcon type={file.type} />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-xs font-medium text-white truncate">
                                            {file.path.split('/').pop()}
                                        </span>
                                        <span className="text-[10px] text-zinc-500 truncate">
                                            {file.path}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function TabButton({ active, icon, label, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${active ? 'bg-[#27272a] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

function FileIcon({ type }: { type: string }) {
    // Simplified icon logic
    return <CodeIcon size={16} />;
}
