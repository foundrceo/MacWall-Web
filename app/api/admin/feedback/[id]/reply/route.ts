import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import { replyToFeedback } from "@/lib/admin/feedback"

export const runtime = "nodejs"

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const { id } = await context.params
    const body = (await request.json()) as {
      reply?: string
      imageUrl?: string | null
    }
    const reply = typeof body.reply === "string" ? body.reply : ""
    const imageUrl =
      typeof body.imageUrl === "string" && body.imageUrl.trim()
        ? body.imageUrl.trim()
        : null

    if (!reply.trim() && !imageUrl) {
      return NextResponse.json(
        { error: "reply is required" },
        { status: 400 }
      )
    }

    const feedback = await replyToFeedback(id, reply, imageUrl)
    return NextResponse.json({ feedback })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send reply"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
