'use client';

import React, { useState } from 'react';
import { X, Info, Terminal, Settings, Key, ExternalLink } from 'lucide-react';
import { DeploymentDetails, DeploymentLog } from '@/types/deploy';
import DeploymentActions from './DeploymentActions';

interface DeploymentDetailsDrawerProps {
    deploymentDetails: DeploymentDetails | null;
    isOpen: boolean;
    onClose: () => void;
    onRedeploy?: (deploymentId: string) => void;
    onRollback?: (deploymentId: string) => void;
    onPromoteToProduction?: (deploymentId: string) => void;
}

type Tab = 'overview' | 'logs' | 'configuration' | 'env';

export default function DeploymentDetailsDrawer({
    deploymentDetails,
    isOpen,
    onClose,
    onRedeploy,
    onRollback,
    onPromoteToProduction
}: DeploymentDetailsDrawerProps) {
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    if (!isOpen || !deploymentDetails) return null;

    const { deployment, logs, configuration, environment_variables } = deploymentDetails;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-[#09090b] border-l border-[#27272a] z-50 flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white">Deployment Details</h2>
                        <p className="text-sm text-gray-500 font-mono mt-1">{deployment.deployment_id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#18181b] rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-[#27272a] px-6">
                    <div className="flex gap-6">
                        {[
                            { id: 'overview' as Tab, label: 'Overview', icon: Info },
                            { id: 'logs' as Tab, label: 'Build Logs', icon: Terminal },
                            { id: 'configuration' as Tab, label: 'Configuration', icon: Settings },
                            { id: 'env' as Tab, label: 'Environment Variables', icon: Key },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`
                                    flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors
                                    ${activeTab === id
                                        ? 'text-white border-blue-500'
                                        : 'text-gray-500 border-transparent hover:text-gray-400'
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'overview' && (
                        <OverviewTab deployment={deployment} />
                    )}
                    {activeTab === 'logs' && (
                        <BuildLogsTab logs={logs} />
                    )}
                    {activeTab === 'configuration' && (
                        <ConfigurationTab configuration={configuration} />
                    )}
                    {activeTab === 'env' && (
                        <EnvironmentVariablesTab variables={environment_variables} />
                    )}
                </div>

                {/* Actions Footer */}
                {onRedeploy && onRollback && onPromoteToProduction && (
                    <DeploymentActions
                        deployment={deployment}
                        onRedeploy={() => onRedeploy(deployment.deployment_id)}
                        onRollback={() => onRollback(deployment.deployment_id)}
                        onPromoteToProduction={() => onPromoteToProduction(deployment.deployment_id)}
                    />
                )}
            </div>
        </>
    );
}

// Tab Components

function OverviewTab({ deployment }: { deployment: DeploymentDetails['deployment'] }) {
    return (
        <div className="space-y-6">
            <DetailRow label="Deployment ID" value={deployment.deployment_id} mono />
            <DetailRow label="Status" value={deployment.status} badge={deployment.status} />
            <DetailRow label="Source" value="Smartbuilder Build v0.3" />
            <DetailRow label="Trigger" value={`User: ${deployment.triggered_by}`} />
            <DetailRow label="Environment" value={deployment.environment} badge={deployment.environment} />
            <DetailRow label="Version" value={deployment.version} mono />
            <DetailRow label="Created" value={new Date(deployment.created_at).toLocaleString()} />
            {deployment.completed_at && (
                <DetailRow label="Completed" value={new Date(deployment.completed_at).toLocaleString()} />
            )}
            {deployment.duration && (
                <DetailRow label="Build Duration" value={deployment.duration} />
            )}
            {deployment.url && (
                <div className="pt-4 border-t border-[#27272a]">
                    <a
                        href={deployment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors group"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-sm font-medium">Visit Deployment</span>
                    </a>
                </div>
            )}
        </div>
    );
}

function BuildLogsTab({ logs }: { logs: DeploymentLog[] }) {
    const logTypeStyles = {
        info: 'text-gray-400',
        success: 'text-emerald-500',
        warning: 'text-yellow-500',
        error: 'text-red-500'
    };

    return (
        <div className="bg-black rounded-lg p-4 font-mono text-xs overflow-x-auto">
            {logs.length === 0 ? (
                <p className="text-gray-600">No logs available</p>
            ) : (
                <div className="space-y-1">
                    {logs.map((log, index) => (
                        <div key={index} className="flex gap-4">
                            <span className="text-gray-600 shrink-0">{log.timestamp}</span>
                            <span className="text-gray-500 uppercase shrink-0 w-20">{log.stage}</span>
                            <span className={logTypeStyles[log.type]}>
                                {log.message}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ConfigurationTab({ configuration }: { configuration: DeploymentDetails['configuration'] }) {
    return (
        <div className="space-y-6">
            <DetailRow label="Runtime" value={configuration.runtime} />
            <DetailRow label="Region" value={configuration.region} />
            <DetailRow label="Memory" value={configuration.memory} />
            <DetailRow label="Timeout" value={configuration.timeout} />
            <DetailRow label="Build Command" value={configuration.build_command} mono />
            <DetailRow label="Start Command" value={configuration.start_command} mono />
        </div>
    );
}

function EnvironmentVariablesTab({ variables }: { variables: DeploymentDetails['environment_variables'] }) {
    return (
        <div className="space-y-4">
            {variables.length === 0 ? (
                <p className="text-sm text-gray-500">No environment variables configured</p>
            ) : (
                variables.map((envVar, index) => (
                    <div key={index} className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white font-mono">{envVar.key}</span>
                            <span className={`
                                px-2 py-0.5 rounded text-xs
                                ${envVar.environment === 'Production'
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : envVar.environment === 'Preview'
                                        ? 'bg-blue-500/10 text-blue-500'
                                        : 'bg-gray-500/10 text-gray-500'
                                }
                            `}>
                                {envVar.environment}
                            </span>
                        </div>
                        <div className="text-sm text-gray-400 font-mono">
                            {envVar.is_secret ? '••••••••••••••••' : envVar.value}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

// Utility Components

function DetailRow({
    label,
    value,
    mono = false,
    badge
}: {
    label: string;
    value: string;
    mono?: boolean;
    badge?: string;
}) {
    const getBadgeStyle = (badge: string) => {
        if (badge === 'success') return 'bg-emerald-500/10 text-emerald-500';
        if (badge === 'failed') return 'bg-red-500/10 text-red-500';
        if (badge === 'building') return 'bg-yellow-500/10 text-yellow-500';
        if (badge === 'Production') return 'bg-emerald-500/10 text-emerald-500';
        if (badge === 'Preview') return 'bg-blue-500/10 text-blue-500';
        return 'bg-gray-500/10 text-gray-500';
    };

    return (
        <div className="flex items-start justify-between py-3 border-b border-[#27272a] last:border-0">
            <span className="text-sm text-gray-500 font-medium">{label}</span>
            {badge ? (
                <span className={`px-2 py-1 rounded text-xs font-medium ${getBadgeStyle(badge)}`}>
                    {value}
                </span>
            ) : (
                <span className={`text-sm text-white ${mono ? 'font-mono' : ''}`}>{value}</span>
            )}
        </div>
    );
}
