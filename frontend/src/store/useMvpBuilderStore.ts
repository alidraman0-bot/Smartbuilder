/**
 * MVP Builder Store — Zustand state management for the autonomous build pipeline.
 * 
 * Manages:
 * - Session lifecycle (create, poll, improve)
 * - 8-step pipeline progress tracking
 * - Generated files, preview URL, timeline
 */

import { create } from 'zustand';
import { apiFetch } from '@/lib/apiClient';
import { getAuthHeaders } from '@/utils/supabase/auth';

// ============================================================================
// Types
// ============================================================================

export interface PipelineStep {
  step: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'skipped';
  data?: Record<string, unknown>;
}

export interface TimelineEvent {
  message: string;
  event_type: string;
  timestamp: string;
  // Alias for event_type to simplify UI usage
  type?: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language?: string;
  description?: string;
  type?: string;
}

export interface BuildSession {
  session_id: string;
  run_id: string;
  state: string;
  project_name: string;
  preview_url: string | null;
  sandbox_id: string | null;
  files_count: number;
  pipeline_steps: PipelineStep[];
  timeline: TimelineEvent[];
  last_error: { message: string; category: string } | null;
  build_version: number;
  plan: Record<string, unknown> | null;
  architecture: Record<string, unknown> | null;
  scaffold: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface MvpBuilderState {
  // Session
  sessionId: string | null;
  session: BuildSession | null;
  projectName: string;

  // Pipeline
  pipelineSteps: PipelineStep[];
  currentStepIndex: number;
  executionTimeline: TimelineEvent[];

  // Files
  files: GeneratedFile[];
  currentFiles: GeneratedFile[];
  filesCount: number;

  // UI state
  isBuilding: boolean;
  isLoading: boolean; // alias for UI loading state
  buildVersion: number; // build version from backend
  error: string | null;
  idea: string;
  // New UI fields
  previewUrl: string;
  previewStatus: string;
  uiState: string;
  buildMode: string;
  autoFixAttempts: number;

  // Actions
  setIdea: (idea: string) => void;
  setBuildVersion: (v: number) => void;
  setBuildMode: (mode: string) => void;
  setAutoFixAttempts: (count: number) => void;
  buildMVP: (idea: string) => Promise<void>;
  submitIdea: (idea: string, runId?: string) => Promise<void>; // alias for buildMVP
  improveMVP: (instruction: string) => Promise<void>;
  iterate: (prompt: string) => Promise<void>;
  pollState: () => Promise<void>;
  stopPolling: () => void;
  fetchFiles: () => Promise<void>;
  freezeBuild: () => Promise<void>;
  freeze: () => Promise<void>; // alias for freezeBuild
  revertBuild: () => Promise<void>;
  reset: () => void;
}

// Exported helper types for UI components
export type BuildMode = string;
export type BuilderState = MvpBuilderState;

// Default pipeline steps
const DEFAULT_STEPS: PipelineStep[] = [
  { step: 'analyze',  label: 'Analyzing Idea',         status: 'pending' },
  { step: 'design',   label: 'Designing Architecture', status: 'pending' },
  { step: 'generate', label: 'Generating Code',        status: 'pending' },
  { step: 'scaffold', label: 'Scaffolding Project',    status: 'pending' },
  { step: 'optimize', label: 'Optimizing',             status: 'pending' },
  { step: 'deploy',   label: 'Deploying',              status: 'pending' },
  { step: 'verify',   label: 'Verifying',              status: 'pending' },
  { step: 'finalize', label: 'Finalizing',             status: 'pending' },
];

let pollInterval: ReturnType<typeof setInterval> | null = null;

// ============================================================================
// Store
// ============================================================================

export const useMvpBuilderStore = create<MvpBuilderState>((set, get) => ({
  sessionId: null,
  session: null,
  projectName: '',
  pipelineSteps: [...DEFAULT_STEPS],
  currentStepIndex: -1,
  executionTimeline: [],
  files: [],
  currentFiles: [],
  filesCount: 0,
  isBuilding: false,
  isLoading: false,
  buildVersion: 0,
  error: null,
  idea: '',
  // UI fields
  previewUrl: '',
  previewStatus: '',
  uiState: '',
  buildMode: '',
  autoFixAttempts: 0,

  setIdea: (idea: string) => set({ idea }),
  setBuildVersion: (v: number) => set({ buildVersion: v }),
  setBuildMode: (mode: string) => set({ buildMode: mode }),
  setAutoFixAttempts: (count: number) => set({ autoFixAttempts: count }),

  buildMVP: async (idea: string) => {
    set({ isBuilding: true, isLoading: true, error: null, idea, pipelineSteps: [...DEFAULT_STEPS], currentStepIndex: 0, files: [], currentFiles: [], filesCount: 0 });

    try {
      const headers = await getAuthHeaders();
      const data = await apiFetch<any>(`/api/v1/mvp-builder/build`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ idea }),
      });

      set({
        sessionId: data.session_id,
        pipelineSteps: data.pipeline_steps || [...DEFAULT_STEPS],
      });

      // Start polling for progress
      get().stopPolling();
      pollInterval = setInterval(() => {
        get().pollState();
      }, 2000);

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      set({ isBuilding: false, isLoading: false, error: msg });
    }
  },

  submitIdea: async (idea: string, runId?: string) => {
    // runId currently unused, kept for compatibility
    await get().buildMVP(idea);
  },

  // Iterate over prompts (alias for improveMVP)
  iterate: async (prompt: string) => {
    await get().improveMVP(prompt);
  },

  improveMVP: async (instruction: string) => {
    const { sessionId } = get();
    if (!sessionId) return;

    set({ isBuilding: true, isLoading: true, error: null });

    try {
      const headers = await getAuthHeaders();
      await apiFetch(`/api/v1/mvp-builder/${sessionId}/improve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ instruction }),
      });

      // Resume polling
      get().stopPolling();
      pollInterval = setInterval(() => get().pollState(), 2000);

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      set({ isBuilding: false, isLoading: false, error: msg });
    }
  },

  pollState: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    try {
      const headers = await getAuthHeaders();
      const session = await apiFetch<BuildSession>(`/api/v1/mvp-builder/${sessionId}/state`, { headers });
      const steps = session.pipeline_steps || get().pipelineSteps;

      // Find current active step
      const activeIdx = steps.findIndex((s) => s.status === 'active');
      const isComplete = session.state === 'S4' || session.state === 'S6';
      const isFailed = session.state === 'S5' && session.last_error;

      set({
          session,
          projectName: session.project_name || '',
          pipelineSteps: steps,
          // Ensure type field is populated for UI components
          executionTimeline: session.timeline.map((e) => ({ ...e, type: e.type ?? e.event_type })),
          currentStepIndex: activeIdx >= 0 ? activeIdx : (isComplete ? steps.length : get().currentStepIndex),
          filesCount: session.files_count,
          isBuilding: !(isComplete || isFailed),
          isLoading: !(isComplete || isFailed),
          // UI mappings
          previewUrl: session.preview_url || '',
          previewStatus: session.state || '',
          uiState: session.state || '',
          buildVersion: session.build_version || 0
        });

      // Stop polling when build is done
      if (isComplete || isFailed) {
        get().stopPolling();

        if (isFailed) {
          set({ error: session.last_error?.message || 'Build failed' });
        }

        // Fetch generated files
        if (session.files_count > 0) {
          get().fetchFiles();
        }
      }

    } catch (err: any) {
      console.error('pollState failed:', err);
    }
  },

  stopPolling: () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  },

  fetchFiles: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    try {
      const headers = await getAuthHeaders();
      const data = await apiFetch<any>(`/api/v1/mvp-builder/${sessionId}/files`, { headers });
      set({ files: data.files || [], filesCount: data.total_files || 0 });
    } catch (err: any) {
      console.error('fetchFiles failed:', err);
    }
  },

  // Alias for freeze action
  freeze: async () => {
    const { sessionId } = get();
    if (!sessionId) return;
    try {
      const headers = await getAuthHeaders();
      await apiFetch(`/api/v1/mvp-builder/${sessionId}/freeze`, { method: 'POST', headers });
      get().pollState();
    } catch (err: any) {
      console.error('freezeBuild failed:', err);
    }
  },
  // Original freezeBuild retained for backward compatibility (optional)
  freezeBuild: async () => {
    const { sessionId } = get();
    if (!sessionId) return;
    try {
      const headers = await getAuthHeaders();
      await apiFetch(`/api/v1/mvp-builder/${sessionId}/freeze`, { method: 'POST', headers });
      get().pollState();
    } catch (err: any) {
      console.error('freezeBuild failed:', err);
    }
  },

  revertBuild: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    try {
      const headers = await getAuthHeaders();
      await apiFetch(`/api/v1/mvp-builder/${sessionId}/revert`, { method: 'POST', headers });
      get().pollState();
    } catch (err: any) {
      console.error('revertBuild failed:', err);
    }
  },

  reset: () => {
    get().stopPolling();
    set({
      sessionId: null,
      session: null,
      pipelineSteps: [...DEFAULT_STEPS],
      currentStepIndex: -1,
      files: [],
      filesCount: 0,
      isBuilding: false,
      error: null,
      idea: '',
      buildVersion: 0,
    });
  },
}));
