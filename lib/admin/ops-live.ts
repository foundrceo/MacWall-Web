import "server-only"

import { AwsClient } from "aws4fetch"

import { withTtlCache } from "@/lib/admin/ttl-cache"

const OPS_CACHE_MS = 30_000
const FETCH_MS = 8_000

const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID?.trim() || ""
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID?.trim() || ""

export type SourceStatus = {
  available: boolean
  error?: string
}

export type ResendLive = SourceStatus & {
  sent: number
  delivered: number
  bounced: number
  opened: number
  clicked: number
  failed: number
  deliveryRate: number
  recent: Array<{
    id: string
    to: string
    subject: string
    lastEvent: string
    createdAt: string
  }>
}

export type CloudflareLive = SourceStatus & {
  accountId: string
  buckets: Array<{ name: string; reachable: boolean }>
}

export type VercelLive = SourceStatus & {
  projectName: string
  productionUrl: string | null
  latest: Array<{
    id: string
    url: string
    state: string
    target: string | null
    createdAt: string
    commit: string | null
  }>
}

export type OpsLivePayload = {
  resend: ResendLive
  cloudflare: CloudflareLive
  vercel: VercelLive
}

function unavailable<T extends SourceStatus>(
  extra: Omit<T, keyof SourceStatus>,
  error: string
): T {
  return { available: false, error, ...extra } as T
}

async function fetchJson<T>(
  url: string,
  init: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(FETCH_MS),
    })
    const text = await response.text()
    if (!response.ok) {
      return {
        ok: false,
        error: `${response.status} ${text.slice(0, 160) || response.statusText}`,
      }
    }
    return { ok: true, data: (text ? JSON.parse(text) : {}) as T }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Request failed",
    }
  }
}

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10)
}

type ResendMetricsJson = {
  totals?: Record<string, number>
}

type ResendEmailJson = {
  id?: string
  to?: string[]
  subject?: string
  last_event?: string
  created_at?: string
}

async function fetchResendLive(sinceIso: string): Promise<ResendLive> {
  const empty = {
    sent: 0,
    delivered: 0,
    bounced: 0,
    opened: 0,
    clicked: 0,
    failed: 0,
    deliveryRate: 0,
    recent: [],
  }
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    return unavailable<ResendLive>(empty, "RESEND_API_KEY is not set")
  }

  const headers = { Authorization: `Bearer ${apiKey}` }
  const start = ymd(new Date(sinceIso))
  const end = ymd(new Date())

  const [metricsRes, listRes] = await Promise.all([
    fetchJson<ResendMetricsJson>(
      `https://api.resend.com/emails/metrics?startDate=${start}&endDate=${end}`,
      { headers }
    ),
    fetchJson<{ data?: ResendEmailJson[] }>(
      "https://api.resend.com/emails?limit=20",
      { headers }
    ),
  ])

  const totals = metricsRes.ok ? metricsRes.data.totals ?? {} : {}
  const sent = Number(totals.sent ?? 0)
  const delivered = Number(totals.delivered ?? 0)
  const bounced = Number(totals.bounced ?? 0)
  const opened = Number(totals.opened ?? 0)
  const clicked = Number(totals.clicked ?? 0)
  const failed = Number(totals.failed ?? 0)

  const recent = listRes.ok
    ? (listRes.data.data ?? []).slice(0, 8).map((row) => ({
        id: row.id ?? "",
        to: row.to?.[0] ?? "",
        subject: row.subject ?? "",
        lastEvent: row.last_event ?? "",
        createdAt: row.created_at ?? "",
      }))
    : []

  if (!metricsRes.ok && !listRes.ok) {
    return unavailable<ResendLive>(
      empty,
      metricsRes.error || listRes.error || "Resend request failed"
    )
  }

  return {
    available: true,
    sent,
    delivered,
    bounced,
    opened,
    clicked,
    failed,
    deliveryRate: sent > 0 ? Math.round((delivered / sent) * 1000) / 10 : 0,
    recent,
  }
}

async function headR2Bucket(
  client: AwsClient,
  accountId: string,
  bucket: string
): Promise<boolean> {
  try {
    const response = await client.fetch(
      `https://${accountId}.r2.cloudflarestorage.com/${bucket}`,
      { method: "HEAD", signal: AbortSignal.timeout(FETCH_MS) }
    )
    return response.ok
  } catch {
    return false
  }
}

async function fetchCloudflareLive(): Promise<CloudflareLive> {
  const empty = { accountId: "", buckets: [] }
  const accountId = process.env.R2_ACCOUNT_ID?.trim()
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim()
  if (!accountId || !accessKeyId || !secretAccessKey) {
    return unavailable<CloudflareLive>(empty, "R2 credentials are not set")
  }

  const catalog = process.env.R2_BUCKET?.trim() || "wallpaper-catalog"
  const installers =
    process.env.R2_INSTALLERS_BUCKET?.trim() || "installers"
  const client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    region: "auto",
    service: "s3",
  })

  const names = [...new Set([catalog, installers])]
  const buckets = await Promise.all(
    names.map(async (name) => ({
      name,
      reachable: await headR2Bucket(client, accountId, name),
    }))
  )

  return { available: true, accountId, buckets }
}

type VercelDeploymentsJson = {
  deployments?: Array<{
    uid?: string
    id?: string
    url?: string
    state?: string
    readyState?: string
    target?: string | null
    created?: number
    createdAt?: number
    meta?: { githubCommitMessage?: string }
  }>
}

async function fetchVercelLive(): Promise<VercelLive> {
  const empty = { projectName: "macwall", productionUrl: null, latest: [] }
  const token =
    process.env.VERCEL_TOKEN?.trim() ||
    process.env.VERCEL_ACCESS_TOKEN?.trim()
  if (!token) {
    return unavailable<VercelLive>(empty, "VERCEL_TOKEN is not set")
  }
  if (!VERCEL_PROJECT_ID) {
    return unavailable<VercelLive>(empty, "VERCEL_PROJECT_ID is not set")
  }

  const url = new URL("https://api.vercel.com/v6/deployments")
  url.searchParams.set("projectId", VERCEL_PROJECT_ID)
  if (VERCEL_TEAM_ID) {
    url.searchParams.set("teamId", VERCEL_TEAM_ID)
  }
  url.searchParams.set("limit", "8")

  const result = await fetchJson<VercelDeploymentsJson>(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!result.ok) {
    return unavailable<VercelLive>(empty, result.error)
  }

  const latest = (result.data.deployments ?? []).map((row) => {
    const created = row.created ?? row.createdAt ?? 0
    return {
      id: row.uid ?? row.id ?? "",
      url: row.url ? `https://${row.url}` : "",
      state: row.readyState ?? row.state ?? "",
      target: row.target ?? null,
      createdAt: created ? new Date(created).toISOString() : "",
      commit: row.meta?.githubCommitMessage?.split("\n")[0] ?? null,
    }
  })

  const production = latest.find((row) => row.target === "production") ?? latest[0]

  return {
    available: true,
    projectName: "macwall",
    productionUrl: production?.url ?? null,
    latest,
  }
}

export async function fetchOpsLive(sinceIso: string): Promise<OpsLivePayload> {
  return withTtlCache(`ops-live:${sinceIso.slice(0, 10)}`, OPS_CACHE_MS, async () => {
    const [resend, cloudflare, vercel] = await Promise.all([
      fetchResendLive(sinceIso),
      fetchCloudflareLive(),
      fetchVercelLive(),
    ])
    return { resend, cloudflare, vercel }
  })
}

