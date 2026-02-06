import React from 'react';
import { UserCheck, Briefcase, MapPin, DollarSign, ListTodo, Zap } from 'lucide-react';
import { CustomerSegmentation as CustomerSegmentationType } from '@/types/research';

interface CustomerSegmentationProps {
    segmentation: CustomerSegmentationType;
}

export default function CustomerSegmentation({ segmentation }: CustomerSegmentationProps) {
    const { segments, jobs_to_be_done } = segmentation;

    return (
        <section className="space-y-8">
            <div className="flex items-center space-x-3">
                <UserCheck size={20} className="text-indigo-500" />
                <h2 className="text-2xl font-bold text-white tracking-tight">Customer Segmentation & ICP</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="glass-card p-10 rounded-3xl space-y-12">
                {/* ICP Breakdown */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Segment Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {segments.map((segment, index) => (
                            <div key={index} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-6 group hover:bg-white/[0.04] transition-colors relative h-full flex flex-col">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-bold text-white">{segment.name}</h4>
                                    <span className="text-[9px] font-bold px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                                        {segment.percentage_of_market}% OF TAM
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-y-6 gap-x-4 flex-grow">
                                    <ICPTag icon={<Briefcase size={12} />} label="Company Size" value={segment.company_size} />
                                    <ICPTag icon={<UserCheck size={12} />} label="Vertical" value={segment.industry_vertical} />
                                    <ICPTag icon={<MapPin size={12} />} label="Geography" value={segment.geography} />
                                    <ICPTag icon={<DollarSign size={12} />} label="Budget Cap" value={segment.budget_capability} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Jobs-To-Be-Done Analysis */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Jobs-To-Be-Done (JTBD) Analysis</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Primary Job */}
                        <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Primary Job</h4>
                            </div>
                            <p className="text-lg font-bold text-white leading-tight">{jobs_to_be_done.primary_job}</p>
                        </div>

                        {/* Secondary Jobs */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center">
                                    <ListTodo size={12} className="mr-2" />
                                    Secondary Support Jobs
                                </h4>
                                <ul className="space-y-2">
                                    {jobs_to_be_done.secondary_jobs.map((job, i) => (
                                        <li key={i} className="text-sm text-zinc-300 flex items-start space-x-2">
                                            <span className="text-indigo-500 mt-1">▸</span>
                                            <span className="font-medium">{job}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center">
                                    <Zap size={12} className="mr-2" />
                                    Current Workarounds
                                </h4>
                                <ul className="space-y-2">
                                    {jobs_to_be_done.current_workarounds.map((workaround, i) => (
                                        <li key={i} className="text-sm text-zinc-400 flex items-start space-x-2 italic">
                                            <span className="text-zinc-600 mt-1">—</span>
                                            <span>{workaround}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ICPTag({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                {icon}
                <span>{label}</span>
            </div>
            <div className="text-xs font-bold text-zinc-300">{value}</div>
        </div>
    );
}
