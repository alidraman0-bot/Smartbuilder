"use client";

import React, { useState, useEffect } from 'react';
import { useRunStore } from '@/store/useRunStore';
import { Project, Deployment, DeploymentDetails, DeploymentLog, DeploymentConfiguration, EnvironmentVariable, Domain, TeamMember, ActivityLogEntry } from '@/types/deploy';
import StartupPipeline from '@/components/layout/StartupPipeline';

// Vercel-style Components
import ProjectsSidebar from '@/components/deploy/ProjectsSidebar';
import DeploymentsTable from '@/components/deploy/DeploymentsTable';
import DeploymentDetailsDrawer from '@/components/deploy/DeploymentDetailsDrawer';
import DomainsTab from '@/components/deploy/DomainsTab';
import TeamTab from '@/components/deploy/TeamTab';
import SettingsTab from '@/components/deploy/SettingsTab';
import { useBillingStore } from '@/store/useBillingStore';
import { hasFeature, FeatureKey } from '@/utils/feature-gating';
import PaywallModal from '@/components/billing/PaywallModal';

const API_BASE = 'http://localhost:8000/api/v1';

type Tab = 'deployments' | 'domains' | 'team' | 'settings';

export default function DeployPage() {
    const run = useRunStore();
    const [activeTab, setActiveTab] = useState<Tab>('deployments');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // State
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null);

    // Data
    const [projects, setProjects] = useState<Project[]>([]);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
    const [deploymentDetails, setDeploymentDetails] = useState<DeploymentDetails | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);
    const [paywallFeature, setPaywallFeature] = useState<FeatureKey>('deployment');

    const { subscription, fetchSubscription } = useBillingStore();

    useEffect(() => {
        fetchSubscription('demo-org-id');
    }, [fetchSubscription]);

    // Initial Load - Projects
    useEffect(() => {
        fetch(`${API_BASE}/projects/`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then((data: Project[]) => {
                if (Array.isArray(data)) {
                    setProjects(data);
                    if (data.length > 0 && !selectedProjectId) {
                        setSelectedProjectId(data[0].project_id);
                    }
                } else {
                    console.error('Projects data is not an array:', data);
                    setProjects([]);
                }
            })
            .catch(err => console.error('Failed to load projects:', err));
    }, []);

    // Load Project Data when Project ID changes
    useEffect(() => {
        if (!selectedProjectId) return;

        // Load Deployments (Mock for now until real endpoint exists)
        const loadMockDeployments = () => {
            const mockData: Deployment[] = [
                {
                    deployment_id: 'dep_1',
                    project_id: 'proj_1',
                    status: run.deployment_status === 'LIVE' ? 'success' : run.deployment_status === 'FAILED' ? 'failed' : 'building',
                    commit_message: 'Initial MVP deployment from Smartbuilder',
                    environment: 'Production',
                    created_at: new Date(Date.now() - 3600000).toISOString(),
                    completed_at: new Date().toISOString(),
                    duration: '2m 34s',
                    url: run.deployment_url || 'https://smartbuilder-mvp.vercel.app',
                    version: 'v1.0.0',
                    triggered_by: 'Smartbuilder AI'
                }
            ];
            setDeployments(mockData);
        };

        loadMockDeployments();

        // Load Domains
        fetch(`${API_BASE}/projects/${selectedProjectId}/domains/`)
            .then(res => res.ok ? res.json() : [])
            .then(setDomains)
            .catch(err => console.error('Failed to load domains:', err));

        // Load Team
        fetch(`${API_BASE}/projects/${selectedProjectId}/team/`)
            .then(res => res.ok ? res.json() : [])
            .then(setTeamMembers)
            .catch(err => console.error('Failed to load team:', err));

        // Load Activity
        fetch(`${API_BASE}/projects/${selectedProjectId}/activity/`)
            .then(res => res.ok ? res.json() : [])
            .then(setActivityLog)
            .catch(err => console.error('Failed to load activity:', err));

    }, [selectedProjectId, activeTab]); // Reload when tab changes too to ensure freshness

    // Handle deployment selection
    const handleSelectDeployment = (deploymentId: string) => {
        setSelectedDeploymentId(deploymentId);
        // Find deployment and create mock details (API endpoint TBD)
        const deployment = deployments.find(d => d.deployment_id === deploymentId);
        if (deployment) {
            setDeploymentDetails({
                deployment,
                logs: [], // Mock logs
                configuration: {} as any,
                environment_variables: []
            });
            setIsDrawerOpen(true);
        }
    };

    // --- Action Handlers ---

    // Domains
    const handleAddDomain = async (domain: string) => {
        if (!selectedProjectId) return;
        try {
            const res = await fetch(`${API_BASE}/projects/${selectedProjectId}/domains/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain })
            });
            if (res.ok) {
                const newDomain = await res.json();
                setDomains([...domains, newDomain]);
                refreshActivity();
            }
        } catch (err) {
            console.error('Failed to add domain:', err);
        }
    };

    const handleRemoveDomain = async (domain: string) => {
        if (!selectedProjectId) return;
        if (!confirm(`Are you sure you want to remove ${domain}?`)) return;

        try {
            const res = await fetch(`${API_BASE}/projects/${selectedProjectId}/domains/${domain}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setDomains(domains.filter(d => d.domain !== domain));
                refreshActivity();
            }
        } catch (err) {
            console.error('Failed to remove domain:', err);
        }
    };

    const handleVerifyDNS = async (domain: string) => {
        if (!selectedProjectId) return;
        try {
            const res = await fetch(`${API_BASE}/projects/${selectedProjectId}/domains/${domain}/verify/`, {
                method: 'POST'
            });
            if (res.ok) {
                const updatedDomain = await res.json();
                setDomains(domains.map(d => d.domain === domain ? updatedDomain : d));
                alert(`DNS Verified for ${domain}. SSL provisioning started.`);
                refreshActivity();
            }
        } catch (err) {
            console.error('Failed to verify domain:', err);
        }
    };

    // Team
    const handleInviteMember = async (email: string, role: TeamMember['role']) => {
        // Feature Gating: Require team_access
        const currentPlan = subscription?.plan || 'free';
        if (!hasFeature(currentPlan, 'team_access')) {
            setPaywallFeature('team_access');
            setShowPaywall(true);
            return;
        }

        if (!selectedProjectId) return;
        try {
            const res = await fetch(`${API_BASE}/projects/${selectedProjectId}/team/invite/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role })
            });
            if (res.ok) {
                const newMember = await res.json();
                setTeamMembers([...teamMembers, newMember]);
                refreshActivity();
            }
        } catch (err) {
            console.error('Failed to invite member:', err);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!selectedProjectId) return;
        if (!confirm('Are you sure you want to remove this member?')) return;

        try {
            const res = await fetch(`${API_BASE}/projects/${selectedProjectId}/team/${userId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setTeamMembers(teamMembers.filter(m => m.user_id !== userId));
                refreshActivity();
            }
        } catch (err) {
            console.error('Failed to remove member:', err);
        }
    };

    const refreshActivity = () => {
        if (!selectedProjectId) return;
        fetch(`${API_BASE}/projects/${selectedProjectId}/activity/`)
            .then(res => res.ok ? res.json() : [])
            .then(setActivityLog)
            .catch(err => console.error('Failed to refresh activity:', err));
    };

    // Deployment Actions (Real Integration)
    const handleRedeploy = async (deploymentId: string) => {
        // Feature Gating: Require deployment
        const currentPlan = subscription?.plan || 'free';
        if (!hasFeature(currentPlan, 'deployment')) {
            setPaywallFeature('deployment');
            setShowPaywall(true);
            return;
        }

        if (!selectedProjectId) return;
        const deployment = deployments.find(d => d.deployment_id === deploymentId);
        if (!deployment) return;

        try {
            const res = await fetch(`${API_BASE}/deployments/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    run_id: deployment.run_id || 'run_1', // Assumes run_id is in deployment object
                    build_id: deployment.build_id || 'build_1'
                })
            });
            if (res.ok) {
                alert('Cloud Deployment initiated successfully!');
                refreshActivity();
            } else {
                const error = await res.json();
                alert(`Deployment failed: ${error.detail || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Failed to start deployment:', err);
            alert('Connection error during deployment.');
        }
    };

    // Placeholder handlers for missing functions
    const handleRollback = async (deploymentId: string) => {
        console.log('Rollback requested', deploymentId);
        alert('Rollback functionality coming soon');
    };

    const handlePromoteToProduction = async (deploymentId: string) => {
        console.log('Promote requested', deploymentId);
        alert('Promotion functionality coming soon');
    };

    return (
        <div className="h-screen flex overflow-hidden bg-[#09090b]">
            {/* Projects Sidebar */}
            <ProjectsSidebar
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProject={setSelectedProjectId}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
                {/* Startup Pipeline Tracker */}
                <div className="px-6 py-4 bg-[#09090b] border-b border-[#27272a]">
                    <div className="max-w-4xl bg-white/[0.02] border border-white/5 rounded-2xl p-1">
                        <StartupPipeline currentStage="launch" />
                    </div>
                </div>

                {/* Global Tab Navigation */}
                <div className="px-6 border-b border-[#27272a] bg-[#09090b]">
                    <div className="flex gap-6">
                        {[
                            { id: 'deployments', label: 'Deployments' },
                            { id: 'domains', label: 'Domains' },
                            { id: 'team', label: 'Team' },
                            { id: 'settings', label: 'Settings' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`
                                    py-4 text-sm font-medium border-b-2 transition-colors
                                    ${activeTab === tab.id
                                        ? 'text-white border-white'
                                        : 'text-gray-500 border-transparent hover:text-gray-300'
                                    }
                                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'deployments' && (
                    <DeploymentsTable
                        deployments={deployments}
                        selectedDeploymentId={selectedDeploymentId}
                        onSelectDeployment={handleSelectDeployment}
                    />
                )}

                {activeTab === 'domains' && (
                    <DomainsTab
                        domains={domains}
                        onAddDomain={handleAddDomain}
                        onRemoveDomain={handleRemoveDomain}
                        onVerifyDNS={handleVerifyDNS}
                    />
                )}

                {activeTab === 'team' && (
                    <TeamTab
                        members={teamMembers}
                        activityLog={activityLog}
                        onInviteMember={handleInviteMember}
                        onRemoveMember={handleRemoveMember}
                    />
                )}

                {activeTab === 'settings' && selectedProjectId && (
                    <SettingsTab
                        project={projects.find(p => p.project_id === selectedProjectId)!}
                        onUpdateProject={async (updates) => {
                            try {
                                const res = await fetch(`${API_BASE}/projects/${selectedProjectId}/`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(updates)
                                });
                                if (res.ok) {
                                    const updated = await res.json();
                                    setProjects(projects.map(p => p.project_id === selectedProjectId ? updated : p));
                                    refreshActivity();
                                }
                            } catch (e) {
                                console.error(e);
                            }
                        }}
                        onDeleteProject={async () => {
                            try {
                                const res = await fetch(`${API_BASE}/projects/${selectedProjectId}/`, {
                                    method: 'DELETE'
                                });
                                if (res.ok) {
                                    const remaining = projects.filter(p => p.project_id !== selectedProjectId);
                                    setProjects(remaining);
                                    setSelectedProjectId(remaining[0]?.project_id || null);
                                }
                            } catch (e) {
                                console.error(e);
                            }
                        }}
                    />
                )}
            </div>

            {/* Deployment Details Drawer */}
            <DeploymentDetailsDrawer
                deploymentDetails={deploymentDetails}
                isOpen={isDrawerOpen}
                onClose={() => {
                    setIsDrawerOpen(false);
                    setSelectedDeploymentId(null);
                }}
                onRedeploy={handleRedeploy}
                onRollback={handleRollback}
                onPromoteToProduction={handlePromoteToProduction}
            />

            {/* PAYWALL MODAL */}
            {showPaywall && (
                <PaywallModal
                    feature={paywallFeature}
                    onClose={() => setShowPaywall(false)}
                />
            )}
        </div>
    );
}
