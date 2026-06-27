import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
const TIMEOUT = 12000; // 12 seconds (backend has 8s internal timeout + buffer)

export async function GET() {
    try {
        const url = `${BACKEND_URL}/api/v1/market-signals`;

        const controller = new AbortController();
        const timer = setTimeout(
            () => controller.abort(new Error('Backend request timed out')),
            TIMEOUT
        );

        const res = await fetch(url, {
            signal: controller.signal,
            next: { revalidate: 0 }
        });

        clearTimeout(timer);

        if (!res.ok) {
            throw new Error(`Backend error: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Market signals proxy error:', error?.message);

        if (error?.name === 'AbortError') {
            return NextResponse.json(
                { error: 'Backend request timed out' },
                { status: 504 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to connect to backend', message: error?.message },
            { status: 502 }
        );
    }
}
