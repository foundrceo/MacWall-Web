import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"
import { notifyCommunityUploadReviewed } from "@/lib/push/notify-visitor"
import { r2CopyObject, r2PresignGetUrl } from "@/lib/storage/r2"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { randomUUID } from "crypto"

export type CommunityUploadStatus = "pending" | "approved" | "rejected"

export type AdminCommunityUpload = {
  id: string
  submitterId: string
  title: string
  category: string
  authorName: string | null
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
  author_name: string | null
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
    authorName: row.author_name ?? null,
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
      "id,submitter_id,title,category,author_name,video_key,thumb_key,resolution,duration_seconds,file_size_bytes,status,review_notes,approved_wallpaper_id,created_at,updated_at"
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
      "id,submitter_id,title,category,author_name,video_key,thumb_key,resolution,duration_seconds,file_size_bytes,status,review_notes,approved_wallpaper_id,created_at,updated_at"
    )
    .eq("id", uploadId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  return mapUpload(data as UploadRow)
}

export async function approveCommunityUpload(
  uploadId: string,
  wallpaperId?: string | null,
  reviewNotes?: string | null
) {
  const upload = await getCommunityUpload(uploadId)
  if (!upload) throw new Error("upload_not_found")
  if (upload.status === "rejected") throw new Error("upload_rejected")

  const trimmedNotes = reviewNotes?.trim() || null

  if (upload.status === "approved" && upload.approvedWallpaperId) {
    if (trimmedNotes) {
      const supabase = getSupabaseAdmin()
      await supabase
        .from("community_uploads")
        .update({ review_notes: trimmedNotes })
        .eq("id", uploadId)
    }
    return {
      status: "approved",
      wallpaperId: upload.approvedWallpaperId,
      alreadyPublished: true,
    }
  }

  const wallpaperID =
    wallpaperId?.trim() ||
    upload.approvedWallpaperId?.trim() ||
    randomUUID()

  const { videoKey, thumbKey } = canonicalCommunityCatalogKeys(
    wallpaperID,
    upload.videoKey
  )

  await r2CopyObject(upload.videoKey, videoKey)
  await r2CopyObject(upload.thumbKey, thumbKey)

  const supabase = getSupabaseAdmin()

  const { error: wallpaperError } = await supabase.from("wallpapers").upsert(
    {
      id: wallpaperID,
      name: upload.title,
      category: upload.category,
      tags: ["community"],
      resolution: upload.resolution,
      duration_seconds: upload.durationSeconds,
      file_size_bytes: upload.fileSizeBytes,
      video_key: videoKey,
      thumb_key: thumbKey,
      is_pro: false,
      is_featured: false,
      is_curated_pick: false,
      like_count: 0,
    },
    { onConflict: "id" }
  )
  if (wallpaperError) {
    throw new Error(`wallpapers upsert: ${wallpaperError.message}`)
  }

  const { error: uploadError } = await supabase
    .from("community_uploads")
    .update({
      status: "approved",
      approved_wallpaper_id: wallpaperID,
      review_notes: trimmedNotes,
    })
    .eq("id", uploadId)

  if (uploadError) {
    throw new Error(`community_uploads update: ${uploadError.message}`)
  }

  void notifyCommunityUploadReviewed({
    visitorId: upload.submitterId,
    uploadId,
    title: upload.title,
    approved: true,
    reviewNotes: trimmedNotes,
  }).catch((error) => {
    console.error("[apns] approve notify failed:", error)
  })

  return {
    status: "approved",
    wallpaperId: wallpaperID,
    videoKey,
    thumbKey,
  }
}

function canonicalCommunityCatalogKeys(wallpaperId: string, sourceVideoKey: string) {
  const ext = videoExtensionFromKey(sourceVideoKey)
  return {
    videoKey: `videos/${wallpaperId}.${ext}`,
    thumbKey: `thumbs/${wallpaperId}.jpg`,
  }
}

function videoExtensionFromKey(videoKey: string): string {
  const ext = videoKey.split(".").pop()?.toLowerCase() ?? "mp4"
  return ["mp4", "mov", "m4v", "webm"].includes(ext) ? ext : "mp4"
}

export async function rejectCommunityUpload(
  uploadId: string,
  reviewNotes?: string
) {
  const upload = await getCommunityUpload(uploadId)
  const supabase = getSupabaseAdmin()
  const notes = reviewNotes?.trim() || null
  const { data, error } = await supabase.rpc("reject_community_upload", {
    p_upload_id: uploadId,
    p_review_notes: notes,
  })

  if (error) throw new Error(error.message)

  if (upload) {
    void notifyCommunityUploadReviewed({
      visitorId: upload.submitterId,
      uploadId,
      title: upload.title,
      approved: false,
      reviewNotes: notes,
    }).catch((err) => {
      console.error("[apns] reject notify failed:", err)
    })
  }

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
