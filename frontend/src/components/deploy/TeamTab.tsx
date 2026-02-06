'use client';

import React, { useState } from 'react';
import { User, Shield, Mail, Clock, MoreHorizontal, Plus, Activity } from 'lucide-react';
import { TeamMember, ActivityLogEntry } from '@/types/deploy';

interface TeamTabProps {
    members: TeamMember[];
    activityLog: ActivityLogEntry[];
    onInviteMember: (email: string, role: TeamMember['role']) => void;
    onRemoveMember: (userId: string) => void;
}

export default function TeamTab({
    members,
    activityLog,
    onInviteMember,
    onRemoveMember
}: TeamTabProps) {
    const [isInviting, setIsInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<TeamMember['role']>('Viewer');

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (inviteEmail) {
            onInviteMember(inviteEmail, inviteRole);
            setInviteEmail('');
            setIsInviting(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-[#09090b] p-8">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Team Members Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Team</h2>
                            <p className="text-gray-400">Manage access and permissions for this project.</p>
                        </div>
                        <button
                            onClick={() => setIsInviting(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Invite Member
                        </button>
                    </div>

                    {/* Invite Card */}
                    {isInviting && (
                        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 mb-6 animate-in slide-in-from-top-2">
                            <h3 className="text-lg font-bold text-white mb-4">Invite New Member</h3>
                            <form onSubmit={handleInvite} className="flex gap-4">
                                <input
                                    type="email"
                                    placeholder="colleague@example.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="flex-1 bg-black border border-[#27272a] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-white/20"
                                    autoFocus
                                    required
                                />
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
                                    className="bg-black border border-[#27272a] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/20"
                                >
                                    <option value="Owner">Owner</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Engineer">Engineer</option>
                                    <option value="Viewer">Viewer</option>
                                </select>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Invite
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsInviting(false)}
                                    className="px-6 py-2 bg-transparent text-gray-400 font-medium rounded-lg hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Members List */}
                    <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden divide-y divide-[#27272a]">
                        {members.map((member) => (
                            <div key={member.user_id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                        {(member.name || member.email).slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-medium">{member.name || 'Anonymous'}</span>
                                            {member.user_id === 'current_user' && (
                                                <span className="text-xs bg-[#27272a] text-gray-400 px-1.5 py-0.5 rounded">You</span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500">{member.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-[#27272a] text-gray-300 capitalize border border-[#3f3f46]`}>
                                            {member.role}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => onRemoveMember(member.user_id)}
                                        disabled={member.role === 'Owner'}
                                        className={`p-2 rounded-lg transition-colors ${member.role === 'Owner' ? 'opacity-0 cursor-default' : 'text-gray-500 hover:bg-red-500/10 hover:text-red-500'}`}
                                    >
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Activity Log Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="w-6 h-6 text-gray-500" />
                        <h3 className="text-lg font-bold text-white">Activity Log</h3>
                    </div>

                    <div className="border-l-2 border-[#27272a] ml-3 pl-8 space-y-8">
                        {activityLog.map((log) => (
                            <div key={log.log_id} className="relative">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-[#09090b] border-2 border-[#27272a] flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                                </div>

                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-white">
                                            <span className="font-medium">{log.actor}</span>
                                            <span className="text-gray-500 mx-1">{log.action}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                            {log.details && <span>{log.details}</span>}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
