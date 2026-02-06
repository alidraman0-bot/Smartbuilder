import React from 'react';
import { Code2, Target, Users, Zap, Shield, BarChart3, ListChecks } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PRDViewProps {
    prd: {
        product_overview: string;
        target_user: string;
        problem_statement: string;
        features: { name: string, description: string, priority: string }[];
        non_functional_requirements: string[];
        success_metrics: string[];
        constraints: string[];
    };
}

export default function PRDView({ prd }: PRDViewProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-sans">
            {/* Engineering Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PRDCard
                    icon={<Target size={18} className="text-blue-400" />}
                    label="Core Mission"
                    content={prd.product_overview}
                />
                <PRDCard
                    icon={<Users size={18} className="text-purple-400" />}
                    label="User Profile"
                    content={prd.target_user}
                />
                <PRDCard
                    icon={<Shield size={18} className="text-emerald-400" />}
                    label="Success Thesis"
                    content={prd.problem_statement}
                />
            </div>

            {/* Feature Specification Ledger */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-[#27272a] flex items-center justify-between bg-[#111114]">
                    <div className="flex items-center space-x-3">
                        <Code2 size={20} className="text-blue-500" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Feature Specification Ledger (Max 5)</h3>
                    </div>
                    <span className="text-[9px] font-bold bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">EXECUTABLE</span>
                </div>
                <div className="divide-y divide-[#27272a]">
                    {prd.features.map((feature, i) => (
                        <div key={i} className="p-6 hover:bg-[#1c1c1f] transition-colors flex items-start justify-between">
                            <div className="space-y-1 max-w-2xl">
                                <h4 className="text-sm font-bold text-white">{feature.name}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
                            </div>
                            <span className={cn(
                                "text-[9px] font-bold px-2 py-1 rounded border",
                                feature.priority === 'P0' ? "bg-red-500/5 text-red-500 border-red-500/20" : "bg-gray-500/5 text-gray-400 border-gray-500/20"
                            )}>
                                {feature.priority}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tech Specs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SpecList icon={<Zap size={16} />} title="Non-Functional Requirements" items={prd.non_functional_requirements} color="text-amber-500" />
                <SpecList icon={<BarChart3 size={16} />} title="Success Metrics" items={prd.success_metrics} color="text-blue-500" />
                <SpecList icon={<ListChecks size={16} />} title="Build Constraints" items={prd.constraints} color="text-gray-500" />
            </div>
        </div>
    );
}

function PRDCard({ icon, label, content }: { icon: React.ReactNode, label: string, content: string }) {
    return (
        <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-2xl space-y-3">
            <div className="flex items-center space-x-2">
                {icon}
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-sm text-gray-300 font-medium leading-relaxed">{content}</p>
        </div>
    );
}

function SpecList({ icon, title, items, color }: { icon: React.ReactNode, title: string, items: string[], color: string }) {
    return (
        <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-2xl space-y-4">
            <div className={cn("flex items-center space-x-2", color)}>
                {icon}
                <h4 className="text-[10px] font-bold uppercase tracking-widest">{title}</h4>
            </div>
            <ul className="space-y-3">
                {items.map((item, i) => (
                    <li key={i} className="text-xs text-gray-400 flex items-start space-x-2">
                        <div className="w-1 h-1 bg-gray-700 rounded-full mt-1.5 shrink-0" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
