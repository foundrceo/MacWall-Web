import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2.105.4"

import { buildLifecycleEmail, type LifecycleEmailId } from "../_shared/lifecycle-emails.ts"
import {
  logoUrl,
  marketingBlockReason,
  postalAddress,
  sendMarketingEmail,
  siteBaseUrl,
  supportEmail,
  unsubscribeUrlsFor,
} from "../_shared/lifecycle-send.ts"

/**
 * "Email me the link" from a phone or Windows PC, where the DMG can't open.
 *
 *   now     the download link
 *   +24 h   one reminder (Resend scheduled send), skipped for buyers
 *
 * Called by the website's /api/send-to-mac route (rate limited there) with
 * the x-cron-secret header.
 *
 * The visitor just asked for this link, so an earlier unsubscribe only skips
 * the reminder. Addresses that can't receive mail get `sent: false` with the
 * reason, so the form can say so instead of claiming it was sent.
 */

const REMINDER_DELAY_MS = 24 * 60 * 60 * 1000

type Body = { email?: unknown; wallpaperName?: unknown; wallpaperPath?: unknown }

function cleanWallpaperPath(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  return /^\/wallpaper\/[a-z0-9-]+\/[a-z0-9-]+$/i.test(raw) && raw.length <= 200 ? raw : null
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 })

  const cronSecret = Deno.env.get("CRON_SECRET")?.trim()
  if (!cronSecret || req.headers.get("x-cron-secret")?.trim() !== cronSecret) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const resendKey = Deno.env.get("RESEND_API_KEY")?.trim()
  const from = Deno.env.get("LICENSE_EMAIL_FROM")?.trim()
  const appName = Deno.env.get("APP_NAME")?.trim() || "MacWall"
  if (!supabaseUrl || !supabaseServiceKey || !resendKey || !from) {
    return Response.json({ ok: false, error: "missing_config" }, { status: 500 })
  }

  const body = (await req.json().catch(() => ({}))) as Body
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  if (!email || email.length > 254) {
    return Response.json({ ok: false, error: "invalid_email" }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const block = await marketingBlockReason(supabase, email)
  let skipReminder = block === "converted"
  if (block === "invalid_address" || block === "no_mail_domain") {
    return Response.json({ ok: true, sent: false, reason: "undeliverable" })
  }
  if (block === "suppressed") {
    const { data: row } = await supabase
      .from("macwall_email_suppressions")
      .select("reason")
      .eq("email", email)
      .maybeSingle()
    const reason = (row as { reason?: string } | null)?.reason
    if (reason === "invalid_address" || reason === "no_mail_domain") {
      return Response.json({ ok: true, sent: false, reason: "undeliverable" })
    }
    // Unsubscribed earlier: send the link they just asked for, nothing more.
    skipReminder = true
  }

  const site = siteBaseUrl()
  const wallpaperPath = cleanWallpaperPath(body.wallpaperPath)
  const wallpaperName =
    typeof body.wallpaperName === "string" ? body.wallpaperName.trim().slice(0, 80) : ""
  const unsubscribe = await unsubscribeUrlsFor(email)

  const send = (id: LifecycleEmailId, idempotencyKey: string, scheduledAt?: string) => {
    const mail = buildLifecycleEmail(id, {
      appName,
      siteUrl: site,
      logoUrl: logoUrl(),
      supportEmail: supportEmail(),
      checkoutHref: `${site}/download/latest?utm_source=email&utm_medium=send_to_mac&utm_campaign=${id}`,
      unsubscribeHref: unsubscribe?.page ?? null,
      postalAddress: postalAddress(),
      wallpaper:
        wallpaperPath && wallpaperName
          ? { name: wallpaperName, href: `${site}${wallpaperPath}` }
          : null,
    })
    return sendMarketingEmail({
      resendKey,
      from,
      to: email,
      mail,
      unsubscribeOneClick: unsubscribe?.oneClick ?? null,
      idempotencyKey,
      tags: [{ name: "campaign", value: id }],
      scheduledAt,
    })
  }

  // Every request sends the link (the website rate limits per address).
  const first = await send("send_to_mac", `send_to_mac:${email}:${crypto.randomUUID()}`)
  if (!first.ok) {
    return Response.json({ ok: false, error: "send_failed" }, { status: 502 })
  }

  let reminderScheduled = false
  if (!skipReminder) {
    const at = new Date(Date.now() + REMINDER_DELAY_MS).toISOString()
    // At most one reminder per address per day, however often they ask.
    const day = new Date().toISOString().slice(0, 10)
    reminderScheduled = (await send("send_to_mac_reminder", `send_to_mac_reminder:${email}:${day}`, at)).ok
  }

  return Response.json({ ok: true, sent: true, reminderScheduled })
})
