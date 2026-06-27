"use client";

import React from 'react';
import { Lock, ArrowUpCircle } from 'lucide-react';
import { hasFeature, type FeatureKey, getFeatureLockMessage } from '@/utils/feature-gating';
import Link from 'next/link';

interface FeatureGuardProps {
    feature: FeatureKey;
    plan: string; // The current user/org plan
    children: React.ReactNode;
    fallback?: React.ReactNode;
    showLockUI?: boolean; // If true, shows a standardized "Upgrade to unlock" overlay
}

export default function FeatureGuard({
    feature,
    plan,
    children,
    fallback,
    showLockUI = true
}: FeatureGuardProps) {
    // Payment system disabled - bypass all guards for all features
    return <>{children}</>;
}
