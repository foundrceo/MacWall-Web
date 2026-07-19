"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  ArrowReloadHorizontalIcon,
  BubbleChatIcon,
  CheckmarkCircle01Icon,
  InboxIcon,
  MenuIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@hugeicons/core-free-icons"
import { useCallback, useEffect, useState } from "react"

import {
  AdminBadge,
  AdminButton,
  AdminMetricTile,
  AdminNotice,
  AdminPill,
  AdminSkeleton,
  AdminSurface,
  AdminSurfaceBody,
  AdminSurfaceHeader,
  AdminToolbar,
} from "@/components/admin/admin-ui"

type Sentiment = "like" | "dislike" | "neutral"
type Filter = "all" | "unread" | "like" | "dislike" | "neutral"

type FeedbackItem = {
  id: string
  deviceId: string | null
  sentiment: Sentiment
  name: string | null
  message: string
  appVersion: string | null
  osVersion: string | null
  deviceModel: string | null
  modelIdentifier: string | null
  chip: string | null
  memoryGb: number | null
  isResolved: boolean
  createdAt: string
}

type Totals = {
  total: number
  like: number
  dislike: number
  neutral: number
  unresolved: number
}

const FILTERS: Array<{ id: Filter; label: string; icon: IconSvgElement }> = [
  { id: "all", label: "All", icon: MenuIcon },
  { id: "unread", label: "Unread", icon: InboxIcon },
  { id: "like", label: "Loving it", icon: ThumbsUpIcon },
  { id: "dislike", label: "Issues", icon: ThumbsDownIcon },
]

function sentimentBadge(sentiment: Sentiment) {
  if (sentiment === "like") {
    return <AdminBadge tone="green">Loving it</AdminBadge>
  }
  if (sentiment === "dislike") {
    return <AdminBadge tone="amber">Something&apos;s off</AdminBadge>
  }
  return <AdminBadge tone="neutral">Neutral</AdminBadge>
}

function deviceSpecs(item: FeedbackItem): Array<{ label: string; value: string }> {
  const specs: Array<{ label: string; value: string }> = []

  if (item.deviceModel) {
    const value = item.modelIdentifier
      ? `${item.deviceModel} (${item.modelIdentifier})`
      : item.deviceModel
    specs.push({ label: "Mac", value })
  } else if (item.modelIdentifier) {
    specs.push({ label: "Mac", value: item.modelIdentifier })
  }

  if (item.chip) specs.push({ label: "Chip", value: item.chip })
  if (item.memoryGb && item.memoryGb > 0) {
    specs.push({ label: "RAM", value: `${item.memoryGb} GB` })
  }
  if (item.osVersion) {
    specs.push({ label: "OS", value: item.osVersion.replace(/^macOS\s*/i, "macOS ") })
  }

  return specs
}

function formatDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function FeedbackPanel() {
  const [filter, setFilter] = useState<Filter>("all")
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [totals, setTotals] = useState<Totals | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const load = useCallback(async (next: Filter) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/feedback?filter=${next}`, {
        cache: "no-store",
        credentials: "same-origin",
      })
      const json = (await res.json()) as {
        feedback?: FeedbackItem[]
        totals?: Totals
        error?: string
      }
      if (!res.ok) throw new Error(json.error ?? "Failed to load feedback")
      setItems(json.feedback ?? [])
      setTotals(json.totals ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feedback")
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void load(filter)
    })
  }, [filter, load])

  async function toggleResolved(item: FeedbackItem) {
    setPendingId(item.id)
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id: item.id, isResolved: !item.isResolved }),
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error ?? "Update failed")
      }
      await load(filter)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed")
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <AdminMetricTile
          label="Total feedback"
          value={totals?.total ?? 0}
          icon={<HugeiconsIcon icon={BubbleChatIcon} className="size-4 text-[#86868b]" />}
        />
        <AdminMetricTile
          label="Loving it"
          value={totals?.like ?? 0}
          icon={<HugeiconsIcon icon={ThumbsUpIcon} className="size-4 text-[#248a3d]" />}
        />
        <AdminMetricTile
          label="Issues"
          value={totals?.dislike ?? 0}
          icon={<HugeiconsIcon icon={ThumbsDownIcon} className="size-4 text-[#c93400]" />}
        />
        <AdminMetricTile
          label="Unread"
          value={totals?.unresolved ?? 0}
          icon={<HugeiconsIcon icon={InboxIcon} className="size-4 text-[#0071e3]" />}
        />
      </div>

      <AdminSurface>
        <AdminSurfaceHeader
          title="Messages"
          description="Newest first. Mark items read once you've acted on them."
          action={
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => void load(filter)}
              className="gap-1.5"
            >
              <HugeiconsIcon
                icon={ArrowReloadHorizontalIcon}
                className="size-3.5"
              />
              Refresh
            </AdminButton>
          }
        />
        <AdminSurfaceBody className="space-y-4">
          <AdminToolbar>
            {FILTERS.map((f) => (
              <AdminPill
                key={f.id}
                active={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                <HugeiconsIcon icon={f.icon} className="size-3.5" />
                {f.label}
              </AdminPill>
            ))}
          </AdminToolbar>

          {error ? <AdminNotice tone="warning">{error}</AdminNotice> : null}

          {loading ? (
            <div className="space-y-3">
              <AdminSkeleton className="h-24 w-full" />
              <AdminSkeleton className="h-24 w-full" />
              <AdminSkeleton className="h-24 w-full" />
            </div>
          ) : items.length === 0 ? (
            <AdminNotice tone="info">
              No feedback yet for this filter. New messages show up here in real
              time.
            </AdminNotice>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={
                    item.isResolved
                      ? "rounded-2xl bg-[#f5f5f7]/60 p-4 sm:p-5"
                      : "rounded-2xl bg-[#f5f5f7] p-4 ring-1 ring-[#0071e3]/15 sm:p-5"
                  }
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {sentimentBadge(item.sentiment)}
                    <span className="text-[14px] font-medium text-[#1d1d1f]">
                      {item.name?.trim() || "Anonymous"}
                    </span>
                    {item.isResolved ? (
                      <AdminBadge tone="neutral">Read</AdminBadge>
                    ) : (
                      <AdminBadge tone="blue">New</AdminBadge>
                    )}
                    <span className="ml-auto text-[12px] text-[#86868b]">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <p className="mt-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-[#1d1d1f]">
                    {item.message}
                  </p>

                  {deviceSpecs(item).length > 0 ? (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {deviceSpecs(item).map((spec) => (
                        <span
                          key={spec.label}
                          className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] ring-1 ring-black/5"
                        >
                          <span className="text-[#86868b]">{spec.label}</span>
                          <span className="font-medium text-[#1d1d1f]">
                            {spec.value}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#86868b]">
                    {item.appVersion ? <span>App {item.appVersion}</span> : null}
                    {item.deviceId ? (
                      <span className="font-mono">
                        {item.deviceId.slice(0, 8)}
                      </span>
                    ) : null}
                    <AdminButton
                      variant={item.isResolved ? "ghost" : "secondary"}
                      size="sm"
                      className="ml-auto gap-1.5"
                      disabled={pendingId === item.id}
                      onClick={() => void toggleResolved(item)}
                    >
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        className="size-3.5"
                      />
                      {item.isResolved ? "Mark unread" : "Mark read"}
                    </AdminButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminSurfaceBody>
      </AdminSurface>
    </div>
  )
}
