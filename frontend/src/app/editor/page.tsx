/**
 * Editor Page
 * 
 * Standalone page to test the Real-Time Code Sync and Monaco Editor.
 */

"use client";

import React, { useState, useEffect } from 'react';
import MonacoEditor from '@/components/editor/MonacoEditor';
import { Folder, File, ChevronRight, ChevronDown, Monitor, Cpu, Database, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface FileNode {
    name: string;
    path: string;
    is_dir: boolean;
    size: number;
}

export default function EditorPage() {
    const [files, setFiles] = useState<FileNode[]>([]);
    const [currentFile, setCurrentFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string>("");
    const [loading, setLoading] = useState(false);

    // Mock IDs for testing
    const clientId = "user_" + Math.random().toString(36).substring(7);
    const appId = "test-app-123";

    useEffect(() => {
        fetchFiles("");
    }, []);

    const fetchFiles = async (path: string) => {
        try {
            const response = await fetch(`/api/v1/editor/files?path=${path}`);
            const data = await response.json();
            setFiles(data);
        } catch (err) {
            console.error('Error fetching files:', err);
        }
    };

    const loadFile = async (path: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/editor/file/content?path=${path}`);
            const data = await response.json();
            setFileContent(data.content);
            setCurrentFile(path);
        } catch (err) {
            console.error('Error loading file:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-[#0a0a0f] text-zinc-300 overflow-hidden">
            {/* Top Toolbar */}
            <div className="h-14 border-b border-[#27272a] bg-[#0a0a0f] flex items-center justify-between px-4 z-50">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white tracking-wide uppercase">Code Orchestrator</span>
                        <span className="text-[10px] text-zinc-500 font-mono">APP_ID: {appId}</span>
                    </div>
                </div>

                <div className="flex items-center space-x-1 bg-[#18181b] p-1 rounded-lg border border-[#27272a]">
                    <div className="flex items-center space-x-2 px-6 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
                        <Monitor size={14} />
                        <span>Development</span>
                    </div>
                    <div className="flex items-center space-x-2 px-6 py-1.5 rounded-md text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-all">
                        <Database size={14} />
                        <span>Database</span>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-all">
                        <Save size={14} />
                        <span>Commit Changes</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar File Explorer */}
                <div className="w-64 border-r border-[#27272a] bg-[#0d0d12] flex flex-col">
                    <div className="px-4 py-3 border-b border-[#27272a] flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Workspace</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                        {files.map((file) => (
                            <button
                                key={file.path}
                                onClick={() => file.is_dir ? fetchFiles(file.path) : loadFile(file.path)}
                                className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-xs transition-colors group ${currentFile === file.path ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-white/5 text-zinc-400 hover:text-white'
                                    }`}
                            >
                                {file.is_dir ? <Folder size={14} className="text-zinc-600" /> : <File size={14} className="text-zinc-600" />}
                                <span className="truncate">{file.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0f] p-4">
                    {currentFile ? (
                        <div className="flex-1 min-h-0 relative animate-in fade-in duration-500">
                            {loading && (
                                <div className="absolute inset-0 z-50 bg-[#0a0a0f]/50 backdrop-blur-sm flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                                </div>
                            )}
                            <MonacoEditor
                                appId={appId}
                                clientId={clientId}
                                filePath={currentFile}
                                initialContent={fileContent}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50">
                            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-zinc-500">
                                <Cpu size={40} strokeWidth={1} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">No File Selected</h3>
                                <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">Select a file from the workspace to begin editing in real-time.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
