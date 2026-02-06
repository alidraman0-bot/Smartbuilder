/**
 * S4: Build Stable (Main Orchestrator)
 * 
 * Assembles the sub-components into the main builder interface.
 * - TopContextBar
 * - LeftOrchestrator
 * - BuildSurface
 */

"use client";

import React from 'react';
import TopContextBar from './TopContextBar';
import LeftOrchestrator from './LeftOrchestrator';
import BuildSurface from './BuildSurface';

export default function BuildStable() {
    return (
        <div className="h-screen flex flex-col bg-[#0a0a0f] overflow-hidden">
            {/* 1. Control Plane */}
            <TopContextBar />

            {/* 2. Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                <LeftOrchestrator />
                <BuildSurface />
            </div>

            {/* 3. Status Bar (Optional/Integrated in surface) */}
            <div className="h-6 bg-[#0a0a0f] border-t border-[#27272a] flex items-center justify-between px-3 text-[10px] text-zinc-500 select-none">
                <div className="flex items-center space-x-4">
                    <span>Ready</span>
                    <span>UTF-8</span>
                    <span>No Issues</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span>Smartbuilder v1.0</span>
                </div>
            </div>
        </div>
    );
}
