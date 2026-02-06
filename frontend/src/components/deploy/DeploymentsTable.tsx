'use client';

import React from 'react';
import { ExternalLink, Circle, Clock, Activity } from 'lucide-react';
import { Deployment } from '@/types/deploy';
import Link from 'next/link';

interface DeploymentsTableProps {
    deployments: Deployment[];
    selectedDeploymentId: string | null;
    onSelectDeployment: (deploymentId: string) => void;
}

export default function DeploymentsTable({
    deployments,
    selectedDeploymentId,
    onSelectDeployment
}: DeploymentsTableProps) {

    const getStatusConfig = (status: Deployment['status']) => {
        switch (status) {
            case 'success':
                return {
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-500/10',
                    dot: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]',
                    label: 'Success'
                };
            case 'building':
                return {
                    color: 'text-yellow-500',
                    bg: 'bg-yellow-500/10',
                    dot: 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.4)] animate-pulse',
                    label: 'Building'
                };
            case 'failed':
                return {
                    color: 'text-red-500',
                    bg: 'bg-red-500/10',
                    dot: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]',
                    label: 'Failed'
                };
            case 'queued':
                return {
                    color: 'text-gray-500',
                    bg: 'bg-gray-500/10',
                    dot: 'bg-gray-500',
                    label: 'Queued'
                };
        }
    };

    const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    return (
        <div className="flex-1 overflow-hidden flex flex-col bg-[#09090b]">
            {/* Header */}
            <div className="p-6 border-b border-[#27272a]">
                <h1 className="text-2xl font-bold text-white">Deployments</h1>
            </div>

            {/* Table Header */}
            <div className="px-6 py-3 border-b border-[#27272a] bg-[#0d0d10]">
                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Health</div>
                    <div className="col-span-3">Commit / Change</div>
                    <div className="col-span-2">Environment</div>
                    <div className="col-span-2">Time</div>
                    <div className="col-span-1">URL</div>
                </div>
            </div>

            {/* Table Rows */}
            <div className="flex-1 overflow-y-auto">
                {deployments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20">
                        <div className="w-16 h-16 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center mb-4">
                            <Circle className="w-8 h-8 text-gray-700" />
                        </div>
                        <p className="text-sm text-gray-500">No deployments yet</p>
                        <p className="text-xs text-gray-600 mt-1">Deploy your first project to see it here</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#27272a]">
                        {deployments.map((deployment) => {
                            const statusConfig = getStatusConfig(deployment.status);
                            const isSelected = deployment.deployment_id === selectedDeploymentId;

                            // Mock Health Data for Live deployments
                            const showHealth = deployment.status === 'success';

                            return (
                                <div
                                    key={deployment.deployment_id}
                                    onClick={() => onSelectDeployment(deployment.deployment_id)}
                                    className={`
                                        w-full text-left px-6 py-4 transition-all group flex items-center cursor-pointer
                                        ${isSelected
                                            ? 'bg-[#18181b] border-l-2 border-l-blue-500'
                                            : 'hover:bg-[#18181b]/50 border-l-2 border-transparent'}
                                    `}
                                >
                                    <div className="grid grid-cols-12 gap-4 items-center w-full">
                                        {/* Status */}
                                        <div className="col-span-2 flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                                            <span className={`text-sm font-medium ${statusConfig.color}`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>

                                        {/* Health Indicators (New) */}
                                        <div className="col-span-2">
                                            {showHealth ? (
                                                <Link
                                                    href={`/monitor?deployment_id=${deployment.deployment_id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex flex-col group/health"
                                                >
                                                    <div className="flex items-center gap-1.5 mb-0.5">
                                                        <Activity className="w-3 h-3 text-emerald-400" />
                                                        <span className="text-xs font-mono font-medium text-emerald-400">99.9%</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-mono group-hover/health:text-blue-400 transition-colors">
                                                        View Pulse →
                                                    </div>
                                                </Link>
                                            ) : (
                                                <span className="text-xs text-gray-600">-</span>
                                            )}
                                        </div>

                                        {/* Commit / Change */}
                                        <div className="col-span-3">
                                            <p className="text-sm text-white font-medium truncate">
                                                {deployment.commit_message}
                                            </p>
                                            <p className="text-xs text-gray-500 font-mono">
                                                {deployment.version}
                                            </p>
                                        </div>

                                        {/* Environment */}
                                        <div className="col-span-2">
                                            <span className={`
                                                inline-flex px-2 py-1 rounded text-xs font-medium
                                                ${deployment.environment === 'Production'
                                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                    : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}
                                            `}>
                                                {deployment.environment}
                                            </span>
                                        </div>

                                        {/* Time */}
                                        <div className="col-span-2 flex items-center gap-2 text-sm text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            {getTimeAgo(deployment.created_at)}
                                        </div>

                                        {/* URL */}
                                        <div className="col-span-1">
                                            {deployment.url ? (
                                                <a
                                                    href={deployment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 transition-colors group/link"
                                                >
                                                    <span className="truncate">Visit</span>
                                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                </a>
                                            ) : (
                                                <span className="text-sm text-gray-600">-</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
