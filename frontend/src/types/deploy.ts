// Vercel-Style Deployments — Type Definitions

export interface Project {
    project_id: string;
    name: string;
    framework: 'Next.js' | 'FastAPI' | 'React' | 'Python' | 'Full Stack';
    environment: 'Preview' | 'Production';
    status: 'active' | 'building' | 'failed';
    latest_deployment_id: string;
    created_at: string;
    updated_at: string;
    url: string | null;
    root_directory: string | null;
}

export interface Deployment {
    deployment_id: string;
    project_id: string;
    status: 'success' | 'building' | 'failed' | 'queued';
    commit_message: string; // "Prompt Update" or "Feature Added"
    environment: 'Preview' | 'Production';
    created_at: string;
    completed_at: string | null;
    duration: string | null; // "2m 34s"
    url: string | null;
    version: string;
    triggered_by: string; // user email or "Smartbuilder AI"
    run_id?: string;
    build_id?: string;
}

export interface DeploymentLog {
    timestamp: string;
    stage: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

export interface DeploymentDetails {
    deployment: Deployment;
    logs: DeploymentLog[];
    configuration: DeploymentConfiguration;
    environment_variables: EnvironmentVariable[];
}

export interface DeploymentConfiguration {
    runtime: string; // "Node.js 20.x"
    region: string; // "us-east-1"
    memory: string; // "512 MB"
    timeout: string; // "10s"
    build_command: string;
    start_command: string;
}

export interface EnvironmentVariable {
    key: string;
    value: string; // masked in UI
    environment: 'Preview' | 'Production' | 'Both';
    is_secret: boolean;
}

export interface Domain {
    domain: string;
    type: 'default' | 'custom';
    ssl_status: 'active' | 'pending' | 'failed';
    dns_status: 'verified' | 'pending' | 'failed';
    created_at: string;
    redirect_config?: {
        force_https: boolean;
        redirect_www: boolean;
    };
}

export interface TeamMember {
    user_id: string;
    email: string;
    name: string | null;
    role: 'Owner' | 'Admin' | 'Engineer' | 'Viewer';
    status: 'active' | 'invited' | 'suspended';
    joined_at: string;
    last_active: string | null;
}

export interface ActivityLogEntry {
    log_id: string;
    timestamp: string;
    actor: string; // email or "Smartbuilder AI"
    actor_type: 'user' | 'system';
    action: string;
    details: string;
    project_id: string;
}

export interface DeploymentMetrics {
    uptime: number; // percentage
    error_rate: number; // percentage
    response_time_ms: number;
    requests_24h: number;
}
