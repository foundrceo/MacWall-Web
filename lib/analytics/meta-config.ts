/** Meta Pixel IDs are public. CAPI tokens stay server-only in `meta-server.ts`. */
function isSafeMetaPixelId(value: string): boolean {
  return /^[0-9]{5,30}$/.test(value)
}

/** Resolve from env only — never bake IDs into the open-source tree. */
export function resolveMetaPixelId(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim()
  if (raw && isSafeMetaPixelId(raw)) return raw
  return undefined
}
