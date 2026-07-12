import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import {
  createPendingUploadSignedUrls,
  getCommunityUpload,
} from "@/lib/admin/uploads"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const { id } = await context.params
    const upload = await getCommunityUpload(id)
    if (!upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 })
    }

    const media = await createPendingUploadSignedUrls(
      upload.videoKey,
      upload.thumbKey
    )

    return NextResponse.json({ upload, media })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load media"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
