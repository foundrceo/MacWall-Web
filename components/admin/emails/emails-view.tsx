"use client"

/**
 * Previews of the emails customers get via Resend (license delivery, checkout
 * recovery, trial). Sample data only; nothing is sent from here.
 */

import { Monitor, Smartphone } from "lucide-react"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type SyntheticEvent,
} from "react"

import { AdminPage } from "@/components/admin/page"
import {
  Segmented,
  StatusDot,
  toneSolid,
  type Tone,
} from "@/components/admin/ui"
import {
  ADMIN_EMAIL_TEMPLATES,
  EMAIL_SITE_URL,
  type AdminEmailGroup,
  type AdminEmailTemplateId,
} from "@/lib/admin/email-templates"
import type { TrialEmailStats } from "@/lib/admin/trial-emails"
import { cn } from "@/lib/utils"

type PreviewWidth = "desktop" | "mobile"

const WIDTH_PX: Record<PreviewWidth, number> = {
  desktop: 720,
  mobile: 390,
}

const GROUPS: readonly {
  id: AdminEmailGroup
  label: string
  description: string
}[] = [
  {
    id: "automatic",
    label: "Automatic",
    description: "Sent by the system when something happens.",
  },
  {
    id: "campaign",
    label: "Campaigns",
    description: "One-off sales, sent by hand.",
  },
]

const subscribeToNothing = () => () => {}

/** Browser origin once hydrated, empty on the server so the markup matches. */
function useBrowserOrigin() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => window.location.origin,
    () => ""
  )
}

export function EmailsView() {
  const [selectedId, setSelectedId] = useState<AdminEmailTemplateId>("license")
  const [width, setWidth] = useState<PreviewWidth>("desktop")
  const [frameHeight, setFrameHeight] = useState(900)
  const [stats, setStats] = useState<TrialEmailStats | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const selected = useMemo(
    () =>
      ADMIN_EMAIL_TEMPLATES.find((template) => template.id === selectedId) ??
      ADMIN_EMAIL_TEMPLATES[0],
    [selectedId]
  )

  const origin = useBrowserOrigin()

  /** Point assets at this origin so the hero and logo load on localhost. */
  const html = useMemo(() => {
    const built = selected.buildHtml()
    return origin ? built.split(EMAIL_SITE_URL).join(origin) : built
  }, [selected, origin])

  useEffect(() => {
    let cancelled = false
    void fetch("/api/admin/trial-emails", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: TrialEmailStats | null) => {
        if (!cancelled && payload) setStats(payload)
      })
      .catch(() => null)
    return () => {
      cancelled = true
    }
  }, [])

  const measureFrame = useCallback(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc?.documentElement) return
    setFrameHeight(
      Math.max(
        doc.documentElement.scrollHeight,
        doc.body?.scrollHeight ?? 0,
        640
      )
    )
  }, [])

  const onFrameLoad = useCallback(
    (event: SyntheticEvent<HTMLIFrameElement>) => {
      const doc = event.currentTarget.contentDocument
      if (!doc) return
      measureFrame()
      for (const img of Array.from(doc.images)) {
        if (!img.complete) {
          img.addEventListener("load", measureFrame, { once: true })
          img.addEventListener("error", measureFrame, { once: true })
        }
      }
    },
    [measureFrame]
  )

  useEffect(() => {
    // The email reflows when the preview width changes.
    const id = window.requestAnimationFrame(() => measureFrame())
    return () => window.cancelAnimationFrame(id)
  }, [width, html, measureFrame])

  return (
    <AdminPage
      title="Emails"
      description="Previews with sample data. Nothing is sent from here."
      fill
      actions={
        <Segmented
          label="Preview width"
          value={width}
          onChange={setWidth}
          options={[
            {
              value: "desktop",
              label: "Desktop",
              icon: <Monitor aria-hidden />,
            },
            {
              value: "mobile",
              label: "Mobile",
              icon: <Smartphone aria-hidden />,
            },
          ]}
        />
      }
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex max-h-[38svh] shrink-0 flex-col border-b border-border lg:max-h-none lg:w-[304px] lg:border-r lg:border-b-0">
          <nav
            aria-label="Email templates"
            className="min-h-0 flex-1 overflow-y-auto p-2"
          >
            {GROUPS.map((group) => {
              const templates = ADMIN_EMAIL_TEMPLATES.filter(
                (template) => template.group === group.id
              )
              if (templates.length === 0) return null
              return (
                <div key={group.id} className="mb-4 last:mb-0">
                  <div className="px-2.5 pt-1.5 pb-1.5">
                    <p className="text-soft text-xs font-medium">
                      {group.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {group.description}
                    </p>
                  </div>
                  <ul className="space-y-0.5">
                    {templates.map((template) => {
                      const active = template.id === selected.id
                      return (
                        <li key={template.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(template.id)}
                            aria-current={active ? "true" : undefined}
                            className={cn(
                              "w-full rounded-lg px-2.5 py-2 text-left transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              active ? "bg-fill-hover" : "hover:bg-fill"
                            )}
                          >
                            <span
                              className={cn(
                                "block truncate text-[13px] font-medium",
                                active ? "text-foreground" : "text-soft"
                              )}
                            >
                              {template.label}
                            </span>
                            <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                              {template.description}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </nav>

          {stats ? <TrialFunnel stats={stats} /> : null}
        </aside>

        <section
          aria-label="Email preview"
          className="flex min-h-0 min-w-0 flex-1 flex-col"
        >
          <div className="shrink-0 border-b border-border px-4 py-3 sm:px-6">
            <h2 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-foreground">
              {selected.subject}
            </h2>
            <dl className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs">
              <MetaItem label="Inbox preview" value={selected.preheader} />
              <MetaItem label="From" value={selected.from} />
              <MetaItem label="Trigger" value={selected.trigger} />
              <MetaItem label="Function" value={selected.edgeFunction} />
            </dl>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:16px_16px] px-3 py-5 sm:px-6 sm:py-8">
            <div
              className="border-line-strong mx-auto overflow-hidden rounded-xl border bg-white shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)] transition-[max-width] duration-300 ease-out motion-reduce:transition-none"
              style={{ maxWidth: WIDTH_PX[width] }}
            >
              <iframe
                key={`${selected.id}-${width}`}
                ref={iframeRef}
                title={`Email preview: ${selected.label}`}
                srcDoc={html}
                sandbox="allow-same-origin"
                onLoad={onFrameLoad}
                scrolling="no"
                className="block w-full border-0 bg-white"
                style={{ height: frameHeight, overflow: "hidden" }}
              />
            </div>
          </div>
        </section>
      </div>
    </AdminPage>
  )
}

function MetaItem({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex min-w-0 gap-1.5">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-soft min-w-0 truncate">{value}</dd>
    </div>
  )
}

/** Where trial leads are in the email funnel, as one bar and its legend. */
function TrialFunnel({ stats }: Readonly<{ stats: TrialEmailStats }>) {
  const segments: readonly { label: string; value: number; tone: Tone }[] = [
    { label: "Bought", value: stats.converted, tone: "green" },
    { label: "In trial", value: stats.stillInTrial, tone: "blue" },
    { label: "Trial ended", value: stats.unconvertedEnded, tone: "neutral" },
  ]
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)

  return (
    <div className="hidden shrink-0 border-t border-border p-4 lg:block">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-soft text-xs font-medium">Trial leads</h2>
        <p className="text-xs text-muted-foreground tabular-nums">
          {stats.uniqueEmails.toLocaleString()} emails
        </p>
      </div>
      <div
        aria-hidden
        className="mt-2.5 flex h-1.5 gap-0.5 overflow-hidden rounded-full"
      >
        {total > 0 ? (
          segments.map((segment) =>
            segment.value > 0 ? (
              <span
                key={segment.label}
                className={cn("h-full rounded-full", toneSolid[segment.tone])}
                style={{ flexGrow: segment.value, flexBasis: 0 }}
              />
            ) : null
          )
        ) : (
          <span className="bg-fill h-full flex-1 rounded-full" />
        )}
      </div>
      <dl className="mt-3 space-y-1.5 text-xs">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2">
            <StatusDot tone={segment.tone} className="size-1.5" />
            <dt className="flex-1 text-muted-foreground">{segment.label}</dt>
            <dd className="font-medium text-foreground tabular-nums">
              {segment.value.toLocaleString()}
            </dd>
          </div>
        ))}
        <div className="flex items-center gap-2 border-t border-border pt-2">
          <dt className="flex-1 text-muted-foreground">Emails sent</dt>
          <dd className="font-medium text-foreground tabular-nums">
            {stats.queuedSent.toLocaleString()}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="flex-1 text-muted-foreground">Queued</dt>
          <dd className="font-medium text-foreground tabular-nums">
            {stats.queuedPending.toLocaleString()}
          </dd>
        </div>
      </dl>
    </div>
  )
}
