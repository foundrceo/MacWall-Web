import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import { fetchTrialEmailStats } from "@/lib/admin/trial-emails"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const stats = await fetchTrialEmailStats()
    return NextResponse.json(stats)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load trial email stats"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
