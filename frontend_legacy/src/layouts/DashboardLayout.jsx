import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const DashboardLayout = () => {
    const [state, setState] = useState({
        runId: "CONNECTING...",
        stage: "INIT",
        health: "UNKNOWN",
        confidence: 0,
        elapsed: "00:00:00",
        logs: [],
        pipeline: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/v1/status');
                if (res.ok) {
                    const data = await res.json();
                    setState(data);
                }
            } catch (err) {
                console.error("Failed to fetch status:", err);
            }
        };

        fetchData(); // Initial fetch
        const interval = setInterval(fetchData, 1000); // 1s polling
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex h-screen bg-transparent p-0 overflow-hidden font-sans">
            {/* Sidebar Logic: Pass 'IDEA' if INIT to avoid weird locking visuals */}
            <Sidebar currentStage={state.stage === "INIT" ? "IDEA" : state.stage} />

            <div className="flex-1 flex flex-col h-full relative min-w-0">
                <TopBar {...state} />

                <main className="flex-1 overflow-y-auto custom-scrollbar p-0 mx-4 mb-4 mt-4 glass-panel rounded-xl clip-content relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                    <div className="relative z-10 p-8 h-full">
                        <Outlet context={state} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
