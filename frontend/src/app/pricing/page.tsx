"use client";

import React from 'react';
import Navbar from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/PricingAndFAQ';
import {
    PricingHero,
    PricingOverview,
    PricingGrid,
    PricingValue,
    PricingComparison,
    DetailedPricingFAQ,
    PricingFinalCTA
} from '@/components/landing/PricingPageComponents';

export default function PricingPage() {
    return (
        <div className="relative bg-white min-h-screen">
            <Navbar />

            <main>
                <PricingHero />
                <PricingOverview />
                <PricingGrid />
                <PricingValue />
                <PricingComparison />
                <DetailedPricingFAQ />
                <PricingFinalCTA />
            </main>

            <Footer />
        </div>
    );
}
