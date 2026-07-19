import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import {
  getFeedbackTotals,
  listAppFeedback,
  setFeedbackResolved,
  type FeedbackFilter,
} from "@/lib/admin/feedback"

export const runtime = "nodejs"

const ALLOWED: FeedbackFilter[] = [
  "all",
  "unread",
  "like",
  "dislike",
  "neutral",
]

export async function GET(request: Request) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const { searchParams } = new URL(request.url)
    const requested = searchParams.get("filter")
    const filter: FeedbackFilter =
      requested && ALLOWED.includes(requested as FeedbackFilter)
        ? (requested as FeedbackFilter)
        : "all"

    const [feedback, totals] = await Promise.all([
      listAppFeedback(filter),
      getFeedbackTotals(),
    ])

    return NextResponse.json({ feedback, totals, filter })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load feedback"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const body = (await request.json()) as {
      id?: string
      isResolved?: boolean
    }
    if (!body.id || typeof body.isResolved !== "boolean") {
      return NextResponse.json(
        { error: "id and isResolved are required" },
        { status: 400 }
      )
    }

    const result = await setFeedbackResolved(body.id, body.isResolved)
    return NextResponse.json(result)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update feedback"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
