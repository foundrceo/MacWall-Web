import createKvDataCacheAdapter from "@vinext/cloudflare/cache/kv-data-adapter.runtime"

type AdapterArgs = Parameters<typeof createKvDataCacheAdapter>[0]

const DEFAULT_BINDING = "VINEXT_KV_CACHE"

/**
 * vinext's KV data cache, except a failed write is a cache miss, not an error.
 * vinext awaits the KV put inside `unstable_cache`, so a rejected write (the
 * free plan's daily write cap, a KV outage) would fail the page or API that
 * just fetched its data fine. Reads are untouched.
 */
export default function createSafeKvDataCacheAdapter({ env, options }: AdapterArgs) {
  const binding = options?.binding ?? DEFAULT_BINDING
  const kv = (env as Record<string, unknown> | undefined)?.[binding] as
    | Record<string, unknown>
    | undefined
  if (!kv) return createKvDataCacheAdapter({ env, options })

  const swallow = (operation: string) => (error: unknown) => {
    console.warn(`kv data cache ${operation} skipped:`, error instanceof Error ? error.message : error)
  }
  const safeKv = new Proxy(kv, {
    get(target, property) {
      const value = Reflect.get(target, property, target)
      if (typeof value !== "function") return value
      if (property === "put" || property === "delete") {
        return (...args: unknown[]) =>
          (value as (...a: unknown[]) => Promise<void>)
            .apply(target, args)
            .catch(swallow(property))
      }
      return value.bind(target)
    },
  })

  return createKvDataCacheAdapter({ env: { ...env, [binding]: safeKv }, options })
}
