"use client"

/**
 * Reply composer state: the draft, one optional image, the optimistic message
 * and its reconciliation with the server's copy of the ticket.
 */

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type RefObject,
  type SetStateAction,
} from "react"

import { useSupportTypingEmitter } from "@/lib/macwall-chat/use-support-typing-emitter"

import type { FeedbackItem, PendingImage } from "./types"

const MAX_IMAGE_BYTES = 4 * 1024 * 1024

async function uploadAdminImage(ticketId: string, file: File): Promise<string> {
  const form = new FormData()
  form.append("file", file)
  form.append("ticketId", ticketId)
  const res = await fetch("/api/admin/feedback/upload", {
    method: "POST",
    body: form,
    credentials: "same-origin",
  })
  const json = (await res.json()) as { publicUrl?: string; error?: string }
  if (!res.ok || !json.publicUrl) {
    throw new Error(json.error ?? "Couldn’t upload image")
  }
  return json.publicUrl
}

export function useReplyComposer({
  selected,
  selectedId,
  setItems,
  sendingRef,
  load,
  onSendStart,
}: Readonly<{
  selected: FeedbackItem | null
  selectedId: string | null
  setItems: Dispatch<SetStateAction<FeedbackItem[]>>
  /** Shared with the inbox so a silent reload never wipes a reply in flight. */
  sendingRef: RefObject<boolean>
  load: (silent?: boolean) => Promise<void>
  /** Runs once a reply is accepted for sending (pins the thread to latest). */
  onSendStart: () => void
}>) {
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [composerError, setComposerError] = useState<string | null>(null)
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const { signalTyping: signalAdminTyping } = useSupportTypingEmitter({
    ticketId: selectedId,
    enabled: Boolean(selectedId) && Boolean(selected) && !selected?.isResolved,
    buildBody: () => ({}),
    endpointFor: (id) => `/api/admin/feedback/${encodeURIComponent(id)}/typing`,
  })

  // Another ticket (or none): the draft and attachment don't follow.
  useEffect(() => {
    queueMicrotask(() => {
      setDraft("")
      setComposerError(null)
      setPendingImage((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl)
        return null
      })
    })
  }, [selectedId])

  function onDraftChange(next: string) {
    setDraft(next)
    if (next.trim() && selected && !selected.isResolved) {
      signalAdminTyping()
    }
  }

  function clearPendingImage() {
    setPendingImage((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl)
      return null
    })
    if (fileRef.current) fileRef.current.value = ""
  }

  function acceptComposerImage(file: File | null | undefined) {
    if (!file) return
    const type = file.type.toLowerCase()
    const ext = file.name.split(".").pop()?.toLowerCase()
    const allowedType =
      type === "image/jpeg" || type === "image/png" || type === "image/webp"
    const allowedExt = Boolean(
      ext && ["jpg", "jpeg", "png", "webp"].includes(ext)
    )
    if (
      (!allowedType && !allowedExt) ||
      file.size <= 0 ||
      file.size > MAX_IMAGE_BYTES
    ) {
      setComposerError("Images only: jpg, png or webp under 4 MB.")
      return
    }
    setComposerError(null)
    setPendingImage((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl)
      return { file, previewUrl: URL.createObjectURL(file) }
    })
  }

  async function sendReply() {
    if (!selected || sendingRef.current) return
    const body = draft.trim()
    const imageFile = pendingImage?.file ?? null
    const localPreview = pendingImage?.previewUrl ?? null
    if (!body && !imageFile) return

    const ticketId = selected.id
    const priorNeedsReply = selected.needsAdminReply
    const optimisticId = `optimistic-${Date.now()}`
    sendingRef.current = true
    setSending(true)
    setComposerError(null)
    setDraft("")
    onSendStart()

    setItems((current) =>
      current.map((row) =>
        row.id === ticketId
          ? {
              ...row,
              needsAdminReply: false,
              messages: [
                ...row.messages,
                {
                  id: optimisticId,
                  author: "admin" as const,
                  body: body || " ",
                  imageUrl: localPreview,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : row
      )
    )
    setPendingImage(null)
    if (fileRef.current) fileRef.current.value = ""

    try {
      let imageUrl: string | null = null
      if (imageFile) {
        imageUrl = await uploadAdminImage(ticketId, imageFile)
        // Swap blob preview for the durable public URL before the network reply.
        if (imageUrl) {
          setItems((current) =>
            current.map((row) =>
              row.id === ticketId
                ? {
                    ...row,
                    messages: row.messages.map((m) =>
                      m.id === optimisticId ? { ...m, imageUrl } : m
                    ),
                  }
                : row
            )
          )
          if (localPreview) URL.revokeObjectURL(localPreview)
        }
      }

      const res = await fetch(`/api/admin/feedback/${ticketId}/reply`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ reply: body, imageUrl }),
      })
      const json = (await res.json()) as {
        feedback?: FeedbackItem
        error?: string
      }
      if (!res.ok) throw new Error(json.error ?? "Reply failed")

      if (json.feedback) {
        setItems((current) =>
          current.map((row) => (row.id === ticketId ? json.feedback! : row))
        )
      } else {
        void load(true)
      }
    } catch (err) {
      setItems((current) =>
        current.map((row) =>
          row.id === ticketId
            ? {
                ...row,
                needsAdminReply: priorNeedsReply,
                messages: row.messages.filter((m) => m.id !== optimisticId),
              }
            : row
        )
      )
      setDraft(body)
      if (imageFile) {
        setPendingImage({
          file: imageFile,
          previewUrl: URL.createObjectURL(imageFile),
        })
      }
      setComposerError(err instanceof Error ? err.message : "Reply failed")
    } finally {
      sendingRef.current = false
      setSending(false)
    }
  }

  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (sendingRef.current || sending) return
      void sendReply()
    }
  }

  return {
    draft,
    sending,
    composerError,
    setComposerError,
    pendingImage,
    fileRef,
    canSend: !sending && Boolean(draft.trim() || pendingImage),
    onDraftChange,
    onComposerKeyDown,
    acceptComposerImage,
    clearPendingImage,
    sendReply,
  }
}

export type ReplyComposer = ReturnType<typeof useReplyComposer>
