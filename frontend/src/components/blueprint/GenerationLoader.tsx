"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const STEPS = [
    "Analyzing market data",
    "Synthesizing business model",
    "Designing product architecture",
    "Generating go-to-market strategy",
];

interface Props {
    onComplete?: () => void;
}

export default function GenerationLoader({ onComplete }: Props) {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        let step = 0;
        const advance = () => {
            step++;
            if (step < STEPS.length) {
                setCurrentStep(step);
                setTimeout(advance, 700);
            } else {
                onComplete?.();
            }
        };
        const timer = setTimeout(advance, 700);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-8">
            {/* Outer glow ring */}
            <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 blur-xl animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-[#18181b] border border-violet-500/30 flex items-center justify-center shadow-xl">
                    <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-sm">
                {STEPS.map((label, idx) => {
                    const done = idx < currentStep;
                    const active = idx === currentStep;
                    return (
                        <div
                            key={label}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${done
                                    ? "bg-emerald-500/10 border-emerald-500/30 opacity-100"
                                    : active
                                        ? "bg-violet-500/10 border-violet-500/40 opacity-100 shadow-lg shadow-violet-500/10"
                                        : "bg-[#18181b] border-[#27272a] opacity-40"
                                }`}
                        >
                            {done ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            ) : active ? (
                                <Loader2 className="w-5 h-5 text-violet-400 animate-spin flex-shrink-0" />
                            ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-[#3f3f46] flex-shrink-0" />
                            )}
                            <span
                                className={`text-sm font-medium ${done
                                        ? "text-emerald-400"
                                        : active
                                            ? "text-violet-300"
                                            : "text-gray-600"
                                    }`}
                            >
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>

            <p className="text-gray-500 text-xs uppercase tracking-widest animate-pulse">
                AI is building your startup blueprint…
            </p>
        </div>
    );
}
