"use client";

import React, { useEffect, useState } from 'react';

interface ScoreGaugeProps {
    score: number; // 1 to 10
    size?: number;
}

export default function ScoreGauge({ score, size = 200 }: ScoreGaugeProps) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const strokeWidth = size * 0.08;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Scoring colors
    const getColor = (s: number) => {
        if (s >= 8) return '#10b981'; // emerald-500
        if (s >= 6) return '#8b5cf6'; // violet-500
        if (s >= 4) return '#f59e0b'; // amber-500
        return '#ef4444'; // red-500
    };

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedScore(score), 500);
        return () => clearTimeout(timer);
    }, [score]);

    const offset = circumference - (animatedScore / 10) * circumference;

    return (
        <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
            {/* Background circle */}
            <svg className="absolute inset-0" width={size} height={size}>
                <circle
                    className="text-[#27272a]"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress circle */}
                <circle
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    style={{
                        strokeDashoffset: offset,
                        transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.5s ease',
                        stroke: getColor(animatedScore)
                    }}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>

            <div className="flex flex-col items-center justify-center z-10">
                <span className="text-5xl font-black text-white tracking-tighter">
                    {animatedScore.toFixed(1)}
                </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                    Opportunity Score
                </span>
            </div>

            {/* Subtle glow */}
            <div
                className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-1000"
                style={{ backgroundColor: getColor(animatedScore) }}
            />
        </div>
    );
}
