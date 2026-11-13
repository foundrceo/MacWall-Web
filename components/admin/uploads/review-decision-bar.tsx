"use client"

/**
 * The decision on a pending submission. Approving is one click; rejecting,
 * asking for information and blocking confirm in a dialog that also takes the
 * note. One draft note per submission is shared by every action.
 */

import {
  Ban,
  Check,
  MessageCircleQuestion,
  MessageSquarePlus,
  TriangleAlert,
  X,
} from "lucide-react"
import { useId, useState, type FormEvent, type KeyboardEvent } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Field, IconButton, Notice, Spinner } from "@/components/admin/ui"

import type { DecisionResult, ReviewAction, UploadItem } from "./review-types"

type ConfirmedAction = Exclude<ReviewAction, "approve">

const NOTE_MAX_LENGTH = 2000

const CONFIRM: Record<
  ConfirmedAction,
  {
    title: string
    /** Takes the submission's title, already in quotes. */
    description: (name: string) => string
    field: string
    placeholder: string
    hint?: string
    /** Shown when a required note is empty; absent when it is optional. */
    missing?: string
    confirm: string
    destructive: boolean
  }
> = {
  reject: {
    title: "Reject this submission?",
    description: (name) =>
      `${name} leaves the review queue and the uploader is told it was not accepted. This can't be undone from here.`,
    field: "Reason for the uploader",
    placeholder: "Why it can't be published",
    hint: "Shown to the uploader in the MacWall app.",
    confirm: "Reject submission",
    destructive: true,
  },
  "request-info": {
    title: "Request more information",
    description: (name) =>
      `${name} stays pending and the uploader sees your message in the MacWall app.`,
    field: "What you need from the uploader",
    placeholder: "For example, a link to the license or the original source",
    missing: "Write what you need from the uploader first.",
    confirm: "Send request",
    destructive: false,
  },
  block: {
    title: "Block this uploader?",
    description: (name) =>
      `The install that sent ${name} can no longer submit, and its other pending uploads are rejected.`,
    field: "Reason for blocking",
    placeholder: "What they did, for the moderation log",
    missing: "Write the reason for blocking first.",
    confirm: "Block uploader",
    destructive: true,
  },
}

export function ReviewDecisionBar({
  upload,
  acting,
  onDecide,
}: Readonly<{
  upload: UploadItem
  /** The action in flight, for any submission. */
  acting: ReviewAction | null
  onDecide: (action: ReviewAction, note: string) => Promise<DecisionResult>
}>) {
  const [note, setNote] = useState("")
  const [noteOpen, setNoteOpen] = useState(false)
  const [confirming, setConfirming] = useState<ConfirmedAction>("reject")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [barError, setBarError] = useState<string | null>(null)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)
  const inlineNoteId = useId()
  const dialogNoteId = useId()

  const busy = acting !== null
  const canApprove = Boolean(upload.rightsAttestedAt)
  const dialog = CONFIRM[confirming]

  function openDialog(action: ConfirmedAction) {
    setConfirming(action)
    setMissing(false)
    setDialogError(null)
    setBarError(null)
    setDialogOpen(true)
  }

  async function run(action: ReviewAction) {
    setBarError(null)
    setDialogError(null)
    const result = await onDecide(action, note)
    if (result.ok) {
      setDialogOpen(false)
      setNote("")
      setNoteOpen(false)
    } else if (action === "approve") {
      setBarError(result.message)
    } else {
      setDialogError(result.message)
    }
  }

  function confirm(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    if (dialog.missing && !note.trim()) {
      setMissing(true)
      return
    }
    void run(confirming)
  }

  function submitOnModEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <footer className="shrink-0 space-y-3 border-t border-border px-4 py-3 sm:px-6">
      {!canApprove ? (
        <p className="text-amber flex items-start gap-2 text-xs">
          <TriangleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
          This upload has no rights declaration, so it cannot be approved.
          Reject it and ask the uploader to submit again from the latest
          MacWall.
        </p>
      ) : null}

      {barError ? <Notice>{barError}</Notice> : null}

      {noteOpen ? (
        <div className="flex items-start gap-1.5">
          <Field
            label="Note to the uploader"
            htmlFor={inlineNoteId}
            optional
            hint="Sent with your decision and shown in the MacWall app."
            className="flex-1"
          >
            <Textarea
              id={inlineNoteId}
              autoFocus
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={NOTE_MAX_LENGTH}
              placeholder="Anything the uploader should know"
              className="max-h-32 min-h-9 rounded-[10px]"
            />
          </Field>
          <IconButton
            label="Remove note"
            className="mt-[22px] shrink-0"
            onClick={() => {
              setNote("")
              setNoteOpen(false)
            }}
          >
            <X aria-hidden />
          </IconButton>
        </div>
      ) : null}

      {/* Phones: the primary action on its own row, the rest below it. From a
          576px pane up: one row, destructive left, primary right. */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="destructive"
          className="order-2 flex-1 @xl:order-none @xl:flex-none"
          disabled={busy}
          onClick={() => openDialog("reject")}
        >
          <X aria-hidden />
          Reject
        </Button>
        <Button
          variant="ghost"
          title="Block uploader"
          className="text-soft order-5 px-2.5 @xl:order-none @3xl:px-3"
          disabled={busy}
          onClick={() => openDialog("block")}
        >
          <Ban aria-hidden />
          <span className="sr-only @3xl:not-sr-only">Block uploader</span>
        </Button>

        <span aria-hidden className="hidden flex-1 @xl:block" />

        {noteOpen ? null : (
          <Button
            variant="ghost"
            title="Add a note for the uploader"
            className="text-soft order-4 px-2.5 @xl:order-none @3xl:px-3"
            disabled={busy}
            onClick={() => setNoteOpen(true)}
          >
            <MessageSquarePlus aria-hidden />
            <span className="sr-only @3xl:not-sr-only">Add note</span>
          </Button>
        )}
        <Button
          variant="outline"
          className="order-3 flex-1 @xl:order-none @xl:flex-none"
          disabled={busy}
          onClick={() => openDialog("request-info")}
        >
          <MessageCircleQuestion aria-hidden />
          Request info
        </Button>
        <Button
          className="order-1 w-full @xl:order-none @xl:w-auto"
          disabled={busy || !canApprove}
          onClick={() => void run("approve")}
        >
          {acting === "approve" ? (
            <Spinner className="text-current" />
          ) : (
            <Check aria-hidden />
          )}
          Approve and publish
        </Button>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          // Stays open while the request is in flight.
          if (!busy) setDialogOpen(open)
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="gap-0 rounded-[14px] p-0 sm:max-w-[460px]"
        >
          <form onSubmit={confirm}>
            <DialogHeader className="px-5 pt-5">
              <DialogTitle className="text-[15px] leading-snug font-semibold tracking-[-0.01em]">
                {dialog.title}
              </DialogTitle>
              <DialogDescription className="text-[13px] text-pretty">
                {dialog.description(`“${upload.title}”`)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 px-5 pt-4 pb-5">
              <Field
                label={dialog.field}
                htmlFor={dialogNoteId}
                optional={!dialog.missing}
                hint={dialog.hint}
                error={missing ? dialog.missing : undefined}
              >
                <Textarea
                  id={dialogNoteId}
                  value={note}
                  onChange={(event) => {
                    setNote(event.target.value)
                    if (missing) setMissing(false)
                  }}
                  onKeyDown={submitOnModEnter}
                  maxLength={NOTE_MAX_LENGTH}
                  placeholder={dialog.placeholder}
                  aria-invalid={missing || undefined}
                  className="max-h-48 min-h-24 rounded-[10px]"
                />
              </Field>
              {dialogError ? <Notice>{dialogError}</Notice> : null}
            </div>

            <DialogFooter className="border-t border-border px-5 py-3">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={dialog.destructive ? "destructive" : "default"}
                disabled={busy}
              >
                {acting === confirming ? (
                  <Spinner className="text-current" />
                ) : null}
                {dialog.confirm}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </footer>
  )
}
