import "server-only"

import { unstable_cache } from "next/cache"
import {
  MARKETING_CATALOG_REVALIDATE_SECONDS,
  PUBLIC_CATALOG_CACHE_TAG,
} from "@/lib/marketing-cache"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

type ApprovedUpload = {
  wallpaperId: string
  authorName: string | null
  createdAt: string
}

/**
 * Approved community submissions. `community_uploads` is not readable with the
 * anon key, so this runs server-side with the service role and only selects the
 * three columns the credit needs.
 */
async function fetchApprovedUploadsUncached(): Promise<ApprovedUpload[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("community_uploads")
    .select("approved_wallpaper_id,author_name,created_at")
    .eq("status", "approved")
    .not("approved_wallpaper_id", "is", null)

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => ({
    wallpaperId: row.approved_wallpaper_id as string,
    authorName: (row.author_name as string | null)?.trim() || null,
    createdAt: row.created_at as string,
  }))
}

const getCachedApprovedUploads = unstable_cache(
  fetchApprovedUploadsUncached,
  ["public-wallpaper-approved-uploads-v1"],
  {
    revalidate: MARKETING_CATALOG_REVALIDATE_SECONDS,
    tags: [PUBLIC_CATALOG_CACHE_TAG],
  }
)

/**
 * Credit name the uploader typed on the submission that created this
 * wallpaper, or null. Only the earliest approved submission made before the
 * catalog row existed counts: duplicates merged in later are not the origin,
 * and admin-added wallpapers have no submission at all, so they get no credit.
 */
export async function getWallpaperUploaderCredit(wallpaper: {
  id: string
  createdAt: string
}): Promise<string | null> {
  let uploads: ApprovedUpload[]
  try {
    uploads = await getCachedApprovedUploads()
  } catch (error) {
    console.error(
      "[catalog] uploader credit lookup failed:",
      error instanceof Error ? error.message : error
    )
    return null
  }

  const createdAt = Date.parse(wallpaper.createdAt)
  const origin = uploads
    .filter(
      (upload) =>
        upload.wallpaperId === wallpaper.id &&
        Date.parse(upload.createdAt) <= createdAt
    )
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))[0]

  return origin?.authorName ?? null
}
