"use client"

/**
 * Emails — preview the transactional HTML customers receive via Resend
 * (license delivery + checkout recovery). Sample data only; nothing is sent.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type SyntheticEvent,
} from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ComputerIcon,
  Mail01Icon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons"
import { ExternalLink } from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { AdminBadge, type Tone } from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import {
  ADMIN_EMAIL_TEMPLATES,
  EMAIL_SITE_URL,
  type AdminEmailTemplateId,
} from "@/lib/admin/email-templates"
import { cn } from "@/lib/utils"

type PreviewWidth = "desktop" | "mobile"

const WIDTH_PX: Record<PreviewWidth, number> = {
  desktop: 760,
  mobile: 390,
}

export default function AdminEmailsPage() {
  const [selectedId, setSelectedId] =
    useState<AdminEmailTemplateId>("license-3")
  const [width, setWidth] = useState<PreviewWidth>("desktop")
  const [frameHeight, setFrameHeight] = useState(900)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const selected = useMemo(
    () => ADMIN_EMAIL_TEMPLATES.find((t) => t.id === selectedId)!,
    [selectedId]
  )

  const [html, setHtml] = useState(() => selected.buildHtml())

  /** Prefer local assets in preview so hero/logo load on localhost. */
  useEffect(() => {
    const origin = window.location.origin
    setHtml(selected.buildHtml().split(EMAIL_SITE_URL).join(origin))
    setFrameHeight(900)
  }, [selected])

  const measureFrame = useCallback(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc?.documentElement) return
    const next = Math.max(
      doc.documentElement.scrollHeight,
      doc.body?.scrollHeight ?? 0,
      640
    )
    setFrameHeight(next)
  }, [])

  const onFrameLoad = useCallback(
    (event: SyntheticEvent<HTMLIFrameElement>) => {
      const doc = event.currentTarget.contentDocument
      if (!doc) return
      measureFrame()
      const imgs = Array.from(doc.images)
      for (const img of imgs) {
        if (!img.complete) {
          img.addEventListener("load", measureFrame, { once: true })
          img.addEventListener("error", measureFrame, { once: true })
        }
      }
    },
    [measureFrame]
  )

  useEffect(() => {
    // Re-measure after desktop/mobile width change (reflow).
    const id = window.requestAnimationFrame(() => measureFrame())
    return () => window.cancelAnimationFrame(id)
  }, [width, html, measureFrame])

  return (
    <AdminShell title="Emails" fill>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex max-h-[40vh] w-full shrink-0 flex-col border-b border-[var(--admin-border)] bg-white lg:max-h-none lg:w-80 lg:border-r lg:border-b-0">
          <div className="border-b border-[var(--admin-border)] px-4 py-3">
            <p className="text-[13px] font-semibold text-[var(--admin-fg)]">
              Templates
            </p>
            <p className="mt-0.5 text-[12px] text-[var(--admin-muted)]">
              Sample preview only — not sent
            </p>
          </div>
          <nav className="min-h-0 flex-1 overflow-y-auto p-2">
            {ADMIN_EMAIL_TEMPLATES.map((template) => {
              const active = template.id === selectedId
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedId(template.id)}
                  className={cn(
                    "mb-1 flex w-full flex-col gap-1 rounded-xl px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-blue)]/30",
                    active
                      ? "bg-[var(--admin-fill)]"
                      : "hover:bg-[var(--admin-fill)]/70"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={Mail01Icon}
                      strokeWidth={active ? 2 : 1.6}
                      className={cn(
                        "size-4 shrink-0",
                        active
                          ? "text-[var(--admin-blue)]"
                          : "text-[var(--admin-muted)]"
                      )}
                    />
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-[13px] font-medium",
                        active
                          ? "text-[var(--admin-fg)]"
                          : "text-[var(--admin-fg-soft)]"
                      )}
                    >
                      {template.label}
                    </span>
                    <AdminBadge tone={template.tone as Tone}>
                      {template.tone === "green" ? "Active" : "Recovery"}
                    </AdminBadge>
                  </div>
                  <p className="line-clamp-2 pl-6 text-[11px] leading-relaxed text-[var(--admin-muted)]">
                    {template.description}
                  </p>
                </button>
              )
            })}
          </nav>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--admin-canvas)]">
          <div className="shrink-0 border-b border-[var(--admin-border)] bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <p className="text-[11px] font-semibold tracking-wider text-[var(--admin-muted)] uppercase">
                  Subject
                </p>
                <p className="truncate text-[15px] font-semibold text-[var(--admin-fg)]">
                  {selected.subject}
                </p>
                <dl className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--admin-muted)]">
                  <div className="flex gap-1.5">
                    <dt className="font-medium text-[var(--admin-fg-soft)]">
                      From
                    </dt>
                    <dd className="truncate">{selected.from}</dd>
                  </div>
                  <div className="flex min-w-0 gap-1.5">
                    <dt className="shrink-0 font-medium text-[var(--admin-fg-soft)]">
                      Trigger
                    </dt>
                    <dd className="truncate">{selected.trigger}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="font-medium text-[var(--admin-fg-soft)]">
                      Function
                    </dt>
                    <dd className="font-mono text-[11px]">
                      {selected.edgeFunction}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--admin-fill)] p-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-pressed={width === "desktop"}
                  className={cn(
                    "h-8 gap-1.5 rounded-full px-3 text-[12px]",
                    width === "desktop" &&
                      "bg-white text-[var(--admin-fg)] shadow-sm"
                  )}
                  onClick={() => setWidth("desktop")}
                >
                  <HugeiconsIcon
                    icon={ComputerIcon}
                    strokeWidth={1.6}
                    className="size-3.5"
                  />
                  Desktop
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-pressed={width === "mobile"}
                  className={cn(
                    "h-8 gap-1.5 rounded-full px-3 text-[12px]",
                    width === "mobile" &&
                      "bg-white text-[var(--admin-fg)] shadow-sm"
                  )}
                  onClick={() => setWidth("mobile")}
                >
                  <HugeiconsIcon
                    icon={SmartPhone01Icon}
                    strokeWidth={1.6}
                    className="size-3.5"
                  />
                  Mobile
                </Button>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-white">
            <div className="px-3 py-4 sm:px-6 sm:py-6">
              <div
                className="mx-auto transition-[max-width] duration-200"
                style={{ maxWidth: WIDTH_PX[width] }}
              >
                <div className="overflow-hidden rounded-lg border border-black/8 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-2 border-b border-black/6 bg-[#fafafa] px-3 py-2">
                    <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="size-2.5 rounded-full bg-[#febc2e]" />
                    <span className="size-2.5 rounded-full bg-[#28c840]" />
                    <span className="ml-2 truncate text-[11px] text-[var(--admin-muted)]">
                      Full email preview
                    </span>
                    <a
                      href={EMAIL_SITE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-[var(--admin-blue)] hover:underline"
                    >
                      macwall.app
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                  <iframe
                    key={`${selectedId}-${width}`}
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
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  )
}
