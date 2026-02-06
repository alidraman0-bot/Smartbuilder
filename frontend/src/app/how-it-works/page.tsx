"use client";

import React from 'react';
import Navbar from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/PricingAndFAQ';
import {
    OpeningFrame,
    TheProblem,
    TheDifference,
    StepByStepFlow,
    Outcomes,
    TargetAudience,
    HowItWorksFAQ,
    HowItWorksCTA
} from '@/components/landing/HowItWorksComponents';

export default function HowItWorksPage() {
    return (
        <div className="relative bg-white min-h-screen">
            <Navbar />

            <main>
                <OpeningFrame />
                <TheProblem />
                <TheDifference />
                <StepByStepFlow />
                <Outcomes />
                <TargetAudience />
                <HowItWorksFAQ />
                <HowItWorksCTA />
            </main>

            <Footer />
        </div>
    );
}
