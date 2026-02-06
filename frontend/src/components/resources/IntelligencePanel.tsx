import React from 'react';
import { useResourceStore } from '@/store/resourceStore';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const IntelligencePanel: React.FC = () => {
    const { intelligence, isLoading } = useResourceStore();

    if (isLoading || !intelligence) return null;

    return (
        <div className="w-80 flex-shrink-0 h-[calc(100vh-80px)] overflow-y-auto sticky top-[80px] p-6 border-l border-white/5 bg-zinc-950/30 hidden xl:block">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Intelligence</h2>
            </div>

            <div className="space-y-6">
                {/* Suggested Next Action */}
                <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden group">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />

                    <h3 className="text-xs font-semibold text-indigo-300 mb-2">RECOMMENDED NEXT STEP</h3>
                    <p className="text-white text-sm leading-relaxed mb-4">
                        {intelligence.suggested_action.text}
                    </p>

                    <button className="flex items-center gap-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-lg transition-colors w-full justify-center">
                        Open Actions
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                {/* Contextual Insights */}
                <div>
                    <h3 className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wider">Obervations</h3>
                    <div className="space-y-3">
                        {intelligence.insights.map((insight, idx) => (
                            <div key={idx} className="flex gap-3 text-sm text-zinc-400 leading-relaxed p-3 rounded-lg hover:bg-zinc-900/50 border border-transparent hover:border-white/5 transition-all">
                                <TrendingUp className="w-4 h-4 text-emerald-500/70 flex-shrink-0 mt-0.5" />
                                <span>{insight.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
