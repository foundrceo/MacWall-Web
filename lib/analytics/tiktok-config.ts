/** TikTok pixel IDs are numeric; reject anything else before interpolating into scripts. */
function isSafeTikTokPixelId(value: string): boolean {
  return /^[0-9]{5,30}$/.test(value)
}

export function resolveTikTokPixelId(): string | undefined {
  const server = process.env.TIKTOK_PIXEL_ID?.trim()
  if (server && isSafeTikTokPixelId(server)) return server

  const raw = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim()
  if (raw && isSafeTikTokPixelId(raw)) return raw
  return undefined
}

export function resolveTikTokEventsApiAccessToken(): string | undefined {
  const token = process.env.TIKTOK_EVENTS_API_ACCESS_TOKEN?.trim()
  return token && token.length > 0 ? token : undefined
}

export function resolveTikTokTestEventCode(): string | undefined {
  const code = process.env.TIKTOK_EVENTS_API_TEST_EVENT_CODE?.trim()
  return code && code.length > 0 ? code : undefined
}
