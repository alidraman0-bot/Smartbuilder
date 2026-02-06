import React from 'react';
import { useResourceStore } from '@/store/resourceStore';
import { Layers, Globe } from 'lucide-react';

export const ContextBar: React.FC = () => {
    const { selectedStage, setStage } = useResourceStore();

    return (
        <div className="sticky top-0 z-40 w-full bg-black/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
            {/* Left: Title & Subtitle */}
            <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Resources</h1>
                <p className="text-xs text-zinc-500 font-medium">Guidance, benchmarks, and execution playbooks</p>
            </div>

            {/* Right: Context Selector */}
            <div className="flex bg-zinc-900/50 rounded-lg p-1 border border-white/5">
                <button
                    onClick={() => setStage('MVP')} // Simulating "This Project" which is currently in MVP stage
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedStage
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    <Layers className="w-4 h-4" />
                    <span>This Project</span>
                </button>

                <button
                    onClick={() => setStage(null)} // Null = All Projects
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${!selectedStage
                            ? 'bg-zinc-800 text-white border border-white/10'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    <Globe className="w-4 h-4" />
                    <span>All Projects</span>
                </button>
            </div>
        </div>
    );
};
