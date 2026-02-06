import React from 'react';

const PlaceholderPage = ({ title }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="card flex items-center justify-center h-64 text-gray-500 font-mono">
            WAITING FOR EXECUTION SIGNAL...
        </div>
    </div>
);

export default PlaceholderPage;
