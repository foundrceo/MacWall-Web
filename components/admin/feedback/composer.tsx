"use client"

import { Archive, Paperclip, Send, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { IconButton, Kbd, Notice, Spinner } from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { isAutoClosedTicket } from "./helpers"
import type { FeedbackItem } from "./types"
import type { ReplyComposer } from "./use-reply-composer"

/** Tallest the reply box grows before it scrolls. */
const MAX_HEIGHT_PX = 176

/** Reply box pinned under the thread: text, one image, send. */
export function Composer({
  ticket,
  composer,
}: Readonly<{ ticket: FeedbackItem; composer: ReplyComposer }>) {
  const {
    draft,
    sending,
    composerError,
    pendingImage,
    fileRef,
    acceptComposerImage,
  } = composer
  const textRef = useRef<HTMLTextAreaElement | null>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const el = textRef.current
    if (!el) return
    el.style.height = "0px"
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`
  }, [draft])

  return (
    <footer className="shrink-0 border-t border-border px-3 py-3 sm:px-6">
      <div className="@container mx-auto max-w-[720px]">
        {composerError ? (
          <Notice tone="error" className="mb-2">
            {composerError}
          </Notice>
        ) : null}
        {ticket.isResolved ? (
          <p className="mb-2 flex items-start gap-1.5 px-0.5 text-xs text-muted-foreground">
            <Archive aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            {isAutoClosedTicket(ticket)
              ? "Closed automatically because nothing happened for 7 days. Reopen if you still need this thread."
              : "This ticket is closed. Replying will not reopen it."}
          </p>
        ) : null}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => {
            acceptComposerImage(event.target.files?.[0])
            event.target.value = ""
          }}
        />

        <div
          onDragOver={(event) => {
            if (!event.dataTransfer.types.includes("Files")) return
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            setDragging(false)
            const files = Array.from(event.dataTransfer.files)
            if (files.length === 0) return
            event.preventDefault()
            acceptComposerImage(
              files.find((file) => file.type.startsWith("image/")) ?? files[0]
            )
          }}
          className={cn(
            "focus-within:border-line-strong rounded-[10px] border bg-input/30 transition-colors duration-150",
            dragging ? "border-blue/60 bg-blue/8" : "border-border"
          )}
        >
          {pendingImage ? (
            <div className="px-3 pt-3">
              <div className="relative inline-block overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pendingImage.previewUrl}
                  alt="Attachment preview"
                  className="block max-h-24 w-auto max-w-[11rem] object-cover"
                />
                <button
                  type="button"
                  onClick={composer.clearPendingImage}
                  disabled={sending}
                  aria-label="Remove attachment"
                  className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-md bg-background/80 text-foreground transition-colors duration-150 outline-none hover:bg-background focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <X aria-hidden className="size-3" />
                </button>
              </div>
            </div>
          ) : null}

          <Textarea
            ref={textRef}
            value={draft}
            onChange={(event) => composer.onDraftChange(event.target.value)}
            onKeyDown={composer.onComposerKeyDown}
            onPaste={(event) => {
              const file = Array.from(event.clipboardData?.files ?? []).find(
                (f) => f.type.startsWith("image/")
              )
              if (file) {
                event.preventDefault()
                acceptComposerImage(file)
              }
            }}
            rows={1}
            placeholder="Write a reply…"
            aria-label="Write a reply"
            className="max-h-44 min-h-11 rounded-none border-0 bg-transparent px-3 pt-2.5 pb-1 leading-relaxed focus-visible:border-0 focus-visible:ring-0"
          />

          <div className="flex items-center gap-2 px-2 pb-2">
            <IconButton
              label="Attach image"
              disabled={sending}
              onClick={() => fileRef.current?.click()}
            >
              <Paperclip aria-hidden />
            </IconButton>
            <p className="ml-auto hidden items-center gap-1 text-[11px] whitespace-nowrap text-muted-foreground @[27rem]:flex">
              <Kbd>Enter</Kbd>
              <span className="mr-1.5">to send</span>
              <Kbd>Shift</Kbd>
              <Kbd>Enter</Kbd>
              <span>for a new line</span>
            </p>
            <Button
              type="button"
              size="sm"
              className="ml-auto @[27rem]:ml-1"
              disabled={!composer.canSend}
              onClick={() => void composer.sendReply()}
            >
              {sending ? (
                <Spinner className="size-3.5 text-current" />
              ) : (
                <Send aria-hidden className="size-3.5" />
              )}
              Send
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}
