import { NextResponse } from "next/server";

/**
 * Catch-all route to silently handle source map requests
 * from browser extensions (e.g. lollipop.css.map, toolbox.css.map).
 * Returns an empty JSON response to prevent noisy 404 logs in the terminal.
 */
export async function GET() {
  return new NextResponse("{}", {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
