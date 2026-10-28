import { getSupabaseAdmin } from "@/lib/supabase/admin"

/**
 * Live, public-safe numbers for the marketing bento: wallpaper likes over time
 * and the size of the catalog. Never purchases, revenue or customer counts.
 * Read server-side with the admin client and cached for an hour per isolate.
 */
export type PublicStats = {
  likes: number
  /** Cumulative likes at the end of each month, oldest first. */
  likesByMonth: { month: string; likes: number }[]
  /** Total size of the published catalog, in GB. */
  libraryGb: number
  /** Total running time of the published catalog, in hours. */
  libraryHours: number
  /** When these were read (ISO). */
  readAt: string
  /** Bytes Cloudflare served for macwall.app (site and cdn), or null without a token. */
  served: ServedStats | null
}

export type ServedStats = {
  /** Total bytes over the window. */
  bytes: number
  /** Share of those bytes answered from Cloudflare's cache, 0-1. */
  cachedShare: number
  /** First and last day covered (YYYY-MM-DD). */
  since: string
  until: string
  /** Bytes per day over the whole window, oldest first. */
  daily: { date: string; bytes: number }[]
}

const TTL_MS = 60 * 60 * 1000
let cached: { at: number; value: PublicStats | null } | null = null

async function read(): Promise<PublicStats | null> {
  const db = getSupabaseAdmin()

  const total = await db
    .from("wallpaper_likes")
    .select("id", { count: "exact", head: true })
  const first = await db
    .from("wallpaper_likes")
    .select("created_at")
    .order("created_at", { ascending: true })
    .limit(1)
  if (total.error || first.error || !first.data?.[0]) return null

  // One cumulative count per month end, from the first like to now.
  const start = new Date(first.data[0].created_at as string)
  const now = new Date()
  const ends: Date[] = []
  for (
    let d = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)
    );
    d < now;
    d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))
  ) {
    ends.push(d)
  }
  const monthly = await Promise.all(
    ends.map(async (end) => {
      const r = await db
        .from("wallpaper_likes")
        .select("id", { count: "exact", head: true })
        .lt("created_at", end.toISOString())
      const label = new Date(end.getTime() - 1).toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      })
      return { month: label, likes: r.count ?? 0 }
    })
  )
  const likes = total.count ?? 0
  monthly.push({
    month: now.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
    likes,
  })

  let bytes = 0
  let seconds = 0
  for (let from = 0; ; from += 1000) {
    const page = await db
      .from("wallpapers")
      .select("file_size_bytes,duration_seconds")
      .eq("is_publicly_listed", true)
      .range(from, from + 999)
    if (page.error) return null
    for (const row of page.data ?? []) {
      bytes += Number(row.file_size_bytes) || 0
      seconds += Number(row.duration_seconds) || 0
    }
    if ((page.data?.length ?? 0) < 1000) break
  }

  return {
    likes,
    likesByMonth: monthly,
    libraryGb: Math.round((bytes / 1e9) * 10) / 10,
    libraryHours: Math.round((seconds / 3600) * 10) / 10,
    readAt: now.toISOString(),
    served: await readServed().catch(() => null),
  }
}

const CF_GRAPHQL = "https://api.cloudflare.com/client/v4/graphql"
const CF_ZONE_NAME = "macwall.app"

/**
 * Bytes served for the macwall.app zone (the site and cdn.macwall.app, where
 * the wallpapers live), from Cloudflare's GraphQL Analytics API. Needs
 * CLOUDFLARE_ANALYTICS_TOKEN (Zone > Analytics > Read); CLOUDFLARE_ZONE_ID is
 * optional, the zone is looked up by name otherwise. Daily data, last 12
 * months, or as far back as the plan keeps it.
 */
async function readServed(): Promise<ServedStats | null> {
  const token = process.env.CLOUDFLARE_ANALYTICS_TOKEN?.trim()
  if (!token) return null
  const auth = { Authorization: `Bearer ${token}` }

  let zone = process.env.CLOUDFLARE_ZONE_ID?.trim()
  if (!zone) {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones?name=${CF_ZONE_NAME}`,
      { headers: auth }
    )
    const body = (await res.json()) as { result?: { id: string }[] }
    zone = body.result?.[0]?.id
    if (!zone) return null
  }

  const day = (d: Date) => d.toISOString().slice(0, 10)
  const until = new Date()
  const query = `query ($zone: String!, $since: Date!, $until: Date!) {
    viewer { zones(filter: { zoneTag: $zone }) {
      httpRequests1dGroups(limit: 400, orderBy: [date_ASC], filter: { date_geq: $since, date_lt: $until }) {
        dimensions { date }
        sum { bytes cachedBytes }
      }
    } }
  }`
  type Row = {
    dimensions: { date: string }
    sum: { bytes: number; cachedBytes: number }
  }

  // Plans keep different amounts of daily history: try a year, then 90 and 30 days.
  for (const days of [364, 90, 30]) {
    const since = new Date(until.getTime() - days * 86_400_000)
    const res = await fetch(CF_GRAPHQL, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { zone, since: day(since), until: day(until) },
      }),
    })
    const body = (await res.json()) as {
      data?: { viewer?: { zones?: { httpRequests1dGroups?: Row[] }[] } }
      errors?: unknown[]
    }
    const rows = body.data?.viewer?.zones?.[0]?.httpRequests1dGroups
    if (body.errors?.length || !rows?.length) continue
    const bytes = rows.reduce((a, r) => a + r.sum.bytes, 0)
    const cached = rows.reduce((a, r) => a + r.sum.cachedBytes, 0)
    return {
      bytes,
      cachedShare: bytes ? cached / bytes : 0,
      since: rows[0].dimensions.date,
      until: rows[rows.length - 1].dimensions.date,
      daily: rows.map((r) => ({
        date: r.dimensions.date,
        bytes: r.sum.bytes,
      })),
    }
  }
  return null
}

/** The stats, or null when the database is not reachable (the bento then hides them). */
export async function getPublicStats(): Promise<PublicStats | null> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.value
  let value: PublicStats | null = null
  try {
    value = await read()
  } catch {
    value = null
  }
  cached = { at: Date.now(), value }
  return value
}
