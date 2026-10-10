import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.105.4"

// No generated schema types for this project.
type Db = SupabaseClient

type VerifyBody = {
  action?: string
  license_key?: string
  hwid?: string
  nonce?: string
  client_started_at?: number
}

type LicenseRow = {
  license_key: string
  source: string
  status: string
  customer_email: string | null
  whop_membership_id: string | null
  stripe_checkout_session_id: string | null
  id: string
  plan_slug?: string | null
  max_devices?: number | null
  trial_ends_at?: string | null
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  })
}

function normalizeLicenseKey(raw: string): string {
  const stripped = raw.replace(/\s+/g, "").trim()
  if (stripped.toUpperCase().startsWith("MW-")) {
    return stripped.toUpperCase()
  }
  return stripped
}

function defaultMaxDevices(): number {
  const parsed = Number.parseInt(
    Deno.env.get("MACWALL_LICENSE_MAX_DEVICES") ?? "3",
    10
  )
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3
}

function resolveMaxDevices(license?: LicenseRow | null): number {
  const fromRow = license?.max_devices
  if (typeof fromRow === "number" && fromRow > 0) return fromRow
  if (license?.plan_slug === "pro_plus" || license?.plan_slug === "pro_max") {
    return 5
  }
  return defaultMaxDevices()
}

function deviceLimitMessage(maxDevices: number): string {
  if (maxDevices >= 5) {
    return `This license is already active on ${maxDevices} Macs. On a Mac you no longer use, open MacWall Settings → License → Unlink This Mac, then try again.`
  }
  return `This license is already active on ${maxDevices} Macs. On a Mac you no longer use, open MacWall Settings → License → Unlink This Mac, or buy Pro Plus at macwall.app/pricing for up to 5 Macs.`
}

function trialEndsAtIso(license: LicenseRow): string | null {
  return typeof license.trial_ends_at === "string" && license.trial_ends_at
    ? license.trial_ends_at
    : null
}

function trialStillOpen(license: LicenseRow): boolean {
  const endsAt = trialEndsAtIso(license)
  return (
    license.status === "trial" && !!endsAt && Date.parse(endsAt) > Date.now()
  )
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// --- Signed receipts -------------------------------------------------------
// The app only trusts `ok: true` when it carries a receipt signed with this
// Ed25519 key (public half: MacWallEntitlement.signingPublicKeyBase64). A proxy
// that rewrites the JSON cannot sign it. Field names/types must match
// MacWallShared/Sources/MacWallShared/MacWallEntitlement.swift.

type ReceiptPayload = {
  v: 1
  kind: "pro" | "trial"
  hwid: string
  key: string | null
  nonce: string | null
  iat: number
  exp: number | null
}

type SignedReceipt = { receipt: string; sig: string }

// PKCS#8 wrapper for a raw 32-byte Ed25519 seed (RFC 8410).
const ED25519_PKCS8_PREFIX = new Uint8Array([
  0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04,
  0x22, 0x04, 0x20,
])

let signingKeyPromise: Promise<CryptoKey | null> | null = null

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i)
  return out
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ""
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function loadSigningKey(): Promise<CryptoKey | null> {
  if (!signingKeyPromise) {
    signingKeyPromise = (async () => {
      const seedB64 = Deno.env.get("MACWALL_LICENSE_SIGNING_KEY")?.trim()
      if (!seedB64) {
        console.error("[macwall-license-verify] signing_key_missing")
        return null
      }
      try {
        const seed = base64ToBytes(seedB64)
        if (seed.length !== 32) throw new Error(`seed length ${seed.length}`)
        const pkcs8 = new Uint8Array(ED25519_PKCS8_PREFIX.length + 32)
        pkcs8.set(ED25519_PKCS8_PREFIX)
        pkcs8.set(seed, ED25519_PKCS8_PREFIX.length)
        return await crypto.subtle.importKey(
          "pkcs8",
          pkcs8,
          { name: "Ed25519" },
          false,
          ["sign"]
        )
      } catch (error) {
        console.error("[macwall-license-verify] signing_key_invalid", String(error))
        return null
      }
    })()
  }
  return signingKeyPromise
}

async function signReceipt(payload: ReceiptPayload): Promise<SignedReceipt | null> {
  const key = await loadSigningKey()
  if (!key) return null
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "Ed25519" }, key, bytes))
  return { receipt: bytesToBase64(bytes), sig: bytesToBase64(sig) }
}

function sanitizeNonce(raw: unknown): string | null {
  return typeof raw === "string" && /^[0-9a-f]{16,64}$/.test(raw) ? raw : null
}

function unixSeconds(date: Date | number): number {
  const ms = typeof date === "number" ? date : date.getTime()
  return Math.floor(ms / 1000)
}

async function activateDevice(args: {
  supabase: Db
  licenseKey: string
  hwid: string
  membershipId: string
  maxDevices: number
  nonce: string | null
  trialEndsAt: string | null
  extra?: Record<string, unknown>
}): Promise<Response> {
  const licenseKeyHash = await sha256Hex(args.licenseKey.toUpperCase())
  const hwidHash = await sha256Hex(args.hwid)

  const { data, error } = await args.supabase.rpc(
    "macwall_activate_license_device",
    {
      p_license_key_hash: licenseKeyHash,
      p_membership_id: args.membershipId,
      p_hwid_hash: hwidHash,
      p_max_devices: args.maxDevices,
    }
  )

  if (error) {
    console.error("[macwall-license-verify] device_rpc_failed", error.message)
    return json({ ok: false, error: "device_link_failed" }, 500)
  }

  const result = data as {
    ok?: boolean
    code?: string
    device_count?: number
    max_devices?: number
  }

  const maxDevices = result.max_devices ?? args.maxDevices

  if (!result.ok && result.code === "device_limit_reached") {
    return json(
      {
        ok: false,
        error: "device_limit_reached",
        message: deviceLimitMessage(maxDevices),
        device_count: result.device_count,
        max_devices: maxDevices,
      },
      403
    )
  }

  const signed = await signReceipt({
    v: 1,
    kind: args.trialEndsAt ? "trial" : "pro",
    hwid: hwidHash,
    key: licenseKeyHash,
    nonce: args.nonce,
    iat: unixSeconds(Date.now()),
    exp: args.trialEndsAt ? unixSeconds(Date.parse(args.trialEndsAt)) : null,
  })

  return json({
    ok: true,
    device_count: result.device_count,
    max_devices: maxDevices,
    ...(args.extra ?? {}),
    ...(signed ?? {}),
  })
}

async function verifyLicense(args: {
  supabase: Db
  licenseKey: string
  hwid: string
  nonce: string | null
  license: LicenseRow
}): Promise<Response> {
  const endsAt = trialEndsAtIso(args.license)

  if (
    args.license.status === "past_due" ||
    (args.license.status === "trial" && !trialStillOpen(args.license))
  ) {
    return json(
      {
        ok: false,
        error: "payment_required",
        status: args.license.status,
        trial_ends_at: endsAt,
        message: "Complete payment to keep MacWall Pro unlocked.",
      },
      402
    )
  }

  if (args.license.status === "pending") {
    return json(
      {
        ok: false,
        error: "invalid_key",
        message:
          "Payment is still processing. Wait a minute and try again.",
      },
      400
    )
  }

  if (args.license.status === "expired") {
    return json(
      {
        ok: false,
        error: "subscription_expired",
        message:
          "Your annual plan has expired. Renew at macwall.app/pricing to keep using Pro.",
      },
      402
    )
  }

  if (args.license.status !== "active" && !trialStillOpen(args.license)) {
    return json(
      {
        ok: false,
        error: "invalid_key",
        message: "This license is not active.",
      },
      404
    )
  }

  const membershipId =
    args.license.whop_membership_id ??
    args.license.stripe_checkout_session_id ??
    `macwall:${args.license.id}`

  return activateDevice({
    supabase: args.supabase,
    licenseKey: args.licenseKey,
    hwid: args.hwid,
    membershipId,
    maxDevices: resolveMaxDevices(args.license),
    nonce: args.nonce,
    trialEndsAt: trialStillOpen(args.license) ? endsAt : null,
    extra: trialStillOpen(args.license)
      ? { status: "trial", trial_ends_at: endsAt }
      : { status: "active" },
  })
}

// --- Per-Mac free trial -----------------------------------------------------
// One 24 h trial per Mac (hash of IOPlatformUUID). Deleting the app's settings or
// reinstalling no longer starts a new trial: the first start is kept here.

const TRIAL_SECONDS = 24 * 60 * 60
const MAX_CLIENT_BACKDATE_SECONDS = 30 * 24 * 60 * 60

async function startDeviceTrial(args: {
  supabase: Db
  hwid: string
  nonce: string | null
  clientStartedAt: unknown
}): Promise<Response> {
  const hwidHash = await sha256Hex(args.hwid)
  const now = unixSeconds(Date.now())

  // Upgrading 4.0.5 installs report their existing local start so an old trial
  // stays ended. Never later than now, never more than 30 days back.
  let startedAt = now
  if (typeof args.clientStartedAt === "number" && Number.isFinite(args.clientStartedAt)) {
    startedAt = Math.min(
      now,
      Math.max(now - MAX_CLIENT_BACKDATE_SECONDS, Math.floor(args.clientStartedAt))
    )
  }

  const { error: insertError } = await args.supabase
    .from("macwall_device_trials")
    .upsert(
      {
        hwid_hash: hwidHash,
        started_at: new Date(startedAt * 1000).toISOString(),
        ends_at: new Date((startedAt + TRIAL_SECONDS) * 1000).toISOString(),
      },
      { onConflict: "hwid_hash", ignoreDuplicates: true }
    )
  if (insertError) {
    console.error("[macwall-license-verify] trial_insert_failed", insertError.message)
    return json({ ok: false, error: "trial_lookup_failed" }, 503)
  }

  const { data: row, error: lookupError } = await args.supabase
    .from("macwall_device_trials")
    .select("started_at, ends_at")
    .eq("hwid_hash", hwidHash)
    .maybeSingle()
  if (lookupError || !row) {
    console.error("[macwall-license-verify] trial_lookup_failed", lookupError?.message ?? "no row")
    return json({ ok: false, error: "trial_lookup_failed" }, 503)
  }

  const endsAtIso = new Date(Date.parse(row.ends_at as string)).toISOString()
  const signed = await signReceipt({
    v: 1,
    kind: "trial",
    hwid: hwidHash,
    key: null,
    nonce: args.nonce,
    iat: now,
    exp: unixSeconds(Date.parse(endsAtIso)),
  })

  return json({
    ok: true,
    status: Date.parse(endsAtIso) > Date.now() ? "trial" : "trial_ended",
    trial_ends_at: endsAtIso,
    ...(signed ?? {}),
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return json({ ok: true }, 204)
  if (req.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405)
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (!supabaseUrl || !supabaseServiceKey) {
    return json({ ok: false, error: "server_not_configured" }, 500)
  }

  let body: VerifyBody
  try {
    body = await req.json()
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400)
  }

  const hwid = typeof body.hwid === "string" ? body.hwid.trim() : ""
  const nonce = sanitizeNonce(body.nonce)

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  if (body.action === "start_trial") {
    if (!hwid || hwid.length > 128) {
      return json({ ok: false, error: "missing_hwid" }, 400)
    }
    return startDeviceTrial({
      supabase,
      hwid,
      nonce,
      clientStartedAt: body.client_started_at,
    })
  }

  const licenseKey = normalizeLicenseKey(body.license_key ?? "")
  if (!licenseKey || !hwid) {
    return json({ ok: false, error: "missing_license_key_or_hwid" }, 400)
  }

  const { data: license, error: lookupError } = await supabase
    .from("macwall_licenses")
    .select(
      "id, license_key, source, status, customer_email, whop_membership_id, stripe_checkout_session_id, plan_slug, max_devices, trial_ends_at"
    )
    .eq("license_key", licenseKey)
    .maybeSingle()

  // A failed lookup is not "key not found": that answer revokes Pro in the app.
  if (lookupError) {
    console.error("[macwall-license-verify] license_lookup_failed", lookupError.message)
    return json({ ok: false, error: "license_lookup_failed" }, 503)
  }

  if (!license) {
    return json(
      {
        ok: false,
        error: "invalid_license",
        message: "This license key was not found.",
      },
      404
    )
  }

  return verifyLicense({
    supabase,
    licenseKey,
    hwid,
    nonce,
    license: license as LicenseRow,
  })
})
