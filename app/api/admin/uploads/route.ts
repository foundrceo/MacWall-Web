import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import {
  listCommunityUploads,
  type CommunityUploadStatus,
} from "@/lib/admin/uploads"

export async function GET(request: Request) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const allowed: Array<CommunityUploadStatus | "all"> = [
      "pending",
      "approved",
      "rejected",
      "all",
    ]

    const filter =
      status && allowed.includes(status as CommunityUploadStatus | "all")
        ? (status as CommunityUploadStatus | "all")
        : "pending"

    const uploads = await listCommunityUploads(filter)
    return NextResponse.json({ uploads, filter })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load uploads"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
