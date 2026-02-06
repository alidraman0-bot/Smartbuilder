import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import { TheHook, SocialProof, TheProblem, Philosophy } from '@/components/landing/ValueProp';
import { WhatIsSmartbuilder, Comparison } from '@/components/landing/ProductSections';
import { Pricing, FAQ, FinalCTA, Footer } from '@/components/landing/PricingAndFAQ';

export default function LandingPage() {
  return (
    <div className="relative bg-white min-h-screen">
      <Navbar />

      <main>
        <Hero />
        <TheHook />
        <SocialProof />

        <WhatIsSmartbuilder />
        <Comparison />

        <TheProblem />
        <Philosophy />

        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
