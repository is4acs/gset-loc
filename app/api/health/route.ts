import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Liveness probe. Returns 200 if the server is responsive. Used by Vercel
 * uptime monitoring and external pingers.
 */
export async function GET() {
  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}
