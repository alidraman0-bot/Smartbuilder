'use client';

/**
 * ScaffoldViewer — Full-stack project scaffold browser.
 * Shows generated file tree grouped by layer (frontend/backend/database/config)
 * with syntax-highlighted content preview and copy/download-all actions.
 */

import React, { useState, useMemo } from 'react';
import {
  FileCode2, Database, Server, Settings2, FolderOpen,
  Copy, Download, Check, ChevronRight, ChevronDown,
  FileJson, FileText, Code2
} from 'lucide-react';

interface ScaffoldFile {
  path: string;
  content: string;
  type: 'frontend' | 'backend' | 'database' | 'config';
}

interface ScaffoldViewerProps {
  files: ScaffoldFile[];
  isLoading?: boolean;
}

const TYPE_META: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  frontend: { icon: FileCode2, label: 'Frontend', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  backend: { icon: Server, label: 'Backend', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  database: { icon: Database, label: 'Database', color: 'text-amber-600', bg: 'bg-amber-50' },
  config: { icon: Settings2, label: 'Config', color: 'text-gray-600', bg: 'bg-gray-100' },
};

function FileIcon({ filename }: { filename: string }) {
  if (filename.endsWith('.json')) return <FileJson size={13} className="text-amber-500" />;
  if (filename.endsWith('.sql')) return <Database size={13} className="text-blue-500" />;
  if (filename.endsWith('.md') || filename.endsWith('.txt')) return <FileText size={13} className="text-gray-400" />;
  return <Code2 size={13} className="text-indigo-400" />;
}

export default function ScaffoldViewer({ files, isLoading = false }: ScaffoldViewerProps) {
  const [selectedFile, setSelectedFile] = useState<ScaffoldFile | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['frontend', 'backend', 'database', 'config']));

  // Group files by type
  const grouped = useMemo(() => {
    const groups: Record<string, ScaffoldFile[]> = {
      frontend: [],
      backend: [],
      database: [],
      config: [],
    };
    for (const f of files) {
      const t = f.type in groups ? f.type : 'config';
      groups[t].push(f);
    }
    return groups;
  }, [files]);

  const handleCopyFile = async () => {
    if (!selectedFile) return;
    await navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    // Simple approach: create individual blobs and trigger downloads
    // For a real zip we'd use JSZip; here we do a single concatenated text file
    const all = files.map(f => `// === ${f.path} ===\n${f.content}\n`).join('\n\n');
    const blob = new Blob([all], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scaffold.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium">Generating scaffold...</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center max-w-xs">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-200" />
          <h3 className="text-sm font-bold text-gray-700 mb-1">No scaffold yet</h3>
          <p className="text-xs text-gray-400">The full-stack file tree will appear here once your build completes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── File Tree (left panel) ── */}
      <div className="w-64 shrink-0 border-r border-gray-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-11 flex items-center justify-between px-4 border-b border-gray-100 bg-gray-50/80 shrink-0">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Project Structure</span>
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            title="Download all files"
          >
            <Download size={11} /> Export
          </button>
        </div>

        {/* Layer summary badges */}
        <div className="px-3 py-2 flex flex-wrap gap-1.5 border-b border-gray-100 bg-gray-50/40 shrink-0">
          {Object.entries(TYPE_META).map(([key, meta]) => {
            const count = grouped[key]?.length || 0;
            if (!count) return null;
            const Icon = meta.icon;
            return (
              <span key={key} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.color} ${meta.bg}`}>
                <Icon size={9} /> {count}
              </span>
            );
          })}
        </div>

        {/* Group list */}
        <div className="flex-1 overflow-y-auto py-2">
          {Object.entries(grouped).map(([group, groupFiles]) => {
            if (!groupFiles.length) return null;
            const meta = TYPE_META[group];
            const Icon = meta.icon;
            const isOpen = expandedGroups.has(group);
            return (
              <div key={group} className="mb-1">
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50 transition-colors"
                >
                  {isOpen ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronRight size={12} className="text-gray-400" />}
                  <Icon size={13} className={meta.color} />
                  <span className="text-xs font-bold text-gray-700">{meta.label}</span>
                  <span className="ml-auto text-[10px] text-gray-400 font-medium">{groupFiles.length}</span>
                </button>

                {/* Files */}
                {isOpen && groupFiles.map((file) => {
                  const filename = file.path.split('/').pop() || file.path;
                  const isSelected = selectedFile?.path === file.path;
                  return (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full flex items-center gap-2 pl-8 pr-3 py-1.5 text-left transition-colors ${
                        isSelected ? 'bg-indigo-50 border-r-2 border-indigo-500' : 'hover:bg-gray-50'
                      }`}
                    >
                      <FileIcon filename={filename} />
                      <span className={`text-xs truncate ${isSelected ? 'text-indigo-700 font-semibold' : 'text-gray-600'}`}>
                        {filename}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── File Content (right panel) ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedFile ? (
          <>
            {/* File header */}
            <div className="h-11 flex items-center justify-between px-4 border-b border-gray-100 bg-gray-50/80 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <FileIcon filename={selectedFile.path.split('/').pop() || ''} />
                <span className="text-xs font-mono text-gray-600 truncate">{selectedFile.path}</span>
                {(() => {
                  const meta = TYPE_META[selectedFile.type];
                  const Icon = meta.icon;
                  return (
                    <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${meta.color} ${meta.bg}`}>
                      <Icon size={9} /> {meta.label}
                    </span>
                  );
                })()}
              </div>
              <button
                onClick={handleCopyFile}
                className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-gray-700 transition-colors ml-4"
              >
                {copied ? <><Check size={12} className="text-emerald-500" /> Copied!</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>

            {/* Code content */}
            <div className="flex-1 overflow-auto bg-gray-950">
              <pre className="p-4 text-[11px] font-mono leading-relaxed text-gray-200 whitespace-pre-wrap break-all">
                {selectedFile.content}
              </pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
            <div className="text-center">
              <Code2 className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p className="text-sm text-gray-400">Select a file to view its contents</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
