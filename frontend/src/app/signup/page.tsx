"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, Shield, CheckCircle, RotateCcw, User, Briefcase } from 'lucide-react';
import LoginLogo from '@/components/auth/LoginLogo';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [buildingType, setBuildingType] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Deliberate delay (300-500ms feel)
        setTimeout(() => {
            if (email === 'error@example.com') {
                setError("An account already exists for this email.");
                setIsLoading(false);
            } else {
                setSuccess(true);
                // After success interstitial, navigate to overview
                setTimeout(() => {
                    router.push('/overview');
                }, 1500);
            }
        }, 1000);
    };

    if (success) {
        return (
            <div className="h-screen bg-[#0a0a0f] flex items-center justify-center p-6 overflow-hidden relative">
                <div className="gradient-mesh opacity-20" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center z-10"
                >
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-6" />
                    <h2 className="text-2xl font-semibold text-white mb-2">Preparing your workspace...</h2>
                    <p className="text-[#8a8a9a]">Provisioning your production-grade infrastructure</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#06060a] flex flex-col md:flex-row font-sans selection:bg-indigo-500/30 selection:text-white overflow-hidden relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full z-0" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full z-0" />

            <div className="noise-overlay opacity-[0.03]" />

            {/* Logo positioned absolutely in the corner */}
            <Link href="/" className="absolute top-6 left-6 z-30 pointer-events-auto">
                <LoginLogo className="h-7" />
            </Link>

            {/* Left Column: Form Content */}
            <div className="flex-1 flex flex-col items-center justify-start p-6 md:p-12 relative overflow-y-auto z-10">
                <div className="w-full max-w-[400px] pt-24 pb-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col"
                    >
                        <div className="w-full mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">Create your account</h2>
                            <p className="text-[#8a8a9a] text-sm font-medium opacity-80">Serious infrastructure for your next build.</p>
                        </div>

                        <div className="w-full space-y-5">
                            {/* Social Auth at the top */}
                            <div className="grid grid-cols-2 gap-4">
                                <SocialButton type="google" />
                                <SocialButton type="github" />
                            </div>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/5"></span>
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase">
                                    <span className="bg-[#06060a] px-4 text-[#3a3a4a] font-bold tracking-[0.3em]">or</span>
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-xs flex items-start space-x-3 font-medium"
                                >
                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{error} <Link href="/login" className="font-bold underline text-red-300 hover:text-red-200">Sign in instead</Link></span>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 gap-5">
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#5a5a6a] uppercase tracking-[0.15em] mb-2.5" htmlFor="name">
                                            Full Name
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your name"
                                            required
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-[#3a3a4a] outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-[#5a5a6a] uppercase tracking-[0.15em] mb-2.5" htmlFor="email">
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@company.com"
                                            required
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 px-4 text-sm text-white placeholder:text-[#3a3a4a] outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-[#5a5a6a] uppercase tracking-[0.15em] mb-2.5" htmlFor="password">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 px-4 text-sm text-white placeholder:text-[#3a3a4a] outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all font-medium"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3a3a4a] hover:text-[#b4b4c4] transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full relative group disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed mt-4"
                                >
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/50 to-purple-500/50 rounded-xl blur-sm opacity-20 group-hover:opacity-40 transition duration-300" />
                                    <div className="relative w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-xl shadow-indigo-500/10">
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                                                <span>Provisioning...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Sign Up</span>
                                                <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </>
                                        )}
                                    </div>
                                </button>
                            </form>

                            <div className="text-center pt-2">
                                <p className="text-[13px] font-medium text-[#8a8a9a]">
                                    Already have a Smartbuilder account?{' '}
                                    <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-all font-bold">
                                        Log in
                                    </Link>
                                </p>
                            </div>

                            <div className="text-center opacity-30">
                                <p className="text-[11px] text-[#4a4a5a] font-medium leading-relaxed">
                                    By clicking "Sign Up", you agree to our <br />
                                    <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Column: Visual Refrence Panel */}
            <div className="hidden lg:flex w-[50%] p-8 relative items-center justify-center z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="w-full h-full rounded-[2.5rem] relative overflow-hidden flex items-center justify-center shadow-2xl"
                >
                    {/* Atmospheric Background inspired by the reference image's airy look but in dark theme */}
                    <div className="absolute inset-0 bg-[#0a0a0f]" />

                    {/* Animated Clouds/Mesh consistent with Smartbuilder but in the Base44 layout pattern */}
                    <div className="absolute top-[10%] -left-[10%] w-[100%] h-[100%] bg-indigo-500/[0.07] blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[10%] -right-[10%] w-[100%] h-[100%] bg-purple-500/[0.07] blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2.5s' }} />

                    {/* The "Turn your ideas into apps" bar from reference */}
                    <div className="relative z-20 w-full max-w-sm">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="bg-white/5 backdrop-blur-3xl border border-white/10 p-1.5 rounded-2xl flex items-center shadow-2xl"
                        >
                            <div className="flex-1 px-5 text-lg font-medium text-[#9494a4] tracking-tight whitespace-nowrap overflow-hidden">
                                <motion.span
                                    initial={{ width: 0 }}
                                    animate={{ width: "auto" }}
                                    transition={{ duration: 2, delay: 1 }}
                                    className="block border-r-2 border-indigo-500/50 pr-1"
                                >
                                    Turn your ideas into apps
                                </motion.span>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/40 shadow-inner">
                                <svg className="w-5 h-5 translate-y-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2, duration: 1 }}
                            className="mt-8 flex justify-center items-center space-x-3 text-[10px] font-bold text-indigo-400 uppercase tracking-[0.4em] opacity-40"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <span>System Provisioning Ready</span>
                        </motion.div>
                    </div>

                    {/* Subtle grid pattern for texture */}
                    <div className="absolute inset-0 bg-grid-white/[0.015] [mask-image:radial-gradient(white,transparent)]" />
                </motion.div>
            </div>
        </div>
    );
}

function TrustBullet({ icon, title }: { icon: React.ReactNode, title: string }) {
    return (
        <div className="flex items-center space-x-3.5 bg-white/5 border border-white/10 rounded-xl p-3 w-fit hover:border-indigo-500/30 transition-colors cursor-default">
            <div className="p-1.5 rounded-lg bg-indigo-500/10">
                {icon}
            </div>
            <span className="text-[#b4b4c4] text-sm font-medium">{title}</span>
        </div>
    );
}

function SocialButton({ type }: { type: 'google' | 'github' }) {
    const isGoogle = type === 'google';
    return (
        <button className="flex items-center justify-center space-x-3 px-4 py-3 bg-[#0f0f15] border border-white/5 rounded-xl hover:bg-[#14141a] hover:border-white/10 transition-all group">
            {isGoogle ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.94 0 3.5.72 4.67 1.83l3.5-3.5C18.06 1.48 15.26 0 12 0 7.31 0 3.25 2.69 1.25 6.63l3.96 3.07C6.16 7.07 8.87 5.04 12 5.04z" />
                    <path fill="#4285F4" d="M23.64 12.2c0-.85-.07-1.68-.2-2.48H12v4.7h6.53c-.28 1.5-.1.1.1.1 1.13.1 1.76-1.15 4.7 6.53z" />
                    <path fill="#FBBC05" d="M5.21 14.37c-.24-.72-.37-1.49-.37-2.37s.13-1.65.37-2.37L1.25 6.63C.45 8.24 0 10.07 0 12s.45 3.76 1.25 5.37l3.96-3z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.83-2.97c-1.11.75-2.53 1.19-4.1 1.19-3.13 0-5.84-2.03-6.79-4.76l-3.96 3.07C3.25 21.31 7.31 24 12 24z" />
                </svg>
            ) : (
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.011-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.22 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .321.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
            )}
            <span className="text-[10px] font-bold text-[#b4b4c4] lg:group-hover:text-white transition-colors uppercase tracking-widest">{type}</span>
        </button>
    );
}
