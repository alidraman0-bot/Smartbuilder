'use client';

import React, { useState } from 'react';
import { RotateCcw, Rocket, Edit, AlertTriangle, X, TrendingUp } from 'lucide-react';
import { Deployment } from '@/types/deploy';
import { useRouter } from 'next/navigation';

interface DeploymentActionsProps {
    deployment: Deployment;
    onRedeploy: () => void;
    onRollback: () => void;
    onPromoteToProduction: () => void;
}

export default function DeploymentActions({
    deployment,
    onRedeploy,
    onRollback,
    onPromoteToProduction
}: DeploymentActionsProps) {
    const router = useRouter();
    const [showRollbackModal, setShowRollbackModal] = useState(false);
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [rollbackReason, setRollbackReason] = useState('');

    const handleEditViaPrompt = () => {
        router.push('/mvp');
    };

    const handleConfirmRollback = () => {
        onRollback();
        setShowRollbackModal(false);
        setRollbackReason('');
    };

    const handleConfirmPromote = () => {
        onPromoteToProduction();
        setShowPromoteModal(false);
    };

    const isProduction = deployment.environment === 'Production';
    const canPromote = deployment.environment === 'Preview' && deployment.status === 'success';

    return (
        <>
            <div className="p-6 border-t border-[#27272a] bg-[#0d0d10]">
                <div className="flex items-center gap-3">
                    {/* Redeploy */}
                    <button
                        onClick={onRedeploy}
                        className="flex items-center gap-2 px-4 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-sm font-medium text-white hover:bg-[#27272a] transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Redeploy
                    </button>

                    {/* Promote to Production (only for successful Preview deployments) */}
                    {canPromote && (
                        <button
                            onClick={() => setShowPromoteModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium text-white transition-colors"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Promote to Production
                        </button>
                    )}

                    {/* Rollback (only for Production) */}
                    {isProduction && (
                        <button
                            onClick={() => setShowRollbackModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#18181b] border border-red-500/20 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            Rollback
                        </button>
                    )}

                    {/* Edit via Prompt */}
                    <button
                        onClick={handleEditViaPrompt}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm font-medium text-blue-500 hover:bg-blue-500/20 transition-colors ml-auto"
                    >
                        <Edit className="w-4 h-4" />
                        Edit via Prompt
                    </button>
                </div>
            </div>

            {/* Rollback Confirmation Modal */}
            {showRollbackModal && (
                <Modal onClose={() => setShowRollbackModal(false)}>
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">
                                Rollback Deployment
                            </h3>
                            <p className="text-sm text-gray-400">
                                This will immediately revert to the previous stable deployment
                            </p>
                        </div>
                    </div>

                    <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-300">
                            Current deployment will be decommissioned and traffic will be rerouted to the last stable version. This action cannot be undone.
                        </p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Reason for rollback
                        </label>
                        <input
                            type="text"
                            value={rollbackReason}
                            onChange={(e) => setRollbackReason(e.target.value)}
                            placeholder="e.g., Critical bug in production"
                            className="w-full px-4 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowRollbackModal(false)}
                            className="flex-1 px-4 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-sm font-medium text-white hover:bg-[#27272a] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmRollback}
                            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium text-white transition-colors"
                        >
                            Confirm Rollback
                        </button>
                    </div>
                </Modal>
            )}

            {/* Promote to Production Modal */}
            {showPromoteModal && (
                <Modal onClose={() => setShowPromoteModal(false)}>
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <Rocket className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">
                                Promote to Production
                            </h3>
                            <p className="text-sm text-gray-400">
                                Deploy this preview to production environment
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between py-2 border-b border-[#27272a]">
                            <span className="text-sm text-gray-400">Version</span>
                            <span className="text-sm text-white font-mono">{deployment.version}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#27272a]">
                            <span className="text-sm text-gray-400">Environment</span>
                            <span className="text-sm text-emerald-500 font-medium">Production</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#27272a]">
                            <span className="text-sm text-gray-400">Traffic Routing</span>
                            <span className="text-sm text-white">100%</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-400">Rollback Available</span>
                            <span className="text-sm text-emerald-500">✓ Yes</span>
                        </div>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-300">
                            This will deploy to production and automatically reroute all traffic to this version.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowPromoteModal(false)}
                            className="flex-1 px-4 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-sm font-medium text-white hover:bg-[#27272a] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmPromote}
                            className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium text-white transition-colors"
                        >
                            Deploy to Production
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}

// Modal Wrapper Component
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div
                className="fixed inset-0"
                onClick={onClose}
            />
            <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-6 max-w-md w-full relative z-10 animate-in slide-in-from-bottom-4 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 hover:bg-[#18181b] rounded transition-colors"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>
                {children}
            </div>
        </div>
    );
}
