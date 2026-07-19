const KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function randomSegment(length = 4): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ""
  for (let i = 0; i < length; i++) {
    out += KEY_ALPHABET[bytes[i]! % KEY_ALPHABET.length]
  }
  return out
}

/** MacWall-issued license key for Stripe purchases (`MW-XXXX-XXXX-XXXX`). */
export function generateMacWallLicenseKey(): string {
  return `MW-${randomSegment()}-${randomSegment()}-${randomSegment()}`
}

export function normalizeLicenseKey(raw: string): string {
  return raw.replace(/\s+/g, "").trim()
}
