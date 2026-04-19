import { NextResponse } from "next/server";
import { getStatsPayload, type StatsResponse } from "@/lib/stats";

// Public-facing aggregate download stats for the homepage social-proof
// strip. The same logic is also imported directly by the strip server
// component to avoid an HTTP self-fetch during prerender.

export const revalidate = 3600;

export type { StatsResponse };

export async function GET(): Promise<NextResponse<StatsResponse>> {
  const payload = await getStatsPayload();
  return NextResponse.json(payload, { status: 200 });
}
