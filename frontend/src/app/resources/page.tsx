"use client";

import React from 'react';
import Navbar from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/PricingAndFAQ';
import {
    ResourcesHero,
    ResourceCategories,
    FeaturedGuides,
    DeepDives,
    DocsAndReference,
    FounderEducation,
    CommunityUpdates,
    ResourcesFinalCTA
} from '@/components/landing/ResourcesComponents';

export default function ResourcesPage() {
    return (
        <div className="relative bg-white min-h-screen">
            <Navbar />

            <main>
                <ResourcesHero />
                <ResourceCategories />
                <FeaturedGuides />
                <DeepDives />
                <DocsAndReference />
                <FounderEducation />
                <CommunityUpdates />
                <ResourcesFinalCTA />
            </main>

            <Footer />
        </div>
    );
}
