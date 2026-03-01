/**
 * Feature Gating Utilities
 * Frontend feature enforcement based on subscription plans
 */

export const FEATURES = {
    IDEA_GENERATION: 'idea_generation',
    MVP_BUILDER: 'mvp_builder',
    FREEZE_BUILD: 'freeze_build',
    DEPLOYMENT: 'deployment',
    CUSTOM_DOMAIN: 'custom_domain',
    TEAM_ACCESS: 'team_access',
    EXECUTIVE_REPORTS: 'executive_reports',
    API_ACCESS: 'api_access',
} as const;

export type FeatureKey = typeof FEATURES[keyof typeof FEATURES];

interface PlanFeatures {
    idea_generation: boolean;
    mvp_builder: boolean;
    freeze_build: boolean;
    deployment: boolean;
    custom_domain: boolean;
    team_access: boolean;
    executive_reports: boolean;
    api_access: boolean;
    max_projects: number;
    max_team_members: number;
    idea_clicks_per_month: number;
}

const PLAN_FEATURES: Record<string, PlanFeatures> = {
    free: {
        idea_generation: true,
        mvp_builder: false,
        freeze_build: false,
        deployment: false,
        custom_domain: false,
        team_access: false,
        executive_reports: false,
        api_access: false,
        max_projects: 0,
        max_team_members: 1,
        idea_clicks_per_month: 20,
    },
    starter: {
        idea_generation: true,
        mvp_builder: true,
        freeze_build: false,
        deployment: false,
        custom_domain: false,
        team_access: false,
        executive_reports: false,
        api_access: false,
        max_projects: 1,
        max_team_members: 1,
        idea_clicks_per_month: 200,
    },
    pro: {
        idea_generation: true,
        mvp_builder: true,
        freeze_build: true,
        deployment: true,
        custom_domain: true,
        team_access: false,
        executive_reports: false,
        api_access: false,
        max_projects: 3,
        max_team_members: 1,
        idea_clicks_per_month: 1000,
    },
    team: {
        idea_generation: true,
        mvp_builder: true,
        freeze_build: true,
        deployment: true,
        custom_domain: true,
        team_access: true,
        executive_reports: true,
        api_access: true,
        max_projects: -1,
        max_team_members: -1,
        idea_clicks_per_month: 5000,
    }
};

/**
 * Check if a plan has access to a feature
 */
export function hasFeature(plan: string, feature: FeatureKey): boolean {
    const planFeatures = PLAN_FEATURES[plan.toLowerCase()];
    if (!planFeatures) {
        return false;
    }

    const featureValue = planFeatures[feature as keyof PlanFeatures];

    // Handle boolean features
    if (typeof featureValue === 'boolean') {
        return featureValue;
    }

    // Handle numeric limits (-1 means unlimited, 0 means locked)
    if (typeof featureValue === 'number') {
        return featureValue !== 0;
    }

    return false;
}

/**
 * Get user-facing message for locked features
 */
export function getFeatureLockMessage(feature: FeatureKey): string {
    const messages: Record<FeatureKey, string> = {
        idea_generation: 'You have reached your monthly limit for idea generations.',
        mvp_builder: 'The MVP Builder is available on Starter, Pro, and Team plans. Upgrade to start building your actual product.',
        freeze_build: 'Build Freeze is available on Pro and Team plans. Upgrade to preserve specific build states for production.',
        deployment: 'Deployment is available on Pro and Team plans. Upgrade to launch your product to the world.',
        custom_domain: 'Custom domains are available on Pro and Team plans. Upgrade to host on your own brand.',
        team_access: 'Team collaboration is available on the Team plan. Upgrade to invite your co-founders and engineers.',
        executive_reports: 'Executive reports are available on the Team plan. Upgrade for investor-grade progress tracking.',
        api_access: 'API access is available on the Team plan. Upgrade for programmatic integration with your other tools.',
    };

    return messages[feature] || 'This feature requires a higher plan. Upgrade to unlock.';
}

/**
 * Get recommended plan for a feature
 */
export function getRecommendedPlan(feature: FeatureKey): string {
    const recommendations: Record<FeatureKey, string> = {
        idea_generation: 'starter',
        mvp_builder: 'starter',
        freeze_build: 'pro',
        deployment: 'pro',
        custom_domain: 'pro',
        team_access: 'team',
        executive_reports: 'team',
        api_access: 'team',
    };

    return recommendations[feature] || 'pro';
}

/**
 * Get feature limit for numeric features
 */
export function getFeatureLimit(plan: string, feature: keyof PlanFeatures): number {
    const planFeatures = PLAN_FEATURES[plan.toLowerCase()];
    if (!planFeatures) {
        return 0;
    }

    const limit = planFeatures[feature];
    if (typeof limit === 'number') {
        return limit;
    }

    return 0;
}

/**
 * Check if usage is within limits
 */
export function isWithinLimit(
    plan: string,
    feature: keyof PlanFeatures,
    currentUsage: number
): boolean {
    const limit = getFeatureLimit(plan, feature);

    // -1 means unlimited
    if (limit === -1) {
        return true;
    }

    return currentUsage < limit;
}

/**
 * Get all features for a plan
 */
export function getPlanFeatures(plan: string): PlanFeatures {
    return PLAN_FEATURES[plan.toLowerCase()] || PLAN_FEATURES.starter;
}

/**
 * Hook to check feature access with API
 */
export async function checkFeatureAccess(
    orgId: string,
    feature: FeatureKey
): Promise<boolean> {
    try {
        const response = await fetch(
            `/api/v1/billing/check-feature?org_id=${orgId}&feature=${feature}`
        );

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.has_access || false;
    } catch (error) {
        console.error('Error checking feature access:', error);
        return false;
    }
}
