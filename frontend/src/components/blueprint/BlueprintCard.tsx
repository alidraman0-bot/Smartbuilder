"use client";

import React from "react";

interface BlueprintCardProps {
    title: string;
    children: React.ReactNode;
    accent?: "violet" | "indigo" | "emerald" | "amber" | "sky" | "rose" | "fuchsia";
    icon?: React.ReactNode;
}

const ACCENT_CLASSES: Record<NonNullable<BlueprintCardProps["accent"]>, string> = {
    violet: "border-violet-500/25 from-violet-500/10",
    indigo: "border-indigo-500/25 from-indigo-500/10",
    emerald: "border-emerald-500/25 from-emerald-500/10",
    amber: "border-amber-500/25 from-amber-500/10",
    sky: "border-sky-500/25 from-sky-500/10",
    rose: "border-rose-500/25 from-rose-500/10",
    fuchsia: "border-fuchsia-500/25 from-fuchsia-500/10",
};

const ACCENT_TITLE: Record<NonNullable<BlueprintCardProps["accent"]>, string> = {
    violet: "text-violet-400",
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    sky: "text-sky-400",
    rose: "text-rose-400",
    fuchsia: "text-fuchsia-400",
};

export default function BlueprintCard({
    title,
    children,
    accent = "violet",
    icon,
}: BlueprintCardProps) {
    return (
        <div
            className={`group relative bg-gradient-to-br ${ACCENT_CLASSES[accent]} to-transparent border rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-${accent}-500/10 hover:-translate-y-0.5`}
        >
            <div className="flex items-center gap-2 mb-4">
                {icon && <span className={ACCENT_TITLE[accent]}>{icon}</span>}
                <h3 className={`text-xs font-bold uppercase tracking-widest ${ACCENT_TITLE[accent]}`}>
                    {title}
                </h3>
            </div>
            <div className="text-gray-300 text-sm leading-relaxed">{children}</div>
        </div>
    );
}
