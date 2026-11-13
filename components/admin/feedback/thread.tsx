"use client"

import { ArrowDown, Clock } from "lucide-react"
import type { ReactNode } from "react"

import { Avatar, Skeleton } from "@/components/admin/ui"
import { ChatAttachmentMedia } from "@/components/macwall-chat/chat-attachment-media"
import { formatClockTime } from "@/lib/admin/format"
import { cn } from "@/lib/utils"

import { messageParts } from "./helpers"
import type {
  FeedbackMessage,
  FeedbackMessageAuthor,
  MessageGroup,
  TimelineItem,
} from "./types"
import type { ThreadScroll } from "./use-thread-scroll"

/** Customer bubbles are plain fill; ours carry a quiet tint. */
const BUBBLE: Record<FeedbackMessageAuthor, string> = {
  user: "bg-fill",
  admin: "bg-blue/12",
  assist: "bg-violet/10",
}

const LINK_CLASS =
  "text-blue underline decoration-blue/40 underline-offset-2 outline-none hover:decoration-blue focus-visible:ring-2 focus-visible:ring-ring"

/** Message body with URLs and email addresses turned into links. */
function linkify(text: string): ReactNode[] {
  const parts = text.split(/(https?:\/\/\S+|[\w.+-]+@[\w.-]+\.\w+)/gi)
  return parts.map((part, i) => {
    if (!part) return null
    if (/^https?:\/\//i.test(part)) {
      return (
        <a
          key={`${part}-${i}`}
          href={part}
          target="_blank"
          rel="noreferrer noopener"
          className={LINK_CLASS}
        >
          {part}
        </a>
      )
    }
    if (part.includes("@") && part.includes(".")) {
      return (
        <a key={`${part}-${i}`} href={`mailto:${part}`} className={LINK_CLASS}>
          {part}
        </a>
      )
    }
    return <span key={`${i}`}>{part}</span>
  })
}

/** The transcript: day separators, grouped bubbles, typing, jump-to-latest. */
export function Thread({
  timeline,
  customer,
  visitorTyping,
  scroll,
}: Readonly<{
  timeline: TimelineItem[]
  /** Display name of the customer, for the avatar and group captions. */
  customer: string
  visitorTyping: boolean
  scroll: ThreadScroll
}>) {
  const {
    scrollRef,
    endRef,
    atBottom,
    hasUnseenBelow,
    onThreadScroll,
    scrollThreadToBottom,
  } = scroll

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={onThreadScroll}
        role="log"
        aria-label={`Conversation with ${customer}`}
        className="h-full overflow-y-auto px-3 py-4 sm:px-6"
      >
        <div className="mx-auto flex max-w-[720px] flex-col">
          {timeline.length === 0 && !visitorTyping ? (
            <p className="py-10 text-center text-[13px] text-muted-foreground">
              No messages in this conversation yet.
            </p>
          ) : null}

          {timeline.map((item) =>
            item.kind === "separator" ? (
              <div
                key={item.key}
                role="separator"
                className="flex items-center gap-3 py-3 first:pt-0"
              >
                <span aria-hidden className="h-px flex-1 bg-border" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  {item.label}
                </span>
                <span aria-hidden className="h-px flex-1 bg-border" />
              </div>
            ) : item.kind === "system" ? (
              <p
                key={item.key}
                className="mx-auto mt-3 flex max-w-md items-start gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground"
              >
                <Clock aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                {item.body}
              </p>
            ) : (
              <Group key={item.key} group={item.group} customer={customer} />
            )
          )}

          {visitorTyping ? <TypingRow customer={customer} /> : null}
          <div ref={endRef} className="h-1" />
        </div>
      </div>

      {!atBottom ? (
        <button
          type="button"
          onClick={() => scrollThreadToBottom()}
          className="border-line-strong bg-raised hover:bg-fill-hover absolute bottom-3 left-1/2 z-10 inline-flex h-7 -translate-x-1/2 items-center gap-1.5 rounded-full border pr-3 pl-2.5 text-xs font-medium text-foreground shadow-[0_8px_24px_-8px_rgba(0,0,0,0.8)] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowDown
            aria-hidden
            className={cn(
              "size-3.5",
              hasUnseenBelow ? "text-blue" : "text-muted-foreground"
            )}
          />
          {hasUnseenBelow ? "New messages" : "Jump to latest"}
        </button>
      ) : null}
    </div>
  )
}

function Group({
  group,
  customer,
}: Readonly<{ group: MessageGroup; customer: string }>) {
  const fromCustomer = group.author === "user"
  const last = group.messages.at(-1)!
  const sending = last.id.startsWith("optimistic-")

  return (
    <div
      className={cn(
        "mt-3 flex items-end gap-2",
        fromCustomer ? "flex-row" : "flex-row-reverse"
      )}
    >
      {fromCustomer ? (
        <Avatar name={customer} size="sm" className="mb-5" />
      ) : null}
      <div
        className={cn(
          "flex max-w-[min(520px,86%)] min-w-0 flex-col gap-0.5",
          fromCustomer ? "items-start" : "items-end"
        )}
      >
        {group.messages.map((msg) => (
          <Message key={msg.id} msg={msg} author={group.author} />
        ))}
        <p className="mt-0.5 px-1 text-[11px] text-muted-foreground">
          {group.author === "admin"
            ? "You"
            : group.author === "assist"
              ? "MacWall Assist"
              : customer}
          {" · "}
          {sending ? "Sending…" : formatClockTime(last.createdAt)}
        </p>
      </div>
    </div>
  )
}

function Message({
  msg,
  author,
}: Readonly<{ msg: FeedbackMessage; author: FeedbackMessageAuthor }>) {
  const { hasImage, hasRealText } = messageParts(msg)
  if (!hasImage && !hasRealText) return null
  const sentAt = new Date(msg.createdAt)

  return (
    <div
      className={cn(
        "flex max-w-full flex-col gap-1",
        author === "user" ? "items-start" : "items-end",
        msg.id.startsWith("optimistic-") && "opacity-70"
      )}
    >
      {hasImage ? (
        <ChatAttachmentMedia
          src={msg.imageUrl!}
          tone="dark"
          maxWidth={260}
          className="rounded-xl"
        />
      ) : null}
      {hasRealText ? (
        <div
          title={
            Number.isNaN(sentAt.getTime()) ? undefined : sentAt.toLocaleString()
          }
          className={cn(
            "max-w-full rounded-xl px-3 py-2 text-[13px] leading-relaxed [overflow-wrap:anywhere] break-words whitespace-pre-wrap text-foreground",
            BUBBLE[author]
          )}
        >
          {linkify(msg.body)}
        </div>
      ) : null}
    </div>
  )
}

function TypingRow({ customer }: Readonly<{ customer: string }>) {
  return (
    <div className="mt-3 flex items-end gap-2">
      <Avatar name={customer} size="sm" />
      <div className="bg-fill flex h-8 items-center gap-1 rounded-xl px-3">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            aria-hidden
            className="size-1.5 animate-pulse rounded-full bg-muted-foreground motion-reduce:animate-none"
            style={{
              animationDelay: `${dot * 180}ms`,
              animationDuration: "1s",
            }}
          />
        ))}
        <span className="sr-only">{customer} is typing</span>
      </div>
    </div>
  )
}

/** First-load placeholder shaped like a short exchange. */
export function ThreadSkeleton() {
  const rows = [
    { mine: false, width: "w-56" },
    { mine: false, width: "w-72" },
    { mine: true, width: "w-64" },
    { mine: false, width: "w-44" },
    { mine: true, width: "w-52" },
  ] as const
  return (
    <div
      role="status"
      aria-label="Loading conversation"
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
        <Skeleton className="size-8 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3 w-52" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-[768px] flex-1 space-y-3 px-3 py-4 sm:px-6">
        {rows.map((row, index) => (
          <div
            key={index}
            className={cn("flex", row.mine ? "justify-end" : "justify-start")}
          >
            <Skeleton className={cn("h-9 max-w-[80%] rounded-xl", row.width)} />
          </div>
        ))}
      </div>
    </div>
  )
}
