"use client";

import React from 'react';
import { useFounderStore } from '@/store/useFounderStore';
import { ShieldAlert, AlertTriangle, X, Lock, Unlock } from 'lucide-react';
import clsx from 'clsx';

export default function EmergencyModeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { emergencyMode, triggerEmergency } = useFounderStore();
    const [confirmText, setConfirmText] = React.useState('');
    const [isExecuting, setIsExecuting] = React.useState(false);

    if (!isOpen) return null;

    const handleAction = async (action: string) => {
        if (confirmText !== 'AUTHORIZE' && !emergencyMode) return;
        setIsExecuting(true);
        await triggerEmergency(action);
        setIsExecuting(false);
        setConfirmText('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/40 backdrop-blur-sm selection:bg-red-500 selection:text-white">
            <div className="max-w-md w-full bg-white border border-black shadow-[20px_20px_0px_rgba(0,0,0,0.1)] p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3 text-red-600">
                        <ShieldAlert className="w-6 h-6" />
                        <h2 className="text-xl font-black uppercase tracking-tighter">Emergency Override</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 mb-8 space-y-2">
                    <div className="flex items-center gap-2 text-red-700 font-black text-[10px] uppercase tracking-widest">
                        <AlertTriangle className="w-3 h-3" /> Warning
                    </div>
                    <p className="text-xs text-red-900 leading-relaxed font-medium">
                        Actions in this menu have global, irreversible effects on system availability and AI execution. Every interaction is logged with biometric-grade audit trails.
                    </p>
                </div>

                {!emergencyMode ? (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Verification Required</label>
                            <input
                                type="text"
                                placeholder="Type 'AUTHORIZE' to proceed"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                className="w-full border border-gray-200 p-3 text-sm font-mono focus:outline-none focus:border-black transition-colors"
                            />
                        </div>

                        <button
                            disabled={confirmText !== 'AUTHORIZE' || isExecuting}
                            onClick={() => handleAction('pause_all')}
                            className={clsx(
                                "w-full py-4 text-xs font-black uppercase tracking-[0.2em] mb-3 transition-all",
                                confirmText === 'AUTHORIZE'
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            {isExecuting ? "Executing Pause..." : "Global Build Termination"}
                        </button>

                        <button
                            disabled={confirmText !== 'AUTHORIZE' || isExecuting}
                            onClick={() => handleAction('lock_ai')}
                            className={clsx(
                                "w-full py-4 text-xs font-black uppercase tracking-[0.2em] mb-3 transition-all",
                                confirmText === 'AUTHORIZE'
                                    ? "bg-black text-white hover:bg-gray-900"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            {isExecuting ? "Executing Lock..." : "Lock AI Contributions"}
                        </button>

                        <button
                            disabled={confirmText !== 'AUTHORIZE' || isExecuting}
                            onClick={() => handleAction('rollback_org_wide')}
                            className={clsx(
                                "w-full py-4 text-xs font-black uppercase tracking-[0.2em] transition-all border border-red-200 text-red-600 hover:bg-red-50",
                                confirmText === 'AUTHORIZE'
                                    ? "opacity-100"
                                    : "opacity-40 cursor-not-allowed"
                            )}
                        >
                            {isExecuting ? "Executing Rollback..." : "Force Org-wide Rollback"}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="p-4 bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800">
                            <Unlock className="w-5 h-5" />
                            <div className="text-xs font-bold uppercase tracking-tight">System is currently PAUSED</div>
                        </div>

                        <button
                            disabled={isExecuting}
                            onClick={() => handleAction('restore')}
                            className="w-full py-4 bg-black text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-900 transition-all"
                        >
                            {isExecuting ? "Restoring..." : "Restore Normal Operations"}
                        </button>
                    </div>
                )}

                <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Smartbuilder Founder Security Module v1.0.4</p>
                </div>
            </div>
        </div>
    );
}
