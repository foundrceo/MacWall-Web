"use client"

import {
  CircleCheck,
  ExternalLink,
  MoreHorizontal,
  PanelRight,
  Pencil,
  Trash2,
  Wallet,
} from "lucide-react"

import {
  CONTENT_META,
  PAYMENT_META,
  describeDue,
  formatMoney,
  profileUrl,
  type CreatorDeal,
} from "@/components/admin/creators/deals"
import {
  Avatar,
  Badge,
  Meter,
  Skeleton,
  Spinner,
  toneText,
} from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const headCell = "h-9 px-3 text-xs font-medium text-muted-foreground"
const bodyCell = "px-3 py-1.5"

/** Agreed and Paid drop out below `md`, Due below `lg`; Left always shows. */
function HeaderRow() {
  return (
    <TableHeader>
      <TableRow className="border-border hover:bg-transparent">
        <TableHead className={cn(headCell, "pl-4")}>Creator</TableHead>
        <TableHead className={headCell}>Reels</TableHead>
        <TableHead className={headCell}>Content</TableHead>
        <TableHead className={headCell}>Payment</TableHead>
        <TableHead className={cn(headCell, "hidden text-right md:table-cell")}>
          Agreed
        </TableHead>
        <TableHead className={cn(headCell, "hidden text-right md:table-cell")}>
          Paid
        </TableHead>
        <TableHead className={cn(headCell, "text-right")}>Left</TableHead>
        <TableHead className={cn(headCell, "hidden lg:table-cell")}>
          Due
        </TableHead>
        <TableHead className={cn(headCell, "w-11 pr-3")}>
          <span className="sr-only">Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

export function CreatorsTable({
  deals,
  actingId,
  stale,
  onOpen,
  onReelDone,
  onPaidFull,
  onEdit,
  onRemove,
}: Readonly<{
  deals: readonly CreatorDeal[]
  /** The deal a quick action is running on. */
  actingId: string | null
  /** A newer list is loading; rows stay but step back. */
  stale: boolean
  onOpen: (deal: CreatorDeal) => void
  onReelDone: (deal: CreatorDeal) => void
  onPaidFull: (deal: CreatorDeal) => void
  onEdit: (deal: CreatorDeal) => void
  onRemove: (deal: CreatorDeal) => void
}>) {
  return (
    <Table className="text-[13px]">
      <HeaderRow />
      <TableBody
        className={cn(
          "transition-opacity duration-150 motion-reduce:transition-none",
          stale && "opacity-60"
        )}
      >
        {deals.map((deal) => {
          const content = CONTENT_META[deal.contentStatus]
          const payment = PAYMENT_META[deal.paymentStatus]
          const due = describeDue(deal)
          const busy = actingId === deal.id
          const reelsIn =
            deal.reelsPromised > 0 && deal.reelsDelivered >= deal.reelsPromised
          const owed =
            deal.balanceAmount > 0 && deal.paymentStatus !== "cancelled"

          return (
            <TableRow
              key={deal.id}
              onClick={() => onOpen(deal)}
              className="hover:bg-fill/60 cursor-pointer border-border"
            >
              <TableCell className={cn(bodyCell, "pl-4")}>
                <div className="flex items-center gap-2.5">
                  <Avatar name={deal.creatorName} />
                  <div className="max-w-[150px] min-w-0 leading-tight sm:max-w-[220px]">
                    {/* The click bubbles to the row; the button makes the
                        row reachable and openable from the keyboard. */}
                    <button
                      type="button"
                      aria-label={`Open ${deal.creatorName}`}
                      className="block max-w-full truncate rounded-sm text-left font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {deal.creatorName}
                    </button>
                    <p className="truncate text-xs text-muted-foreground">
                      @{deal.instagramHandle}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell className={bodyCell}>
                <div className="flex items-center gap-2.5">
                  <span className="min-w-8 font-medium text-foreground tabular-nums">
                    {deal.reelsDelivered}
                    <span className="font-normal text-muted-foreground">
                      /{deal.reelsPromised}
                    </span>
                  </span>
                  <Meter
                    value={deal.reelsDelivered}
                    max={deal.reelsPromised}
                    tone={reelsIn ? "green" : "blue"}
                    label={`${deal.reelsDelivered} of ${deal.reelsPromised} reels delivered`}
                    className="hidden w-14 sm:block"
                  />
                </div>
              </TableCell>

              <TableCell className={bodyCell}>
                <Badge tone={content.tone} dot>
                  {content.label}
                </Badge>
              </TableCell>

              <TableCell className={bodyCell}>
                <Badge tone={payment.tone} dot>
                  {payment.label}
                </Badge>
              </TableCell>

              <TableCell
                className={cn(
                  bodyCell,
                  "hidden text-right text-muted-foreground tabular-nums md:table-cell"
                )}
              >
                {formatMoney(deal.agreedAmount, deal.currency)}
              </TableCell>

              <TableCell
                className={cn(
                  bodyCell,
                  "text-soft hidden text-right tabular-nums md:table-cell"
                )}
              >
                {formatMoney(deal.paidAmount, deal.currency)}
              </TableCell>

              <TableCell
                className={cn(
                  bodyCell,
                  "text-right tabular-nums",
                  owed ? "text-amber font-medium" : "text-muted-foreground"
                )}
              >
                {deal.balanceAmount > 0
                  ? formatMoney(deal.balanceAmount, deal.currency)
                  : "Settled"}
              </TableCell>

              <TableCell className={cn(bodyCell, "hidden lg:table-cell")}>
                {due ? (
                  <span
                    title={due.date}
                    className={cn(
                      due.tone === "neutral"
                        ? "text-muted-foreground"
                        : toneText[due.tone]
                    )}
                  >
                    {due.label}
                  </span>
                ) : (
                  <span className="text-faint">
                    <span aria-hidden>—</span>
                    <span className="sr-only">No due date</span>
                  </span>
                )}
              </TableCell>

              {/* Menu items portal out but still bubble here in React. */}
              <TableCell
                className={cn(bodyCell, "pr-3")}
                onClick={(event) => event.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={busy}
                      aria-label={`Actions for ${deal.creatorName}`}
                    >
                      {busy ? (
                        <Spinner className="size-3.5" />
                      ) : (
                        <MoreHorizontal aria-hidden />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuItem onSelect={() => onOpen(deal)}>
                      <PanelRight aria-hidden />
                      View deal, contact and notes
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => onReelDone(deal)}>
                      <CircleCheck aria-hidden />
                      <span className="flex-1">+1 reel done</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {deal.reelsDelivered + 1}/{deal.reelsPromised}
                      </span>
                    </DropdownMenuItem>
                    {deal.balanceAmount > 0 ? (
                      <DropdownMenuItem onSelect={() => onPaidFull(deal)}>
                        <Wallet aria-hidden />
                        <span className="flex-1">Mark paid in full</span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {formatMoney(deal.balanceAmount, deal.currency)}
                        </span>
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a
                        href={profileUrl(deal.instagramHandle)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink aria-hidden />
                        Open Instagram
                      </a>
                    </DropdownMenuItem>
                    {deal.contentLink ? (
                      <DropdownMenuItem asChild>
                        <a
                          href={deal.contentLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink aria-hidden />
                          Open posted reel
                        </a>
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => onEdit(deal)}>
                      <Pencil aria-hidden />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => onRemove(deal)}
                    >
                      <Trash2 aria-hidden />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

/** First load: the same columns, with bars where the values will be. */
export function CreatorsTableSkeleton({
  rows = 6,
}: Readonly<{ rows?: number }>) {
  return (
    <div role="status" aria-label="Loading creators">
      <Table className="text-[13px]">
        <HeaderRow />
        <TableBody>
          {Array.from({ length: rows }, (_, index) => (
            <TableRow
              key={index}
              className="border-border hover:bg-transparent"
            >
              <TableCell className={cn(bodyCell, "pl-4")}>
                <div className="flex items-center gap-2.5">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </div>
              </TableCell>
              <TableCell className={bodyCell}>
                <Skeleton className="h-3 w-16" />
              </TableCell>
              <TableCell className={bodyCell}>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell className={bodyCell}>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell className={cn(bodyCell, "hidden md:table-cell")}>
                <Skeleton className="ml-auto h-3 w-14" />
              </TableCell>
              <TableCell className={cn(bodyCell, "hidden md:table-cell")}>
                <Skeleton className="ml-auto h-3 w-14" />
              </TableCell>
              <TableCell className={bodyCell}>
                <Skeleton className="ml-auto h-3 w-14" />
              </TableCell>
              <TableCell className={cn(bodyCell, "hidden lg:table-cell")}>
                <Skeleton className="h-3 w-16" />
              </TableCell>
              <TableCell className={cn(bodyCell, "pr-3")}>
                <Skeleton className="size-7" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
