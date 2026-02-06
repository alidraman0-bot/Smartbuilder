"use client";

import React from 'react';

export default function LoginLogo({ className = "" }: { className?: string }) {
    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 text-xl">
                S
            </div>
            <span className="text-2xl font-bold tracking-tight text-white uppercase">Smartbuilder</span>
        </div>
    );
}
