import { NextResponse } from 'next/server';
import { runMarketResearchPipeline } from '../../../workflows/marketResearchPipeline';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { idea, industry, region, depth } = body;

        if (!idea || !industry || !region) {
            return NextResponse.json({ error: "Missing required fields: idea, industry, region" }, { status: 400 });
        }

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const onProgress = (msg: string) => {
                    controller.enqueue(encoder.encode(JSON.stringify({ progress: msg }) + '\n'));
                };
                
                try {
                    const result = await runMarketResearchPipeline({ idea, industry, region, depth: depth || 'basic' }, onProgress);
                    controller.enqueue(encoder.encode(JSON.stringify({ result }) + '\n'));
                    controller.close();
                } catch (error: any) {
                    controller.enqueue(encoder.encode(JSON.stringify({ error: error.message }) + '\n'));
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'application/x-ndjson',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
