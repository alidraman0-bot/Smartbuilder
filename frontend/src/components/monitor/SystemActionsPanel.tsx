'use client';

import React, { useState } from 'react';
import { ShieldAlert, Zap, ArrowRight, CheckCircle2, Loader2, AlertTriangle, AlertOctagon } from 'lucide-react';
import RemediationModal from './RemediationModal';

interface RemediationAction {
    id: string;
    issue: string;
    impact: string;
    fix: string;
    confidence: 'High' | 'Medium' | 'Low';
    effort: 'Low' | 'Medium' | 'High';
    status: 'pending' | 'applying' | 'resolved';
}

interface SystemActionsPanelProps {
    actions: RemediationAction[];
}

export default function SystemActionsPanel({ actions }: SystemActionsPanelProps) {
    const [selectedAction, setSelectedAction] = useState<RemediationAction | null>(null);
    const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

    // Import lazily or just use standard import at top. Used standard import in previous step so doing it here.
    // Note: I need to add the import statement at the top as well, so I will replace the whole file content or a large chunk to be safe.

    // Actually, let's just rewrite the component body and imports carefully.
    // I will use replace_file_content on the whole file to be clean.

    if (actions.length === 0 && resolvedIds.size === 0) return null;

    const handleApplyClick = (action: RemediationAction) => {
        setSelectedAction(action);
    };

    const handleConfirmRemediation = async (id: string) => {
        // Here we would call the backend to actually apply it
        // For now, update local state
        setResolvedIds(prev => new Set(prev).add(id));
        setSelectedAction(null);
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-white">System Actions</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {actions.filter(a => !resolvedIds.has(a.id)).length} Recommended
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {actions.map(action => {
                    const isResolved = resolvedIds.has(action.id);

                    if (isResolved) return null;

                    return (
                        <div key={action.id} className="group relative overflow-hidden rounded-xl border border-indigo-500/30 bg-[#0c0c0e] hover:border-indigo-500/50 transition-all">
                            {/* Accent Bar */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/50" />

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                                            <span className="text-xs font-medium text-amber-500 uppercase tracking-wider">Issue Detected</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-white">{action.issue}</h4>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="text-[10px] bg-[#18181b] px-2 py-1 rounded border border-[#27272a] text-gray-400">
                                            Confidence: <span className="text-emerald-400 font-bold">{action.confidence}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-[#18181b]/50 p-3 rounded-lg border border-[#27272a]">
                                        <div className="text-xs text-gray-500 mb-1">Impact</div>
                                        <div className="text-sm text-gray-300 font-medium">{action.impact}</div>
                                    </div>
                                    <div className="bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
                                        <div className="text-xs text-indigo-300/70 mb-1">Proposed Fix</div>
                                        <div className="text-sm text-indigo-100 font-medium">{action.fix}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleApplyClick(action)}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-900/20"
                                    >
                                        <Zap className="w-4 h-4" />
                                        Apply Fix
                                    </button>
                                    <button className="px-4 py-2.5 text-xs font-semibold text-gray-500 hover:text-white transition-colors">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <RemediationModal
                isOpen={!!selectedAction}
                onClose={() => setSelectedAction(null)}
                action={selectedAction}
                onConfirm={handleConfirmRemediation}
            />
        </div>
    );
}
