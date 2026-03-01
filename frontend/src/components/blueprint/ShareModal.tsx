"use client";

import React, { useState } from "react";
import { X, Link2, FileDown, Check } from "lucide-react";

interface ShareModalProps {
    onClose: () => void;
    startupName?: string;
}

export default function ShareModal({ onClose, startupName }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for browsers without clipboard API
            const el = document.createElement("textarea");
            el.value = window.location.href;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleExportPDF = () => {
        // Inject a temporary print-optimised style, fire print, then clean up
        const style = document.createElement("style");
        style.id = "blueprint-print-style";
        style.innerHTML = `
      @media print {
        body > *:not(#blueprint-print-root) { display: none !important; }
        #blueprint-print-root { display: block !important; }
        .no-print { display: none !important; }
        body { background: white !important; color: black !important; }
        .blueprint-card { border: 1px solid #ccc !important; break-inside: avoid; margin-bottom: 16px; padding: 16px; border-radius: 8px; }
      }
    `;
        document.head.appendChild(style);
        window.print();
        // Clean up
        setTimeout(() => {
            const el = document.getElementById("blueprint-print-style");
            if (el) el.remove();
        }, 1000);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 pb-8 animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-gradient-to-br from-[#18181b] to-[#0d0d10] border border-[#27272a] rounded-3xl p-6 shadow-2xl mx-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-white font-bold text-lg">Share Blueprint</h3>
                            {startupName && (
                                <p className="text-gray-500 text-xs mt-0.5">{startupName}</p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* Copy Link */}
                        <button
                            onClick={handleCopyLink}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#09090b] border border-[#27272a] hover:border-violet-500/40 hover:bg-violet-500/5 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/20 transition-colors">
                                {copied ? (
                                    <Check className="w-5 h-5 text-emerald-400" />
                                ) : (
                                    <Link2 className="w-5 h-5 text-violet-400" />
                                )}
                            </div>
                            <div className="text-left">
                                <p className="text-white text-sm font-semibold">
                                    {copied ? "Link Copied!" : "Copy Link"}
                                </p>
                                <p className="text-gray-500 text-xs mt-0.5">
                                    Share this blueprint with a link
                                </p>
                            </div>
                        </button>

                        {/* Export PDF */}
                        <button
                            onClick={handleExportPDF}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#09090b] border border-[#27272a] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                                <FileDown className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-white text-sm font-semibold">Export PDF</p>
                                <p className="text-gray-500 text-xs mt-0.5">
                                    Download a print-ready PDF copy
                                </p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
