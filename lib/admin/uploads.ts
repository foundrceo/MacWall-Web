import "server-only"

import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"
import { notifyCommunityUploadReviewed } from "@/lib/push/notify-visitor"
import { r2CopyObject, r2PresignGetUrl } from "@/lib/storage/r2"
import { ipKeywordFlags } from "@/lib/admin/ip-flags"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { randomUUID } from "crypto"

export type CommunityUploadStatus = "pending" | "approved" | "rejected"

export type CommunityRightsBasis = "own_work" | "licensed"

export type CommunityLicenseType =
  | "creative_commons"
  | "free_stock_license"
  | "written_permission"
  | "purchased_license"
  | "other"

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
  /** Null for submissions made before the declaration existed (2026-10-02). */
  rightsBasis: CommunityRightsBasis | null
  rightsHolder: string | null
  sourceUrl: string | null
  licenseType: CommunityLicenseType | null
  rightsEvidenceUrl: string | null
  rightsAttestedAt: string | null
  rightsAttestationVersion: string | null
  authorOriginConfirmed: boolean
  infoRequestedAt: string | null
  /** Keyword hits in the title (franchises, brands, real people). Not a finding. */
  ipFlags: string[]
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
  rights_basis: CommunityRightsBasis | null
  rights_holder: string | null
  source_url: string | null
  license_type: CommunityLicenseType | null
  rights_evidence_url: string | null
  rights_attested_at: string | null
  rights_attestation_version: string | null
  author_origin_confirmed: boolean | null
  info_requested_at: string | null
}

const UPLOAD_SELECT_COLUMNS =
  "id,submitter_id,title,category,author_name,video_key,thumb_key,resolution,duration_seconds,file_size_bytes,status,review_notes,approved_wallpaper_id,created_at,updated_at,rights_basis,rights_holder,source_url,license_type,rights_evidence_url,rights_attested_at,rights_attestation_version,author_origin_confirmed,info_requested_at"

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
    rightsBasis: row.rights_basis,
    rightsHolder: row.rights_holder,
    sourceUrl: row.source_url,
    licenseType: row.license_type,
    rightsEvidenceUrl: row.rights_evidence_url,
    rightsAttestedAt: row.rights_attested_at,
    rightsAttestationVersion: row.rights_attestation_version,
    authorOriginConfirmed: row.author_origin_confirmed === true,
    infoRequestedAt: row.info_requested_at,
    ipFlags: ipKeywordFlags(`${row.title} ${row.author_name ?? ""}`),
  }
}

export async function listCommunityUploads(
  status?: CommunityUploadStatus | "all"
): Promise<AdminCommunityUpload[]> {
  const supabase = getSupabaseAdmin()
  let query = supabase
    .from("community_uploads")
    .select(UPLOAD_SELECT_COLUMNS)
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
    .select(UPLOAD_SELECT_COLUMNS)
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
    wallpaperId?.trim() || upload.approvedWallpaperId?.trim() || randomUUID()

  if (upload.status !== "pending") throw new Error("upload_not_pending")
  if (!upload.rightsAttestedAt) throw new Error("rights_declaration_missing")

  const { videoKey, thumbKey } = canonicalCommunityCatalogKeys(
    wallpaperID,
    upload.videoKey
  )

  await Promise.all([
    r2CopyObject(upload.videoKey, videoKey),
    r2CopyObject(upload.thumbKey, thumbKey),
  ])

  // One transaction in the database: re-checks the rights declaration and
  // pending status, publishes the wallpaper with its attribution and
  // provenance, marks the upload approved and writes the moderation log.
  const supabase = getSupabaseAdmin()
  const { error: approveError } = await supabase.rpc(
    "approve_and_publish_community_upload",
    {
      p_upload_id: uploadId,
      p_wallpaper_id: wallpaperID,
      p_video_key: videoKey,
      p_thumb_key: thumbKey,
      p_review_notes: trimmedNotes,
      p_actor: "admin",
    }
  )
  if (approveError) {
    throw new Error(approveError.message)
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

function canonicalCommunityCatalogKeys(
  wallpaperId: string,
  sourceVideoKey: string
) {
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

export async function requestCommunityUploadInfo(
  uploadId: string,
  message: string
) {
  const upload = await getCommunityUpload(uploadId)
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.rpc("request_community_upload_info", {
    p_upload_id: uploadId,
    p_message: message,
    p_actor: "admin",
  })
  if (error) throw new Error(error.message)
  return { result: data, upload }
}

export async function blockCommunitySubmitter(
  uploadId: string,
  reason: string
) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.rpc("block_community_submitter", {
    p_upload_id: uploadId,
    p_reason: reason,
    p_actor: "admin",
  })
  if (error) throw new Error(error.message)
  return data
}

export type ModerationEvent = {
  id: number
  action: string
  actor: string
  notes: string | null
  createdAt: string
}

export async function listModerationEvents(
  uploadId: string
): Promise<ModerationEvent[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("community_upload_moderation_events")
    .select("id,action,actor,notes,created_at")
    .eq("upload_id", uploadId)
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => ({
    id: row.id as number,
    action: row.action as string,
    actor: row.actor as string,
    notes: (row.notes as string | null) ?? null,
    createdAt: row.created_at as string,
  }))
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
