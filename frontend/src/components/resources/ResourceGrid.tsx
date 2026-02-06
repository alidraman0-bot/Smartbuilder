import React, { useEffect } from 'react';
import { useResourceStore } from '@/store/resourceStore';
import { ResourceCard } from './ResourceCard';

export const ResourceGrid: React.FC = () => {
    const { resources, fetchResources, selectedStage, isLoading } = useResourceStore();

    useEffect(() => {
        fetchResources(selectedStage || undefined);
    }, [selectedStage, fetchResources]);

    if (isLoading) {
        return (
            <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-zinc-500">Retrieving resources...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6 p-6 pb-20">
            {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
            ))}
        </div>
    );
};
