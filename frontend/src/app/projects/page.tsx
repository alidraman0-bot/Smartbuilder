/**
 * Projects Dashboard
 */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Layers, ArrowRight, Download, Play, Rocket, MonitorPlay, AlertCircle, RefreshCw } from 'lucide-react';
import { useBuildEngineStore } from '@/store/useBuildEngineStore';
import { useProjects } from '@/hooks/useProjects';

export default function ProjectsPage() {
    const router = useRouter();
    const { loadProject } = useBuildEngineStore();
    const { projects, isLoading, error, refetch } = useProjects();

    const handleOpenProject = async (projectId: string) => {
        await loadProject(projectId);
        router.push('/mvp');
    };

    const handleExport = (projectId: string) => {
        window.open(`/api/v1/projects/${projectId}/export`, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#06060a] p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <Layers className="text-indigo-500" />
                            Your Projects
                        </h1>
                        <p className="text-zinc-500 text-sm mt-2">Manage, edit, and export your AI-generated applications.</p>
                    </div>
                    <button
                        onClick={() => router.push('/builder')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                        <Rocket size={16} /> New Project
                    </button>
                </div>

                {error ? (
                    <div className="text-center py-24 bg-red-500/10 border border-red-500/20 rounded-3xl">
                        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Failed to load projects</h3>
                        <p className="text-red-400 text-sm mb-6">{error}</p>
                        <button onClick={refetch} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg inline-flex items-center gap-2">
                            <RefreshCw size={16} /> Retry
                        </button>
                    </div>
                ) : isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-24 bg-white/[0.02] border border-white/[0.04] rounded-3xl">
                        <MonitorPlay size={48} className="text-zinc-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
                        <p className="text-zinc-500 text-sm">Create your first AI startup idea to get started.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {projects.map((project, i) => (
                            <div key={project.project_id || i} className="bg-white/[0.02] border border-white/[0.04] p-5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.04] transition-colors">
                                <div>
                                    <h3 className="text-lg font-bold text-white text-capitalize">{project.name || 'Untitled App'}</h3>
                                    <div className="flex gap-4 mt-1 text-xs text-zinc-500">
                                        <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleExport(project.project_id)}
                                        className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-colors tooltip flex items-center justify-center"
                                        title="Export Code"
                                    >
                                        <Download size={16} /> Export Code
                                    </button>
                                    <button
                                        onClick={() => handleOpenProject(project.project_id)}
                                        className="px-5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
                                    >
                                        <Play size={14} /> Open Builder
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
