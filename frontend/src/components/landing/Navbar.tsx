"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll } from 'framer-motion';

export default function Navbar() {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        return scrollY.onChange((latest) => {
            setIsScrolled(latest > 50);
        });
    }, [scrollY]);

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm' : 'bg-transparent'}`}
        >
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                    S
                </div>
                <span className={`text-xl font-bold tracking-tight uppercase ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>Smartbuilder</span>
            </div>

            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-500">
                <Link href="/product" className="hover:text-indigo-600 transition-colors">Product</Link>
                <Link href="/how-it-works" className="hover:text-indigo-600 transition-colors">How it works</Link>
                <Link href="/pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link>
                <Link href="/resources" className="hover:text-indigo-600 transition-colors">Resources</Link>
            </div>

            <div className="flex items-center space-x-4">
                <Link href="/login" className="text-sm font-medium text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                    Sign in
                </Link>
                <Link href="/signup" className="bg-slate-900 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5">
                    Start building
                </Link>
            </div>
        </motion.nav>
    );
}
