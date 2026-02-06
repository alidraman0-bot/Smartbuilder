'use client';

import React from 'react';
import { Folder, Circle, Clock, ChevronRight } from 'lucide-react';
import { Project } from '@/types/deploy';

interface ProjectsSidebarProps {
    projects: Project[];
    selectedProjectId: string | null;
    onSelectProject: (projectId: string) => void;
}

export default function ProjectsSidebar({
    projects,
    selectedProjectId,
    onSelectProject
}: ProjectsSidebarProps) {

    const getStatusColor = (status: Project['status']) => {
        switch (status) {
            case 'active': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
            case 'building': return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)] animate-pulse';
            case 'failed': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
        }
    };

    const getFrameworkBadge = (framework: Project['framework']) => {
        const config = {
            'Next.js': { bg: 'bg-black', text: 'text-white', border: 'border-white/20' },
            'FastAPI': { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500/20' },
            'React': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
            'Python': { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
            'Full Stack': { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/20' }
        };
        return config[framework] || config['Full Stack'];
    };

    return (
        <div className="w-80 border-r border-[#27272a] bg-[#09090b] flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-[#27272a]">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Projects
                </h2>
                <p className="text-sm text-gray-400">{projects.length} deployment{projects.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Projects List */}
            <div className="flex-1 overflow-y-auto">
                {projects.length === 0 ? (
                    <div className="p-8 text-center">
                        <Folder className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No projects yet</p>
                    </div>
                ) : (
                    <div className="p-2">
                        {projects.map((project) => {
                            const isSelected = project.project_id === selectedProjectId;
                            const frameworkStyle = getFrameworkBadge(project.framework);

                            return (
                                <button
                                    key={project.project_id}
                                    onClick={() => onSelectProject(project.project_id)}
                                    className={`
                                        w-full text-left p-4 rounded-lg mb-2 transition-all group
                                        ${isSelected
                                            ? 'bg-[#18181b] border border-[#27272a]'
                                            : 'hover:bg-[#18181b]/50 border border-transparent'
                                        }
                                    `}
                                >
                                    {/* Project Name & Status */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                                            <span className="text-sm font-medium text-white truncate">
                                                {project.name}
                                            </span>
                                        </div>
                                        <ChevronRight className={`
                                            w-4 h-4 text-gray-600 transition-transform
                                            ${isSelected ? 'text-gray-400 translate-x-1' : 'group-hover:translate-x-1'}
                                        `} />
                                    </div>

                                    {/* Framework & Environment */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`
                                            px-2 py-0.5 rounded text-xs font-medium border
                                            ${frameworkStyle.bg} ${frameworkStyle.text} ${frameworkStyle.border}
                                        `}>
                                            {project.framework}
                                        </span>
                                        <span className={`
                                            px-2 py-0.5 rounded text-xs font-medium
                                            ${project.environment === 'Production'
                                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                            }
                                        `}>
                                            {project.environment}
                                        </span>
                                    </div>

                                    {/* Last Updated */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(project.updated_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
