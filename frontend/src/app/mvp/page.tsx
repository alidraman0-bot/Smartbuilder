/**
 * MVP Builder Page (Main Orchestrator)
 * 
 * Routes between the 7 UI states:
 * S0: Empty (Redirect or Show Idea Intake)
 * S1: Idea Intake
 * S2: Build Initializing
 * S3: Build Executing
 * S4: Build Stable (Main Interface)
 * S5: Build Recovering (Main Interface + Overlay)
 * S6: Frozen (Main Interface + Read-Only)
 */

"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useRunStore } from '@/store/useRunStore';
import { useMvpBuilderStore } from '@/store/useMvpBuilderStore';
import IdeaIntake from '@/components/builder/IdeaIntake';
import BuildInitializing from '@/components/builder/BuildInitializing';
import BuildExecuting from '@/components/builder/BuildExecuting';
import BuildStable from '@/components/builder/BuildStable';
import StartupPipeline from '@/components/layout/StartupPipeline';
import { Loader2 } from 'lucide-react';

export default function MvpBuilderPage() {
    const router = useRouter();
    const run = useRunStore();
    const {
        uiState, createSession, fetchSessionState,
        isLoading, sessionId
    } = useMvpBuilderStore();

    // Initialize session if needed
    useEffect(() => {
        const init = async () => {
            if (!sessionId && run.runId && run.prd) {
                // Check if existing session for this run
                // For MVP, we'll try to create/fetch
                // In a real app, we'd check existence first
                try {
                    await createSession(run.runId, run.prd as any, run.research as any);
                } catch (e) {
                    console.error("Failed to init session", e);
                }
            }
        };
        init();
    }, [run.runId, sessionId]);

    // Render loading state if initializing
    if (isLoading && !uiState) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0a0a0f]">
                <Loader2 size={32} className="text-indigo-500 animate-spin" />
            </div>
        );
    }

    // State Router with Back Button
    return (
        <div className="h-screen flex flex-col bg-black">
            {/* Back Navigation Header */}
            <div className="h-20 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 space-x-6">
                <button
                    onClick={() => router.push('/ideas')}
                    className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-xs uppercase tracking-widest">Dash</span>
                </button>

                <div className="flex-1 max-w-2xl bg-white/[0.02] border border-white/5 rounded-2xl p-1">
                    <StartupPipeline currentStage="build" />
                </div>

                <div className="w-24" /> {/* Spacer */}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                {(() => {
                    switch (uiState) {
                        case 'S0':
                        case 'S1':
                            return <IdeaIntake />;

                        case 'S2':
                            return <BuildInitializing />;

                        case 'S3':
                            return <BuildExecuting />;

                        case 'S4': // Stable
                        case 'S5': // Recovering
                        case 'S6': // Frozen
                            return <BuildStable />;

                        default:
                            return <IdeaIntake />;
                    }
                })()}
            </div>
        </div>
    );
}
