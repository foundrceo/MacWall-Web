import "server-only"

export function resolveMetaCapiAccessToken(): string | undefined {
  const token = process.env.META_CAPI_ACCESS_TOKEN?.trim()
  return token && token.length > 0 ? token : undefined
}

export function resolveMetaCapiTestEventCode(): string | undefined {
  const code = process.env.META_CAPI_TEST_EVENT_CODE?.trim()
  return code && code.length > 0 ? code : undefined
}
