"use client";

import React from 'react';
import Navbar from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/PricingAndFAQ';
import {
    ProductHero, ChatbotComparison, CoreProduct, SafetySection,
    LivePreview, FreezeBuild, ProjectMemory, Transparency,
    Teams, Manifesto, ProductCTA
} from '@/components/landing/ProductPageComponents';

export default function ProductPage() {
    return (
        <div className="relative bg-white min-h-screen">
            <Navbar />

            <main className="pt-20">
                <ProductHero />
                <ChatbotComparison />
                <CoreProduct />
                <SafetySection />
                <LivePreview />
                <FreezeBuild />
                <ProjectMemory />
                <Transparency />
                <Teams />
                <Manifesto />
                <ProductCTA />
            </main>

            <Footer />
        </div>
    );
}
