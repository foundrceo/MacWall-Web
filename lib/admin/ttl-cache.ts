import "server-only"

type CacheEntry<T> = {
  expiresAt: number
  value: T
}

const store = new Map<string, CacheEntry<unknown>>()

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
