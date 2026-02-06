"use client";

import Link from "next/link";
import { MoveLeft, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
            <div className="relative">
                <h1 className="text-[150px] md:text-[200px] font-bold leading-none select-none bg-gradient-to-b from-white/20 to-transparent bg-clip-text text-transparent">
                    404
                </h1>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full">
                    <h2 className="text-2xl md:text-3xl font-semibold mb-2">Lost in space?</h2>
                    <p className="text-white/60 mb-8 max-w-md mx-auto">
                        The page you're looking for doesn't exist or has been moved to another dimension.
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-all active:scale-95"
                >
                    <Home className="w-4 h-4" />
                    Back to Dashboard
                </Link>
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-medium hover:bg-white/10 transition-all active:scale-95"
                >
                    <MoveLeft className="w-4 h-4" />
                    Go Back
                </button>
            </div>

            {/* Decorative elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
            </div>
        </div>
    );
}
