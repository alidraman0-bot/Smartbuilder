"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BillingPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/overview');
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center bg-[#0a0a0f] text-white font-mono">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
                </div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] animate-pulse">
                    Redirecting to Dashboard...
                </p>
            </div>
        </div>
    );
}
