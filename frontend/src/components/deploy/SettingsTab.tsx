'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Key, Globe, ShieldAlert, Trash2, Save, Plus, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { Project, EnvironmentVariable } from '@/types/deploy';

interface SettingsTabProps {
    project: Project;
    onUpdateProject: (updates: Partial<Project>) => Promise<void>;
    onDeleteProject: () => Promise<void>;
}

const API_BASE = 'http://localhost:8000/api/v1';

export default function SettingsTab({ project, onUpdateProject, onDeleteProject }: SettingsTabProps) {
    const [activeSection, setActiveSection] = useState<'general' | 'env' | 'domains' | 'advanced'>('general');

    return (
        <div className="flex h-full bg-[#09090b]">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r border-[#27272a] p-4 space-y-1">
                <NavButton
                    active={activeSection === 'general'}
                    onClick={() => setActiveSection('general')}
                    icon={<Settings className="w-4 h-4" />}
                    label="General"
                />
                <NavButton
                    active={activeSection === 'env'}
                    onClick={() => setActiveSection('env')}
                    icon={<Key className="w-4 h-4" />}
                    label="Environment Variables"
                />
                <NavButton
                    active={activeSection === 'domains'}
                    onClick={() => setActiveSection('domains')}
                    icon={<Globe className="w-4 h-4" />}
                    label="Domains"
                />
                <div className="pt-4 mt-4 border-t border-[#27272a]">
                    <NavButton
                        active={activeSection === 'advanced'}
                        onClick={() => setActiveSection('advanced')}
                        icon={<ShieldAlert className="w-4 h-4" />}
                        label="Advanced"
                        variant="danger"
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-12">
                    {activeSection === 'general' && (
                        <GeneralSettings project={project} onUpdate={onUpdateProject} />
                    )}
                    {activeSection === 'env' && (
                        <EnvVarSettings projectId={project.project_id} />
                    )}
                    {activeSection === 'domains' && (
                        <div className="text-gray-500 text-center py-20">
                            Domain settings are managed in the main Domains tab.
                        </div>
                    )}
                    {activeSection === 'advanced' && (
                        <DangerZone project={project} onDelete={onDeleteProject} />
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Sub-Components ---

function NavButton({ active, onClick, icon, label, variant = 'default' }: any) {
    const baseClass = "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors";
    const activeClass = variant === 'danger'
        ? "bg-red-500/10 text-red-400"
        : "bg-[#18181b] text-white";
    const inactiveClass = variant === 'danger'
        ? "text-gray-500 hover:text-red-400"
        : "text-gray-500 hover:text-white hover:bg-[#18181b]/50";

    return (
        <button
            onClick={onClick}
            className={`${baseClass} ${active ? activeClass : inactiveClass}`}
        >
            {icon}
            {label}
        </button>
    );
}

function GeneralSettings({ project, onUpdate }: { project: Project, onUpdate: any }) {
    const [name, setName] = useState(project.name);
    const [root, setRoot] = useState(project.root_directory || './');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await onUpdate({ name, root_directory: root });
        setIsSaving(false);
    };

    const hasChanges = name !== project.name || root !== (project.root_directory || './');

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-white mb-1">General Settings</h2>
                <p className="text-sm text-gray-500">Configure your project&apos;s build and deployment settings.</p>
            </div>

            <div className="p-6 rounded-xl border border-[#27272a] bg-[#0c0c0e] space-y-6">
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Project Name
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-[#18181b] border border-[#27272a] rounded-md px-3 py-2 text-sm text-white flex-1 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Root Directory
                    </label>
                    <div className="flex gap-2">
                        <span className="flex items-center px-3 bg-[#18181b] border border-[#27272a] border-r-0 rounded-l-md text-gray-500 text-sm">/</span>
                        <input
                            type="text"
                            value={root}
                            onChange={(e) => setRoot(e.target.value)}
                            className="bg-[#18181b] border border-[#27272a] rounded-r-md px-3 py-2 text-sm text-white flex-1 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        The directory within your project that contains your code.
                    </p>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                        ${hasChanges
                            ? 'bg-white text-black hover:bg-gray-200'
                            : 'bg-[#18181b] text-gray-500 cursor-not-allowed'}
                    `}
                >
                    {isSaving ? <span className="animate-spin text-lg">⟳</span> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>
        </div>
    );
}

function EnvVarSettings({ projectId }: { projectId: string }) {
    const [vars, setVars] = useState<any[]>([]);
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const [targets, setTargets] = useState(['Production', 'Preview', 'Development']);

    useEffect(() => {
        loadVars();
    }, [projectId]);

    const loadVars = async () => {
        try {
            const res = await fetch(`${API_BASE}/projects/${projectId}/env`);
            if (res.ok) setVars(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const handleAdd = async () => {
        if (!newKey || !newValue) return;
        try {
            const res = await fetch(`${API_BASE}/projects/${projectId}/env`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: newKey, value: newValue, target: targets })
            });
            if (res.ok) {
                setNewKey('');
                setNewValue('');
                loadVars();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/projects/${projectId}/env/${id}`, { method: 'DELETE' });
            if (res.ok) loadVars();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-white mb-1">Environment Variables</h2>
                <p className="text-sm text-gray-500">Encrypted environments variables for your build and runtime.</p>
            </div>

            {/* Add Form */}
            <div className="p-6 rounded-xl border border-[#27272a] bg-[#0c0c0e] space-y-4">
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Key</label>
                        <input
                            placeholder="EXAMPLE_KEY"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            className="w-full bg-[#18181b] border border-[#27272a] rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-700"
                        />
                    </div>
                    <div className="col-span-8">
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Value</label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                placeholder=""
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                className="flex-1 bg-[#18181b] border border-[#27272a] rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-700"
                            />
                            <button
                                onClick={handleAdd}
                                disabled={!newKey || !newValue}
                                className="px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#18181b] text-gray-500 font-medium uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Key</th>
                            <th className="px-6 py-3">Value</th>
                            <th className="px-6 py-3">Environments</th>
                            <th className="px-6 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272a] bg-[#0c0c0e]">
                        {vars.map((v) => (
                            <tr key={v.id} className="group">
                                <td className="px-6 py-4 font-mono font-medium text-white">{v.key}</td>
                                <td className="px-6 py-4 font-mono text-gray-400">
                                    {v.value.slice(0, 4)}••••••••••
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {v.target.map((t: string) => (
                                            <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-gray-800 text-gray-400 border border-gray-700">{t}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(v.id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {vars.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No environment variables configured.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function DangerZone({ project, onDelete }: { project: Project, onDelete: any }) {
    const [confirmName, setConfirmName] = useState('');

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-red-500 mb-1">Danger Zone</h2>
                <p className="text-sm text-gray-500">Irreversible actions for your project.</p>
            </div>

            <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 space-y-6">
                <div>
                    <h3 className="font-semibold text-white mb-2">Delete Project</h3>
                    <p className="text-sm text-gray-400 mb-6">
                        The project <strong className="text-white">{project.name}</strong> will be permanently deleted, including all deployments, domains, and activity history. This action cannot be undone.
                    </p>

                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Type the project name to confirm
                    </label>
                    <div className="flex gap-4">
                        <input
                            placeholder={project.name}
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            className="bg-[#09090b] border border-red-500/20 rounded-md px-3 py-2 text-sm text-white flex-1 focus:ring-1 focus:ring-red-500 outline-none placeholder:text-gray-700"
                        />
                        <button
                            onClick={onDelete}
                            disabled={confirmName !== project.name}
                            className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            Delete Project
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
