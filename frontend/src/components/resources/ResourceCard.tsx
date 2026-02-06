import React, { useState } from 'react';
import { Resource } from '@/types/resources';
import { useResourceStore } from '@/store/resourceStore';
import { BookOpen, Copy, BarChart3, HelpCircle, ChevronRight, CheckCircle2, Play, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResourceCardProps {
    resource: Resource;
}

const getIcon = (type: string) => {
    switch (type) {
        case 'playbook': return <BookOpen className="w-5 h-5 text-indigo-400" />;
        case 'template': return <LayoutTemplate className="w-5 h-5 text-emerald-400" />;
        case 'benchmark': return <BarChart3 className="w-5 h-5 text-blue-400" />;
        case 'guide': return <HelpCircle className="w-5 h-5 text-amber-400" />;
        default: return <BookOpen className="w-5 h-5 text-zinc-400" />;
    }
};

const getColor = (type: string) => {
    switch (type) {
        case 'playbook': return 'border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-950/10';
        case 'template': return 'border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-950/10';
        case 'benchmark': return 'border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-950/10';
        case 'guide': return 'border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-950/10';
        default: return 'border-white/10 hover:border-white/30';
    }
};

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { applyResource } = useResourceStore();

    const handleApply = (e: React.MouseEvent) => {
        e.stopPropagation();
        applyResource(resource.id);
    };

    return (
        <motion.div
            layout
            onClick={() => setIsExpanded(!isExpanded)}
            className={`group relative rounded-xl border bg-zinc-900/40 backdrop-blur-sm overflow-hidden cursor-pointer transition-all duration-300 ${getColor(resource.type)} ${isExpanded ? 'col-span-1 row-span-2 ring-1 ring-white/10' : ''
                }`}
        >
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                        {getIcon(resource.type)}
                    </div>
                    <div className="flex gap-2">
                        {resource.stage_relevance.map(stage => (
                            <span key={stage} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-white/5 text-zinc-400 border border-white/5">
                                {stage}
                            </span>
                        ))}
                    </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white/90">{resource.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                    {resource.description}
                </p>

                {/* Expanded View */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 pt-6 border-t border-white/5 space-y-6"
                        >
                            {/* Playbook Content */}
                            {resource.type === 'playbook' && resource.content.steps && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">When to Use</p>
                                            <p className="text-sm text-zinc-300">{resource.content.when_to_use}</p>
                                        </div>
                                        <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Outcome</p>
                                            <p className="text-sm text-zinc-300">{resource.content.expected_outcome}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Execution Steps</p>
                                        <div className="space-y-2">
                                            {resource.content.steps.map((step, i) => (
                                                <div key={i} className="flex gap-3 text-sm text-zinc-300">
                                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-500/20">
                                                        {i + 1}
                                                    </span>
                                                    <span>{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleApply}
                                        className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-medium transition-colors"
                                    >
                                        <Play className="w-4 h-4" />
                                        Apply to Project
                                    </button>
                                </div>
                            )}

                            {/* Template Content */}
                            {resource.type === 'template' && resource.content.structure && (
                                <div className="space-y-4">
                                    <p className="text-sm text-zinc-400">Instantly creates a new document with the following structure:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {resource.content.structure.map((item, i) => (
                                            <span key={i} className="px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleApply}
                                        className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-medium transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Instantiate Template
                                    </button>
                                </div>
                            )}

                            {/* Benchmark Content */}
                            {resource.type === 'benchmark' && (
                                <div className="space-y-4">
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-bold text-white">{resource.content.your_value}</span>
                                        <span className="text-sm text-zinc-500 mb-1">{resource.content.metric}</span>
                                    </div>
                                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500"
                                            style={{ width: `${resource.content.percentile}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-blue-200 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                                        {resource.content.interpretation}
                                    </p>
                                </div>
                            )}

                            {/* Guide Content */}
                            {resource.type === 'guide' && (
                                <div className="space-y-4">
                                    <div className="bg-amber-500/5 p-4 rounded-lg border border-amber-500/10 space-y-3">
                                        <div>
                                            <p className="text-xs text-amber-500/70 uppercase tracking-wider mb-1">Situation</p>
                                            <p className="text-sm text-zinc-300">{resource.content.situation}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-red-400/70 uppercase tracking-wider mb-1">Common Mistake</p>
                                            <p className="text-sm text-zinc-300">{resource.content.mistake}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-emerald-400/70 uppercase tracking-wider mb-1">The Truth</p>
                                            <p className="text-sm text-white font-medium">{resource.content.truth}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer / Expand Hint */}
            {!isExpanded && (
                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    <span>Click to view details</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
            )}
        </motion.div>
    );
};
