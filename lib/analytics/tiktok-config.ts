/** Shipped default when env vars are unset. Set empty to disable. */
export const TIKTOK_PIXEL_ID_FALLBACK = "YOUR_TIKTOK_PIXEL_ID" as const

export function resolveTikTokPixelId(): string | undefined {
  const server = process.env.TIKTOK_PIXEL_ID?.trim()
  if (server) return server

  const raw = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID
  if (raw === undefined) return TIKTOK_PIXEL_ID_FALLBACK
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function resolveTikTokEventsApiAccessToken(): string | undefined {
  const token = process.env.TIKTOK_EVENTS_API_ACCESS_TOKEN?.trim()
  return token && token.length > 0 ? token : undefined
}

export function resolveTikTokTestEventCode(): string | undefined {
  const code = process.env.TIKTOK_EVENTS_API_TEST_EVENT_CODE?.trim()
  return code && code.length > 0 ? code : undefined
}
