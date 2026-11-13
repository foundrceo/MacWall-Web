"use client"

/**
 * One deal in a side panel: progress with its two quick actions, the facts,
 * contact details to copy into a UPI or mail app, and the notes.
 */

import { ExternalLink, Pencil, Trash2 } from "lucide-react"
import type { ReactNode } from "react"

import { CreatorContact } from "@/components/admin/creators/creator-contact"
import {
  CONTENT_META,
  CONTENT_STATUSES,
  PAYMENT_META,
  describeDue,
  formatMoney,
  formatTimestampDay,
  profileUrl,
  type ContentStatus,
  type CreatorDeal,
} from "@/components/admin/creators/deals"
import {
  Avatar,
  Badge,
  Meter,
  Spinner,
  StatusDot,
  toneText,
  type Tone,
} from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatRelativeTime } from "@/lib/admin/format"
import { cn } from "@/lib/utils"

type DetailProps = Readonly<{
  deal: CreatorDeal
  /** A quick action is running on this deal. */
  busy: boolean
  onReelDone: (deal: CreatorDeal) => void
  onPaidFull: (deal: CreatorDeal) => void
  onContentStatus: (deal: CreatorDeal, status: ContentStatus) => void
  onEdit: (deal: CreatorDeal) => void
  onRemove: (deal: CreatorDeal) => void
}>

export function CreatorDetail({
  deal,
  open,
  onOpenChange,
  ...props
}: Readonly<
  Omit<DetailProps, "deal"> & {
    deal: CreatorDeal | null
    open: boolean
    onOpenChange: (open: boolean) => void
  }
>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full! gap-0 border-border bg-background p-0 sm:max-w-[440px]!">
        {deal ? (
          <DetailBody deal={deal} {...props} />
        ) : (
          <>
            <SheetTitle className="sr-only">Creator</SheetTitle>
            <SheetDescription className="sr-only">
              No creator selected.
            </SheetDescription>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function DetailBody({
  deal,
  busy,
  onReelDone,
  onPaidFull,
  onContentStatus,
  onEdit,
  onRemove,
}: DetailProps) {
  const content = CONTENT_META[deal.contentStatus]
  const payment = PAYMENT_META[deal.paymentStatus]
  const due = describeDue(deal)
  const reelsIn =
    deal.reelsPromised > 0 && deal.reelsDelivered >= deal.reelsPromised
  const owed = deal.balanceAmount > 0 && deal.paymentStatus !== "cancelled"
  const added = formatRelativeTime(deal.createdAt)
  const updated = formatRelativeTime(deal.updatedAt)

  return (
    <>
      <header className="flex items-start gap-3 border-b border-border py-4 pr-14 pl-5">
        <Avatar name={deal.creatorName} size="lg" />
        <div className="min-w-0 flex-1">
          <SheetTitle className="truncate text-[15px] leading-tight font-semibold tracking-[-0.01em]">
            {deal.creatorName}
          </SheetTitle>
          <SheetDescription className="mt-0.5 truncate text-[13px]">
            <a
              href={profileUrl(deal.instagramHandle)}
              target="_blank"
              rel="noreferrer"
              className="rounded-sm underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              @{deal.instagramHandle}
            </a>
          </SheetDescription>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <Badge tone={content.tone} dot>
              {content.label}
            </Badge>
            <Badge tone={payment.tone} dot>
              {payment.label}
            </Badge>
            {busy ? (
              <span role="status" className="ml-1 inline-flex">
                <Spinner className="size-3.5" />
                <span className="sr-only">Saving</span>
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
        <section aria-label="Progress" className="space-y-4 px-5 py-4">
          <Progress
            label="Reels"
            summary={`${deal.reelsDelivered} of ${deal.reelsPromised} delivered`}
            value={deal.reelsDelivered}
            max={deal.reelsPromised}
            tone={reelsIn ? "green" : "blue"}
            action={
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => onReelDone(deal)}
              >
                +1 reel done
              </Button>
            }
          />
          <Progress
            label="Payment"
            summary={`${formatMoney(deal.paidAmount, deal.currency)} of ${formatMoney(deal.agreedAmount, deal.currency)} paid`}
            value={deal.paidAmount}
            max={deal.agreedAmount}
            tone="green"
            action={
              deal.balanceAmount > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => onPaidFull(deal)}
                >
                  Mark paid in full
                </Button>
              ) : null
            }
          />
        </section>

        <section aria-labelledby="creator-detail-deal" className="px-5 py-4">
          <SectionTitle id="creator-detail-deal">Deal</SectionTitle>
          <dl className="mt-2">
            <Fact label="Content status">
              <Select
                value={deal.contentStatus}
                onValueChange={(value) =>
                  onContentStatus(deal, value as ContentStatus)
                }
                disabled={busy}
              >
                <SelectTrigger
                  size="sm"
                  aria-label="Content status"
                  className="w-36"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  {CONTENT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      <StatusDot tone={CONTENT_META[status].tone} />
                      {CONTENT_META[status].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Fact>
            <Fact label="Balance left">
              <span
                className={cn("tabular-nums", owed ? "text-amber" : undefined)}
              >
                {deal.balanceAmount > 0
                  ? formatMoney(deal.balanceAmount, deal.currency)
                  : "Settled"}
              </span>
            </Fact>
            <Fact label="Due">
              {due ? (
                <>
                  <span
                    className={
                      due.tone === "neutral" ? undefined : toneText[due.tone]
                    }
                  >
                    {due.label}
                  </span>
                  {due.label !== due.date ? (
                    <span className="font-normal text-muted-foreground">
                      {" · "}
                      {due.date}
                    </span>
                  ) : null}
                </>
              ) : (
                <Unset>Not set</Unset>
              )}
            </Fact>
            {deal.paidAt ? (
              <Fact label="Paid on">{formatTimestampDay(deal.paidAt)}</Fact>
            ) : null}
            <Fact label="Posted reel">
              {deal.contentLink ? (
                <a
                  href={deal.contentLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue inline-flex items-center gap-1.5 rounded-sm underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Open link
                  <ExternalLink aria-hidden className="size-3.5" />
                </a>
              ) : (
                <Unset>Not added</Unset>
              )}
            </Fact>
          </dl>
        </section>

        <section aria-labelledby="creator-detail-contact" className="px-5 py-4">
          <SectionTitle id="creator-detail-contact">Contact</SectionTitle>
          <CreatorContact deal={deal} onAdd={() => onEdit(deal)} />
        </section>

        <section aria-labelledby="creator-detail-notes" className="px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <SectionTitle id="creator-detail-notes">Notes</SectionTitle>
            <Button variant="ghost" size="xs" onClick={() => onEdit(deal)}>
              {deal.notes ? "Edit" : "Add"}
            </Button>
          </div>
          {deal.notes ? (
            <p className="text-soft mt-2 text-[13px] leading-relaxed break-words whitespace-pre-wrap">
              {deal.notes}
            </p>
          ) : (
            <p className="mt-2 text-[13px] text-muted-foreground">
              No notes yet.
            </p>
          )}
          {added ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Added {added.toLowerCase()}
              {updated && deal.updatedAt !== deal.createdAt
                ? ` · updated ${updated.toLowerCase()}`
                : ""}
            </p>
          ) : null}
        </section>
      </div>

      <footer className="flex items-center justify-between gap-2 border-t border-border px-5 py-3">
        <Button
          variant="destructive"
          size="sm"
          disabled={busy}
          onClick={() => onRemove(deal)}
        >
          <Trash2 aria-hidden />
          Remove
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(deal)}>
          <Pencil aria-hidden />
          Edit deal
        </Button>
      </footer>
    </>
  )
}

function SectionTitle({
  id,
  children,
}: Readonly<{ id: string; children: ReactNode }>) {
  return (
    <h3 id={id} className="text-[13px] font-medium text-foreground">
      {children}
    </h3>
  )
}

function Unset({ children }: Readonly<{ children: ReactNode }>) {
  return <span className="font-normal text-muted-foreground">{children}</span>
}

/** A count against its target: summary, quick action, meter. */
function Progress({
  label,
  summary,
  value,
  max,
  tone,
  action,
}: Readonly<{
  label: string
  summary: string
  value: number
  max: number
  tone: Tone
  action: ReactNode
}>) {
  return (
    <div>
      <div className="flex min-h-9 items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-0.5 truncate text-[13px] font-medium text-foreground tabular-nums">
            {summary}
          </p>
        </div>
        {action}
      </div>
      <Meter
        value={value}
        max={max}
        tone={tone}
        label={`${label}: ${summary}`}
        className="mt-2.5"
      />
    </div>
  )
}

function Fact({
  label,
  children,
}: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-4">
      <dt className="shrink-0 text-[13px] text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-[13px] font-medium text-foreground">
        {children}
      </dd>
    </div>
  )
}
