import React from 'react';
import { Layers, Network, Globe, Zap } from 'lucide-react';
import { MarketTaxonomy as MarketTaxonomyType } from '@/types/research';

interface MarketTaxonomyProps {
    taxonomy: MarketTaxonomyType;
}

export default function MarketTaxonomy({ taxonomy }: MarketTaxonomyProps) {
    return (
        <section className="space-y-8">
            <div className="flex items-center space-x-3">
                <Layers size={20} className="text-indigo-500" />
                <h2 className="text-2xl font-bold text-white tracking-tight">Market Definition & Scope</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="glass-card p-10 rounded-3xl space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Market Hierarchy Visual */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Market Taxonomy Map</h3>
                        <div className="relative space-y-4">
                            <TaxonomyNode
                                label="Primary Market"
                                value={taxonomy.primary_market}
                                icon={<Globe size={14} />}
                                active
                            />
                            <div className="ml-8 border-l border-indigo-500/30 pl-8 space-y-4 border-dashed py-2">
                                <TaxonomyNode
                                    label="Sub-Markets"
                                    items={taxonomy.sub_markets}
                                    icon={<Network size={14} />}
                                />
                                <TaxonomyNode
                                    label="Adjacent Markets"
                                    items={taxonomy.adjacent_markets}
                                    icon={<Zap size={14} />}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Substitute Markets */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Substitute Markets & Workarounds</h3>
                        <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-4">
                            <p className="text-xs text-zinc-400 leading-relaxed uppercase tracking-wider font-bold">
                                Competitive Displacement Risk
                            </p>
                            <ul className="space-y-3">
                                {taxonomy.substitute_markets.map((market, index) => (
                                    <li key={index} className="flex items-center space-x-3 text-sm text-zinc-300">
                                        <span className="text-red-500 font-bold">✕</span>
                                        <span className="font-medium">{market}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="pt-4 border-t border-red-500/10">
                                <p className="text-[10px] text-zinc-500 italic">
                                    * Substitution analysis helps avoid overestimating TAM by identifying leaks to non-AI alternatives.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TaxonomyNode({ label, value, items, icon, active }: {
    label: string;
    value?: string;
    items?: string[];
    icon: React.ReactNode;
    active?: boolean
}) {
    return (
        <div className={`p-4 rounded-xl border transition-all ${active ? 'bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20' : 'bg-white/[0.02] border-white/5'}`}>
            <div className="flex items-center space-x-3 mb-2">
                <span className={active ? 'text-indigo-400' : 'text-zinc-500'}>{icon}</span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${active ? 'text-indigo-400' : 'text-zinc-600'}`}>{label}</span>
            </div>
            {value && <div className="text-sm font-bold text-white">{value}</div>}
            {items && (
                <div className="flex flex-wrap gap-2">
                    {items.map((item, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white/5 rounded-md text-zinc-300 border border-white/5">
                            {item}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
