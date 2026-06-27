import { NextResponse } from 'next/server';
import { generateBusinessPRD } from '@/workflows/generateBusinessPRD';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idea } = body;

    if (!idea || typeof idea !== 'string') {
      return NextResponse.json({ error: "Invalid idea provided" }, { status: 400 });
    }

    // Call combination workflow
    const result = await generateBusinessPRD(idea);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      strategy: result.strategy,
      prd: result.prd,
    });
  } catch (error: any) {
    console.error("Generate PRD API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
