export const ADMIN_SESSION_COOKIE = "macwall_admin_session" as const

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
const textEncoder = new TextEncoder()

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim()
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set (min 32 characters) for admin auth."
    )
  }
  return secret
}

function randomNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  )
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/")
  const padLength = (4 - (padded.length % 4)) % 4
  const base64 = padded + "=".repeat(padLength)
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function importHmacKey() {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
}

async function signPayload(payloadB64: string): Promise<string> {
  const key = await importHmacKey()
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(payloadB64)
  )
  return bytesToBase64Url(new Uint8Array(signature))
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

export async function createAdminSessionToken(): Promise<string> {
  const payload = JSON.stringify({
    exp: Date.now() + SESSION_TTL_MS,
    nonce: randomNonce(),
  })
  const payloadB64 = bytesToBase64Url(textEncoder.encode(payload))
  return `${payloadB64}.${await signPayload(payloadB64)}`
}

export async function verifyAdminSessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false

  const [payloadB64, signature] = token.split(".")
  if (!payloadB64 || !signature) return false

  try {
    const expected = await signPayload(payloadB64)
    if (!timingSafeEqualString(signature, expected)) return false

    const payloadJson = new TextDecoder().decode(base64UrlToBytes(payloadB64))
    const payload = JSON.parse(payloadJson) as { exp?: number }
    return typeof payload.exp === "number" && payload.exp > Date.now()
  } catch {
    return false
  }
}

export function adminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  }
}
