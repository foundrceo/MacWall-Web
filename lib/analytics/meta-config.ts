/** Meta Pixel / Dataset IDs are numeric; reject anything else before script inject. */
function isSafeMetaPixelId(value: string): boolean {
  return /^[0-9]{5,30}$/.test(value)
}

/** Resolve from env only — never bake IDs into the open-source tree. */
export function resolveMetaPixelId(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim()
  if (raw && isSafeMetaPixelId(raw)) return raw
  return undefined
}

export function resolveMetaCapiAccessToken(): string | undefined {
  const token = process.env.META_CAPI_ACCESS_TOKEN?.trim()
  return token && token.length > 0 ? token : undefined
}

export function resolveMetaCapiTestEventCode(): string | undefined {
  const code = process.env.META_CAPI_TEST_EVENT_CODE?.trim()
  return code && code.length > 0 ? code : undefined
}
