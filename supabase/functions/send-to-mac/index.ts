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
 * the x-cron-secret header. Suppressed or undeliverable addresses get nothing.
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
  // A buyer asking for the link still gets it, just not the reminder.
  if (block && block !== "converted") {
    return Response.json({ ok: true, sent: false, reason: block })
  }

  const site = siteBaseUrl()
  const wallpaperPath = cleanWallpaperPath(body.wallpaperPath)
  const wallpaperName =
    typeof body.wallpaperName === "string" ? body.wallpaperName.trim().slice(0, 80) : ""
  const unsubscribe = await unsubscribeUrlsFor(email)

  const send = (id: LifecycleEmailId, scheduledAt?: string) => {
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
      // One of each per address per day, even if the form is resubmitted.
      idempotencyKey: `${id}:${email}:${new Date().toISOString().slice(0, 10)}`,
      tags: [{ name: "campaign", value: id }],
      scheduledAt,
    })
  }

  const first = await send("send_to_mac")
  if (!first.ok) {
    return Response.json({ ok: false, error: "send_failed" }, { status: 502 })
  }

  let reminderScheduled = false
  if (block !== "converted") {
    const at = new Date(Date.now() + REMINDER_DELAY_MS).toISOString()
    reminderScheduled = (await send("send_to_mac_reminder", at)).ok
  }

  return Response.json({ ok: true, sent: true, reminderScheduled })
})
