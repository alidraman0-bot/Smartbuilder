'use client';

import React, { useState } from 'react';
import { History, CheckCircle2, ChevronRight, FileText, AlertOctagon, XCircle } from 'lucide-react';
// import { Dialog } from '@/components/ui/dialog'; // Assuming we have a dialog/modal primitive or will mock it
// Mocking Dialog for this snippet if not available:
const Modal = ({ isOpen, onClose, children }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#09090b] border border-[#27272a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

interface Incident {
    id: string;
    title: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Resolved' | 'Active';
    duration: string;
    timestamp: string;
    summary: string;
    root_cause: string;
    resolution: string;
}

interface IncidentTimelineProps {
    incidents: Incident[];
}

export default function IncidentTimeline({ incidents }: IncidentTimelineProps) {
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    return (
        <div className="h-full border border-[#27272a] bg-[#0c0c0e] rounded-3xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <History className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-white">Incident Timeline</h3>
            </div>

            <div className="flex-1 space-y-0 relative">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-[#27272a]" />

                {incidents.map((incident, i) => (
                    <div
                        key={incident.id}
                        onClick={() => setSelectedIncident(incident)}
                        className="relative pl-10 pb-8 last:pb-0 group cursor-pointer"
                    >
                        {/* Dot */}
                        <div className={`
                            absolute left-3 top-1 w-2.5 h-2.5 rounded-full border-2 
                            ${incident.severity === 'High' ? 'bg-[#0c0c0e] border-red-500' : 'bg-[#0c0c0e] border-emerald-500'}
                            group-hover:scale-125 transition-transform bg-[#09090b] z-10
                        `} />

                        <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                                {incident.title}
                            </h4>
                            <span className={`text-[10px] font-mono px-1.5 rounded ${incident.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                {incident.status}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                            {new Date(incident.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • Duration: {incident.duration}
                        </p>

                        {/* Preview snippet for high severity */}
                        {incident.severity === 'High' && (
                            <div className="mt-2 text-[11px] text-gray-400 bg-[#18181b] p-2 rounded border border-[#27272a] truncate">
                                {incident.root_cause}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Modal isOpen={!!selectedIncident} onClose={() => setSelectedIncident(null)}>
                {selectedIncident && (
                    <div className="space-y-6">
                        <div className="flex items-start justify-between border-b border-[#27272a] pb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-white tracking-tight">{selectedIncident.title}</h2>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs border border-emerald-500/20 font-medium">
                                        {selectedIncident.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 flex items-center gap-2">
                                    {new Date(selectedIncident.timestamp).toLocaleString()} • Duration: <span className="text-white">{selectedIncident.duration}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Severity</div>
                                <div className={`text-sm font-bold ${selectedIncident.severity === 'High' ? 'text-red-500' : 'text-amber-500'}`}>
                                    {selectedIncident.severity}
                                </div>
                            </div>
                        </div>

                        {/* AI Postmortem */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="p-1 rounded bg-purple-500/10 text-purple-400">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">AI Postmortem</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-[#18181b] p-4 rounded-xl border border-[#27272a]">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Root Cause Analysis</h4>
                                    <p className="text-sm text-gray-300 leading-relaxed font-mono">
                                        {selectedIncident.root_cause}
                                    </p>
                                </div>

                                <div className="bg-[#18181b] p-4 rounded-xl border border-[#27272a]">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Resolution</h4>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        {selectedIncident.resolution}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Summary</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {selectedIncident.summary}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-[#27272a] pt-4 flex justify-end">
                            <button className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Export PDF
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
