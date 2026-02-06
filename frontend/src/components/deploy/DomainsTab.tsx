'use client';

import React, { useState } from 'react';
import { Globe, Lock, RefreshCw, AlertCircle, CheckCircle, Plus, Copy, Trash2 } from 'lucide-react';
import { Domain } from '@/types/deploy';

interface DomainsTabProps {
    domains: Domain[];
    onAddDomain: (domain: string) => void;
    onRemoveDomain: (domain: string) => void;
    onVerifyDNS: (domain: string) => void;
}

export default function DomainsTab({
    domains,
    onAddDomain,
    onRemoveDomain,
    onVerifyDNS
}: DomainsTabProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newDomain, setNewDomain] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDomain) {
            onAddDomain(newDomain);
            setNewDomain('');
            setIsAdding(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-[#09090b] p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Domains</h2>
                        <p className="text-gray-400">Manage your production domains and SSL certificates.</p>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Domain
                    </button>
                </div>

                {/* Add Domain Card */}
                {isAdding && (
                    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 animate-in slide-in-from-top-2">
                        <h3 className="text-lg font-bold text-white mb-4">Add a Custom Domain</h3>
                        <form onSubmit={handleSubmit} className="flex gap-4">
                            <input
                                type="text"
                                placeholder="example.com"
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                className="flex-1 bg-black border border-[#27272a] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-white/20"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Add
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-6 py-2 bg-transparent text-gray-400 font-medium rounded-lg hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                )}

                {/* Domains List */}
                <div className="space-y-4">
                    {domains.map((domain) => (
                        <div key={domain.domain} className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
                            {/* Domain Header */}
                            <div className="p-6 flex items-center justify-between border-b border-[#27272a]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-black border border-[#27272a] flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <a
                                            href={`https://${domain.domain}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-lg font-bold text-white hover:underline decoration-white/20 underline-offset-4"
                                        >
                                            {domain.domain}
                                        </a>
                                        <div className="flex items-center gap-2 mt-1">
                                            {domain.type === 'default' && (
                                                <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">Default Subdomain</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* SSL Status */}
                                    <div className="flex items-center gap-2">
                                        {domain.ssl_status === 'active' ? (
                                            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full text-xs font-medium">
                                                <Lock className="w-3 h-3" />
                                                SSL Active
                                            </div>
                                        ) : domain.ssl_status === 'pending' ? (
                                            <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full text-xs font-medium animate-pulse">
                                                <RefreshCw className="w-3 h-3 animate-spin" />
                                                Generating SSL
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full text-xs font-medium">
                                                <AlertCircle className="w-3 h-3" />
                                                SSL Error
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {domain.type !== 'default' && (
                                        <button
                                            onClick={() => onRemoveDomain(domain.domain)}
                                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Configuration / DNS */}
                            {domain.type === 'custom' && (
                                <div className="p-6 bg-[#0d0d10]">
                                    {domain.dns_status === 'verified' ? (
                                        <div className="flex items-center gap-2 text-emerald-500 text-sm">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Valid Configuration</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-1 mt-0.5">
                                                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-white mb-1">Invalid Configuration</h4>
                                                    <p className="text-sm text-gray-400">
                                                        Set the following record on your DNS provider to verify ownership.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => onVerifyDNS(domain.domain)}
                                                    className="ml-auto text-sm text-white border border-[#27272a] bg-[#18181b] px-3 py-1.5 rounded-lg hover:bg-[#27272a] transition-colors"
                                                >
                                                    Verify
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-12 gap-px bg-[#27272a] rounded-lg overflow-hidden border border-[#27272a]">
                                                {/* Header */}
                                                <div className="col-span-2 bg-[#18181b] px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</div>
                                                <div className="col-span-4 bg-[#18181b] px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</div>
                                                <div className="col-span-6 bg-[#18181b] px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Value</div>

                                                {/* Row */}
                                                <div className="col-span-2 bg-black px-4 py-3 text-sm text-white font-mono">CNAME</div>
                                                <div className="col-span-4 bg-black px-4 py-3 text-sm text-white font-mono">
                                                    {domain.domain.startsWith('www') ? 'www' : '@'}
                                                </div>
                                                <div className="col-span-6 bg-black px-4 py-3 text-sm text-white font-mono flex items-center justify-between group">
                                                    <span className="truncate">cname.smartbuilder.app</span>
                                                    <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all">
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
