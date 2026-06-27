'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, FileCode2, Server, Database, Clock, Sparkles } from 'lucide-react';

interface BuildStats {
    pages_created: number;
    apis_generated: number;
    database_tables: number;
    total_files: number;
    build_time: string;
}

interface Props {
    stats: BuildStats;
    visible: boolean;
}

function AnimatedCounter({ end, duration = 1500 }: { end: number; duration?: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (end === 0) return;
        let start = 0;
        const increment = end / (duration / 30);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 30);
        return () => clearInterval(timer);
    }, [end, duration]);

    return <>{count}</>;
}

export default function BuildStatsCard({ stats, visible }: Props) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => setShow(true), 300);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible) return null;

    const statItems = [
        {
            icon: <FileCode2 size={18} className="text-indigo-400" />,
            label: 'Pages created',
            value: stats.pages_created,
            color: 'from-indigo-500/20 to-indigo-500/5',
            border: 'border-indigo-500/20',
        },
        {
            icon: <Server size={18} className="text-violet-400" />,
            label: 'APIs generated',
            value: stats.apis_generated,
            color: 'from-violet-500/20 to-violet-500/5',
            border: 'border-violet-500/20',
        },
        {
            icon: <Database size={18} className="text-cyan-400" />,
            label: 'Database tables',
            value: stats.database_tables,
            color: 'from-cyan-500/20 to-cyan-500/5',
            border: 'border-cyan-500/20',
        },
        {
            icon: <Clock size={18} className="text-amber-400" />,
            label: 'Build time',
            value: stats.build_time,
            isText: true,
            color: 'from-amber-500/20 to-amber-500/5',
            border: 'border-amber-500/20',
        },
    ];

    return (
        <div className={`transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Success Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30 mb-4">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <Sparkles size={20} className="text-amber-400" />
                    App Ready
                    <Sparkles size={20} className="text-amber-400" />
                </h2>
                <p className="text-zinc-500 text-sm mt-1">Your MVP has been built and deployed</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                {statItems.map((item, i) => (
                    <div
                        key={i}
                        className={`
              bg-gradient-to-br ${item.color} border ${item.border}
              rounded-xl p-4 text-center
              transition-all duration-500 delay-${(i + 1) * 100}
              ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
            `}
                        style={{ transitionDelay: `${(i + 1) * 150}ms` }}
                    >
                        <div className="flex items-center justify-center mb-2">
                            {item.icon}
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                            {'isText' in item && item.isText ? (
                                <span>{stats.build_time}</span>
                            ) : (
                                <AnimatedCounter end={item.value as number} />
                            )}
                        </div>
                        <div className="text-xs text-zinc-400 font-medium">{item.label}</div>
                    </div>
                ))}
            </div>

            {/* Total Files */}
            <div className="text-center mt-4">
                <span className="text-xs text-zinc-600 font-mono">
                    {stats.total_files} total files generated
                </span>
            </div>
        </div>
    );
}
