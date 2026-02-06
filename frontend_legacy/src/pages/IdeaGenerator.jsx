import React, { useState } from 'react';

const IdeaGenerator = () => {
    const [opp, setOpp] = useState("");
    const [result, setResult] = useState(null);

    const runSim = async () => {
        const res = await fetch('/api/v1/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ opportunity: opp })
        });
        const data = await res.json();
        setResult(data);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Idea Generator</h2>
            <div className="card space-y-4">
                <label className="block text-sm font-bold text-gray-400">INPUT OPPORTUNITY</label>
                <div className="flex gap-2">
                    <input
                        className="flex-1 bg-black border border-gray-700 p-2 text-white font-mono"
                        value={opp}
                        onChange={(e) => setOpp(e.target.value)}
                        placeholder="e.g. AI-powered drone for window cleaning"
                    />
                    <button onClick={runSim} className="bg-white text-black font-bold px-6 py-2 hover:bg-gray-200">
                        EXECUTE
                    </button>
                </div>
            </div>
            {result && (
                <div className="card">
                    <h3 className="text-sm font-bold text-gray-400 mb-4 border-b border-gray-800 pb-2">RESULT</h3>
                    <pre className="text-xs font-mono text-gray-300 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};
export default IdeaGenerator;
