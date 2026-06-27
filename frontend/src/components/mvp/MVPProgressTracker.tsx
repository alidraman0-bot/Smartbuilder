"use client";
import React from 'react';

const steps = [
  "Analyze", "Design", "Generate & Scaffold", "Optimize", "Deploy"
];

export default function MVPProgressTracker({ stateData, status }) {
    // stateData.state -> 'S1', 'S5', 'FAILED' etc.
    // For visual simplicity, we will mock mapping S1..S5 to these steps
    
    let activeStepIndex = 0;
    if (stateData.state === 'FAILED') activeStepIndex = steps.length;
    else if (stateData.state === 'S5' || stateData.state === 'S6') activeStepIndex = steps.length;
    else {
        // Just rough mapping
        const sMatch = stateData.state.match(/S(\d)/);
        if (sMatch) {
            activeStepIndex = parseInt(sMatch[1], 10) - 1;
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-slate-900/40 backdrop-blur-lg border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-500/10 w-64 h-64 blur-3xl rounded-full" />
                
                <h3 className="text-2xl font-bold text-white mb-6">Execution Pipeline</h3>
                
                <div className="relative mb-12">
                   <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 rounded-full" />
                   <div 
                      className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 -translate-y-1/2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((activeStepIndex / (steps.length - 1)) * 100, 100)}%` }}
                   />
                   
                   <div className="relative flex justify-between w-full">
                       {steps.map((step, idx) => {
                           const isCompleted = idx <= activeStepIndex;
                           const isActive = idx === activeStepIndex;
                           return (
                               <div key={step} className="flex flex-col items-center group">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10
                                    ${isCompleted ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)] text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'}
                                    ${isActive && status === 'building' ? 'animate-pulse scale-110 ring-4 ring-indigo-500/30' : ''}
                                  `}>
                                     {isCompleted ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                     ) : (
                                         <span className="text-sm font-medium">{idx + 1}</span>
                                     )}
                                  </div>
                                  <span className={`absolute top-12 text-xs font-semibold whitespace-nowrap transition-colors duration-300 ${isCompleted ? 'text-indigo-300' : 'text-slate-500'}`}>
                                      {step}
                                  </span>
                               </div>
                           );
                       })}
                   </div>
                </div>

                {stateData.last_error && (stateData.state === 'S5' || stateData.state === 'FAILED') && (
                    <div className="mt-8 bg-red-900/30 border border-red-500/50 rounded-2xl p-6 flex flex-col justify-center animate-in fade-in">
                        <h4 className="text-xl font-bold text-red-500 mb-2">Build Pipeline Error</h4>
                        <p className="text-red-300 font-mono text-xs">{stateData.last_error.message || JSON.stringify(stateData.last_error)}</p>
                        <p className="text-red-400 mt-2 text-sm italic">The generation process has aborted. Please fix the issue and try again.</p>
                    </div>
                )}

                {stateData.preview_url && stateData.state !== 'S5' && stateData.state !== 'FAILED' && (
                   <div className="mt-12 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between animate-in fade-in">
                       <div className="space-y-1 text-center sm:text-left mb-4 sm:mb-0">
                           <h4 className="text-xl font-bold text-white">Environment Deployed</h4>
                           <p className="text-indigo-300/80 text-sm">Your application sandbox is live and ready for preview.</p>
                       </div>
                       <a 
                         href={stateData.preview_url} 
                         target="_blank" 
                         rel="noreferrer"
                         className="px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-xl transition-all hover:scale-105 shadow-lg"
                       >
                         Open Sandbox
                       </a>
                   </div>
                )}
            </div>
        </div>
    );
}
