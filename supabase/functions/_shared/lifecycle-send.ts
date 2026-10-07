import type { createClient } from "npm:@supabase/supabase-js@2.105.4"

import {
  emailLooksDeliverable,
  type LifecycleEmail,
} from "./lifecycle-emails.ts"

type Supabase = ReturnType<typeof createClient>

/** Minimum gap between two marketing emails to the same address. */
export const MARKETING_MIN_GAP_MS = 20 * 60 * 60 * 1000

export function siteBaseUrl(): string {
  return (
    Deno.env.get("LICENSE_EMAIL_SITE_URL")?.trim() || "https://macwall.app"
  ).replace(/\/+$/, "")
}

export function supportEmail(): string {
  return Deno.env.get("LICENSE_EMAIL_SUPPORT")?.trim() || "support@macwall.app"
}

export function logoUrl(): string {
  return (
    Deno.env.get("LICENSE_EMAIL_LOGO_URL")?.trim() ||
    `${siteBaseUrl()}/email/macwall-icon.png`
  )
}

export function postalAddress(): string | null {
  return Deno.env.get("EMAIL_POSTAL_ADDRESS")?.trim() || null
}

const textEncoder = new TextEncoder()

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

/** Same token format as lib/email/trial-unsubscribe.ts (HMAC with CRON_SECRET). */
async function signUnsubscribeToken(email: string, secret: string): Promise<string> {
  const normalized = email.trim().toLowerCase()
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const payload = bytesToBase64Url(textEncoder.encode(normalized))
  const sig = await crypto.subtle.sign("HMAC", key, textEncoder.encode(normalized))
  return `${payload}.${bytesToBase64Url(new Uint8Array(sig))}`
}

export async function unsubscribeUrlsFor(
  email: string
): Promise<{ page: string; oneClick: string } | null> {
  const secret = Deno.env.get("CRON_SECRET")?.trim()
  if (!secret) return null
  const token = encodeURIComponent(await signUnsubscribeToken(email, secret))
  return {
    page: `${siteBaseUrl()}/unsubscribe/trial?t=${token}`,
    oneClick: `${siteBaseUrl()}/api/unsubscribe/trial?t=${token}`,
  }
}

const domainCache = new Map<string, boolean>()

/** False only when DNS says the domain has no mail or address records. */
async function domainAcceptsMail(domain: string): Promise<boolean> {
  const cached = domainCache.get(domain)
  if (cached !== undefined) return cached
  let accepts = true
  try {
    const mx = await Deno.resolveDns(domain, "MX")
    accepts = mx.length > 0
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      try {
        const a = await Deno.resolveDns(domain, "A")
        accepts = a.length > 0
      } catch (inner) {
        accepts = !(inner instanceof Deno.errors.NotFound)
      }
    }
    // Any other error (DNS unavailable in this runtime): don't block.
  }
  domainCache.set(domain, accepts)
  return accepts
}

async function suppress(supabase: Supabase, email: string, reason: string) {
  await supabase
    .from("macwall_email_suppressions")
    .upsert({ email, reason }, { onConflict: "email", ignoreDuplicates: true })
}

/**
 * Why this address must not get marketing mail right now, or null when it
 * can. Bad addresses are added to the suppression list so they are skipped
 * for good (keeps the bounce rate down).
 */
export async function marketingBlockReason(
  supabase: Supabase,
  email: string
): Promise<string | null> {
  const normalized = email.trim().toLowerCase()
  if (!emailLooksDeliverable(normalized)) {
    await suppress(supabase, normalized, "invalid_address")
    return "invalid_address"
  }

  const { data: converted } = await supabase.rpc("macwall_email_converted", {
    p_email: normalized,
  })
  if (converted === true) return "converted"

  const { data: suppressed } = await supabase.rpc("macwall_email_suppressed", {
    p_email: normalized,
  })
  if (suppressed === true) return "suppressed"

  const domain = normalized.split("@")[1] ?? ""
  if (!(await domainAcceptsMail(domain))) {
    await suppress(supabase, normalized, "no_mail_domain")
    return "no_mail_domain"
  }
  return null
}

/** When the frequency cap allows the next marketing email (null = now). */
export async function nextAllowedSendAt(
  supabase: Supabase,
  email: string
): Promise<Date | null> {
  const { data } = await supabase.rpc("macwall_marketing_last_sent_at", {
    p_email: email.trim().toLowerCase(),
  })
  if (typeof data !== "string") return null
  const allowedAt = Date.parse(data) + MARKETING_MIN_GAP_MS
  return allowedAt > Date.now() ? new Date(allowedAt) : null
}

export type SendResult =
  | { ok: true; id: string | null }
  | { ok: false; rateLimited: boolean }

export async function sendMarketingEmail(args: {
  resendKey: string
  from: string
  to: string
  mail: LifecycleEmail
  unsubscribeOneClick: string | null
  idempotencyKey: string
  tags: { name: string; value: string }[]
  /** Resend delivers it later (ISO 8601); omit to send now. */
  scheduledAt?: string
}): Promise<SendResult> {
  const headers: Record<string, string> = {}
  if (args.unsubscribeOneClick) {
    headers["List-Unsubscribe"] = `<${args.unsubscribeOneClick}>, <mailto:${supportEmail()}?subject=unsubscribe>`
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.resendKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": args.idempotencyKey,
        "User-Agent": "MacWall/1.0",
      },
      body: JSON.stringify({
        from: args.from,
        to: [args.to],
        reply_to: supportEmail(),
        subject: args.mail.subject,
        html: args.mail.html,
        text: args.mail.text,
        headers,
        tags: args.tags,
        ...(args.scheduledAt ? { scheduled_at: args.scheduledAt } : {}),
      }),
    })
    if (!res.ok) {
      console.error("[lifecycle-send] resend_failed", res.status)
      return { ok: false, rateLimited: res.status === 429 }
    }
    const body = (await res.json().catch(() => null)) as { id?: string } | null
    return { ok: true, id: body?.id ?? null }
  } catch (error) {
    console.error(
      "[lifecycle-send] resend_exception",
      error instanceof Error ? error.message : "error"
    )
    return { ok: false, rateLimited: false }
  }
}

/** Checkout link used by every marketing email (GET = a real click). */
export function lifecycleCheckoutHref(args: {
  offerSlug?: string | null
  promoCode?: string | null
  untilUnix?: number | null
  email: string
  visitorId?: string | null
  medium: "trial" | "recovery"
  campaign: string
}): string {
  const params = new URLSearchParams()
  params.set("offer", args.offerSlug?.trim() || "permanent")
  if (args.promoCode) params.set("promo", args.promoCode)
  if (args.untilUnix && args.untilUnix > 0) params.set("until", String(args.untilUnix))
  params.set("email", args.email.trim().toLowerCase())
  if (args.visitorId?.trim()) params.set("visitor_id", args.visitorId.trim())
  params.set("utm_source", "email")
  params.set("utm_medium", args.medium)
  params.set("utm_campaign", args.campaign)
  return `${siteBaseUrl()}/api/checkout/create-session?${params.toString()}`
}
