/**
 * TikTok pixel codes are uppercase alphanumeric (e.g. `D8LBEKRC77UAI2I7M6N0`).
 * Reject anything else before interpolating into scripts.
 */
function isSafeTikTokPixelId(value: string): boolean {
  return /^[A-Z0-9]{10,40}$/.test(value)
}

export function resolveTikTokPixelId(): string | undefined {
  const server = process.env.TIKTOK_PIXEL_ID?.trim().toUpperCase()
  if (server && isSafeTikTokPixelId(server)) return server

  const raw = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim().toUpperCase()
  if (raw && isSafeTikTokPixelId(raw)) return raw
  return undefined
}
