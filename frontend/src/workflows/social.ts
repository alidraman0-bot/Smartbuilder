export async function getSocialIntelligence(idea: string) {
    console.log(`[Social] Gathering social intelligence for ${idea}`);
    // Simulate fetching from Reddit / Twitter / Forums
    return {
        painPoints: ["Too complex to setup", "Expensive enterprise pricing"],
        complaints: ["Lack of integrations with standard tools"],
        unmetDemand: ["Need for simpler onboarding"],
        customerFrustrations: ["Slow customer support"]
    };
}
