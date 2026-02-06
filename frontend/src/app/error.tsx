"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">Something went wrong</h1>
            <p className="text-white/60 mb-8 max-w-lg">
                An unexpected error occurred. Our team has been notified and we're working to fix it.
            </p>

            {error.digest && (
                <div className="mb-8 p-3 px-4 bg-white/5 rounded-md border border-white/10">
                    <code className="text-xs text-white/40 font-mono select-all">
                        Error ID: {error.digest}
                    </code>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => reset()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-all active:scale-95"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try again
                </button>
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-medium hover:bg-white/10 transition-all active:scale-95"
                >
                    <Home className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </div>

            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-10 right-10 w-96 h-96 bg-red-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px]" />
            </div>
        </div>
    );
}
