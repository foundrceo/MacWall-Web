import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"
import { r2PresignGetUrl } from "@/lib/storage/r2"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export type CommunityUploadStatus = "pending" | "approved" | "rejected"

export type AdminCommunityUpload = {
  id: string
  submitterId: string
  title: string
  category: string
  videoKey: string
  thumbKey: string
  resolution: string
  durationSeconds: number
  fileSizeBytes: number
  status: CommunityUploadStatus
  reviewNotes: string | null
  approvedWallpaperId: string | null
  createdAt: string
  updatedAt: string
}

type UploadRow = {
  id: string
  submitter_id: string
  title: string
  category: string
  video_key: string
  thumb_key: string
  resolution: string
  duration_seconds: number
  file_size_bytes: number
  status: CommunityUploadStatus
  review_notes: string | null
  approved_wallpaper_id: string | null
  created_at: string
  updated_at: string
}

function mapUpload(row: UploadRow): AdminCommunityUpload {
  return {
    id: row.id,
    submitterId: row.submitter_id,
    title: row.title,
    category: row.category,
    videoKey: row.video_key,
    thumbKey: row.thumb_key,
    resolution: row.resolution,
    durationSeconds: row.duration_seconds,
    fileSizeBytes: row.file_size_bytes,
    status: row.status,
    reviewNotes: row.review_notes,
    approvedWallpaperId: row.approved_wallpaper_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listCommunityUploads(
  status?: CommunityUploadStatus | "all"
): Promise<AdminCommunityUpload[]> {
  const supabase = getSupabaseAdmin()
  let query = supabase
    .from("community_uploads")
    .select(
      "id,submitter_id,title,category,video_key,thumb_key,resolution,duration_seconds,file_size_bytes,status,review_notes,approved_wallpaper_id,created_at,updated_at"
    )
    .order("created_at", { ascending: false })
    .limit(200)

  if (status && status !== "all") {
    query = query.eq("status", status)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as UploadRow[]).map(mapUpload)
}

export async function getCommunityUpload(
  uploadId: string
): Promise<AdminCommunityUpload | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("community_uploads")
    .select(
      "id,submitter_id,title,category,video_key,thumb_key,resolution,duration_seconds,file_size_bytes,status,review_notes,approved_wallpaper_id,created_at,updated_at"
    )
    .eq("id", uploadId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  return mapUpload(data as UploadRow)
}

export async function approveCommunityUpload(
  uploadId: string,
  wallpaperId?: string | null
) {
  const supabase = getSupabaseAdmin()
  const body: { upload_id: string; wallpaper_id?: string } = {
    upload_id: uploadId,
  }
  const trimmedWallpaperId = wallpaperId?.trim()
  if (trimmedWallpaperId) body.wallpaper_id = trimmedWallpaperId

  const { data, error } = await supabase.functions.invoke(
    "approve-community-upload",
    { body }
  )

  if (error) throw new Error(error.message)

  const payload = data as { error?: string; status?: string } | null
  if (payload?.error) throw new Error(payload.error)

  return payload
}

export async function rejectCommunityUpload(
  uploadId: string,
  reviewNotes?: string
) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.rpc("reject_community_upload", {
    p_upload_id: uploadId,
    p_review_notes: reviewNotes?.trim() || null,
  })

  if (error) throw new Error(error.message)
  return data
}

export async function createPendingUploadSignedUrls(
  videoKey: string,
  thumbKey: string,
  expiresInSeconds = 3600
) {
  const origin = getR2PublicBaseUrl()
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString()

  const [videoUrl, thumbUrl] = await Promise.all([
    r2PresignGetUrl(videoKey, expiresInSeconds),
    r2PresignGetUrl(thumbKey, expiresInSeconds),
  ])
  return { videoUrl, thumbUrl, origin, expiresAt }
}

export async function revalidateMarketingCatalog() {
  const secret = process.env.REVALIDATE_SECRET?.trim()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!secret || !siteUrl) return

  try {
    await fetch(new URL("/api/revalidate/catalog", siteUrl), {
      method: "POST",
      headers: { "x-revalidate-secret": secret },
      cache: "no-store",
    })
  } catch (error) {
    console.error("[admin] catalog revalidate failed:", error)
  }
}
