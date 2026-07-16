type HitCounter = {
  count: number
  resetAt: number
}

export type RateLimitResult = {
  limited: boolean
  retryAfterSeconds: number
}

export function clientIpFromRequest(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  )
}

export function createInMemoryRateLimiter(options: {
  max: number
  windowMs: number
  maxKeys?: number
}) {
  const hits = new Map<string, HitCounter>()
  const maxKeys = options.maxKeys ?? 5000

  function pruneExpired(now: number) {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key)
    }
  }

  return function checkRateLimit(key: string): RateLimitResult {
    const now = Date.now()
    if (hits.size > maxKeys) pruneExpired(now)
    if (hits.size > maxKeys) hits.clear()

    const entry = hits.get(key)
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + options.windowMs })
      return { limited: false, retryAfterSeconds: 0 }
    }

    entry.count += 1
    return {
      limited: entry.count > options.max,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    }
  }
}
