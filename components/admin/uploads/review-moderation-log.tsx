"use client"

/** Everything that happened to one upload, oldest first, as a timeline. */

import { Skeleton, toneSolid } from "@/components/admin/ui"
import { cn } from "@/lib/utils"

import type { ModerationLogState } from "./review-data"
import { DetailSection } from "./review-section"
import { EVENT_META, formatDateTime } from "./review-types"

export function ReviewModerationLog({
  state,
  onRetry,
}: Readonly<{ state: ModerationLogState; onRetry: () => void }>) {
  return (
    <DetailSection title="Moderation log">
      {state.status === "loading" ? (
        <div aria-hidden className="space-y-3">
          <Skeleton className="h-3.5 w-4/5" />
          <Skeleton className="h-3.5 w-3/5" />
        </div>
      ) : state.status === "error" ? (
        <p className="text-[13px] text-muted-foreground">
          The log couldn&apos;t be loaded.{" "}
          <button
            type="button"
            onClick={onRetry}
            className="decoration-line-strong rounded-sm text-foreground underline underline-offset-2 outline-none hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Try again
          </button>
        </p>
      ) : state.events.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          No activity recorded for this upload.
        </p>
      ) : (
        <ol>
          {state.events.map((event, index) => {
            const meta = EVENT_META[event.action]
            const last = index === state.events.length - 1
            return (
              <li key={event.id} className="relative pb-4 pl-5 last:pb-0">
                {last ? null : (
                  <span
                    aria-hidden
                    className="absolute top-3 bottom-0 left-[3px] w-px bg-border"
                  />
                )}
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-[6px] left-0 size-[7px] rounded-full",
                    toneSolid[meta?.tone ?? "neutral"]
                  )}
                />
                <p className="text-[13px] text-foreground">
                  {meta?.label ?? event.action}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {event.actor}
                  <span aria-hidden className="text-faint mx-1.5">
                    ·
                  </span>
                  <time dateTime={event.createdAt}>
                    {formatDateTime(event.createdAt)}
                  </time>
                </p>
                {event.notes ? (
                  <p className="text-soft mt-1.5 text-[13px] break-words whitespace-pre-wrap">
                    {event.notes}
                  </p>
                ) : null}
              </li>
            )
          })}
        </ol>
      )}
    </DetailSection>
  )
}
