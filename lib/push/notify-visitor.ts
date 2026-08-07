import "server-only"

import { getCatalogSupabaseOrigin } from "@/lib/env/catalog-supabase"

/**
 * Ask the Supabase `macwall-apns` edge function to deliver a remote alert.
 * APNs .p8 credentials live only in Supabase Edge secrets — never here.
 */
export async function notifyVisitorPush(input: {
  visitorId: string | null | undefined
  title: string
  body: string
  mwId: string
}): Promise<void> {
  const visitorId = input.visitorId?.trim()
  if (!visitorId) return

  const origin = getCatalogSupabaseOrigin()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!origin || !serviceRoleKey) {
    console.error("[apns] notify skipped — Supabase admin credentials missing")
    return
  }

  try {
    const res = await fetch(`${origin}/functions/v1/macwall-apns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
      body: JSON.stringify({
        action: "notify",
        visitorId: visitorId.toLowerCase(),
        title: input.title,
        body: input.body,
        mwId: input.mwId,
      }),
      cache: "no-store",
    })
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      console.error(`[apns] notify failed status=${res.status} body=${text.slice(0, 300)}`)
    }
  } catch (error) {
    console.error(
      "[apns] notify request failed:",
      error instanceof Error ? error.message : error
    )
  }
}

export async function notifySupportReply(input: {
  visitorId: string | null | undefined
  feedbackId: string
  preview: string
}): Promise<void> {
  const trimmed = input.preview.trim()
  const body =
    trimmed.length > 180
      ? `${trimmed.slice(0, 177)}…`
      : trimmed || "Open Live Support to read the full message."
  await notifyVisitorPush({
    visitorId: input.visitorId,
    title: "New reply from MacWall Support",
    body,
    mwId: `com.macwall.feedback.reply.${input.feedbackId}`,
  })
}

export async function notifyCommunityUploadReviewed(input: {
  visitorId: string | null | undefined
  uploadId: string
  title: string
  approved: boolean
  reviewNotes?: string | null
}): Promise<void> {
  const detail = input.reviewNotes?.trim()
  if (input.approved) {
    await notifyVisitorPush({
      visitorId: input.visitorId,
      title: "Wallpaper approved",
      body: detail
        ? `“${input.title}” is now in the public catalog. Note from MacWall: ${detail}`
        : `“${input.title}” is now in the public catalog.`,
      mwId: `com.macwall.community.approved.${input.uploadId}`,
    })
    return
  }
  await notifyVisitorPush({
    visitorId: input.visitorId,
    title: "Wallpaper not approved",
    body: detail
      ? `“${input.title}” wasn’t approved. Note from MacWall: ${detail}`
      : `“${input.title}” wasn’t approved this time. You can try another upload.`,
    mwId: `com.macwall.community.rejected.${input.uploadId}`,
  })
}
