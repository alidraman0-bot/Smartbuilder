import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  devIndicators: false,
  /* 
  turbopack: {
    // Set the root to the workspace root to handle multiple lockfiles and avoid Windows path encoding issues
    root: path.resolve(__dirname, ".."),
  },
  */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL
          ? `${process.env.BACKEND_URL}/api/:path*`
          : 'http://127.0.0.1:8000/api/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.paystack.co; frame-src 'self' https://js.paystack.co https://checkout.paystack.com https://standard.paystack.co; connect-src 'self' ws://localhost:3000 ws://127.0.0.1:3000 ws://localhost:3001 http://localhost:3001 wss://*.supabase.co https://api.paystack.co https://checkout.paystack.com https://*.supabase.co http://localhost:8000 http://127.0.0.1:8000 ws://localhost:8000 ws://127.0.0.1:8000 http://localhost:8001 http://127.0.0.1:8001 ws://localhost:8001 ws://127.0.0.1:8001;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
