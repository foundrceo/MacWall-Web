import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import {
  abortCatalogMultipartUpload,
  completeCatalogMultipartUpload,
  createCatalogMultipartUpload,
} from "@/lib/admin/catalog-multipart"

export const runtime = "nodejs"
export const maxDuration = 60

type MultipartBody = {
  action?: unknown
  key?: unknown
  contentType?: unknown
  sizeBytes?: unknown
  uploadId?: unknown
  parts?: unknown
}

export async function POST(request: Request) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const body = (await request.json()) as MultipartBody
    const action = typeof body.action === "string" ? body.action.trim() : ""

    if (action === "create") {
      const result = await createCatalogMultipartUpload({
        key: body.key,
        contentType: body.contentType,
        sizeBytes: body.sizeBytes,
      })
      console.info(
        "[admin] multipart create ok:",
        result.key,
        `${result.partCount} parts`
      )
      return NextResponse.json(result)
    }

    if (action === "complete") {
      const result = await completeCatalogMultipartUpload({
        key: body.key,
        uploadId: body.uploadId,
        parts: body.parts,
      })
      console.info("[admin] multipart complete ok:", result.key)
      return NextResponse.json(result)
    }

    if (action === "abort") {
      const result = await abortCatalogMultipartUpload({
        key: body.key,
        uploadId: body.uploadId,
      })
      console.info("[admin] multipart abort ok:", result.key)
      return NextResponse.json(result)
    }

    return NextResponse.json(
      { error: "Unknown multipart action. Use create, complete, or abort." },
      { status: 400 }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Multipart upload failed"
    console.error("[admin] multipart failed:", message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
