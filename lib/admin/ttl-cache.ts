import "server-only"

type CacheEntry<T> = {
  expiresAt: number
  value: T
}

const store = new Map<string, CacheEntry<unknown>>()
/** Bound the per-instance map — admin polls fan out many keys while warm. */
const MAX_KEYS = 500

function evictOldest(): void {
  const oldest = store.keys().next()
  if (!oldest.done) store.delete(oldest.value)
}

export function readTtlCache<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() >= entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry.value as T
}

export function writeTtlCache<T>(key: string, value: T, ttlMs: number): T {
  if (!store.has(key) && store.size >= MAX_KEYS) {
    // Sweep expired entries first so live keys aren't evicted by dead ones.
    const now = Date.now()
    for (const [k, entry] of store) {
      if (now >= entry.expiresAt) store.delete(k)
      if (store.size < MAX_KEYS) break
    }
    if (store.size >= MAX_KEYS) evictOldest()
  }
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
  return value
}

export async function withTtlCache<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>
): Promise<T> {
  const cached = readTtlCache<T>(key)
  if (cached !== null) return cached
  const value = await load()
  return writeTtlCache(key, value, ttlMs)
}
