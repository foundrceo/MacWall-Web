"use client"

/**
 * Creators — one line per creator.
 * Reels promised vs done, agreed vs paid vs left, content + payment status.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AtSign,
  CircleCheck,
  CircleDollarSign,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Mail,
  MoreVertical,
  NotebookText,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  Wallet,
} from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { AdminEmptyState, AdminNotice } from "@/components/admin/admin-states"
import {
  AdminSkeleton,
  AdminSkeletonReveal,
} from "@/components/admin/admin-skeleton-reveal"
import {
  AdminAvatar,
  AdminBadge,
  PanelHeader,
  StatCard,
  StatCardSkeleton,
  type Tone,
} from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type ContentStatus =
  "contacted" | "agreed" | "in_progress" | "delivered" | "posted" | "cancelled"

type PaymentStatus = "unpaid" | "partial" | "paid" | "cancelled"

type CreatorDeal = {
  id: string
  creatorName: string
  instagramHandle: string
  reelsPromised: number
  reelsDelivered: number
  agreedAmount: number
  paidAmount: number
  balanceAmount: number
  currency: string
  email: string | null
  phone: string | null
  upiId: string | null
  contentStatus: ContentStatus
  paymentStatus: PaymentStatus
  contentLink: string | null
  dueDate: string | null
  paidAt: string | null
  notes: string | null
}

const CONTENT_META: Record<ContentStatus, { label: string; tone: Tone }> = {
  contacted: { label: "Contacted", tone: "neutral" },
  agreed: { label: "Agreed", tone: "blue" },
  in_progress: { label: "Making", tone: "violet" },
  delivered: { label: "Delivered", tone: "amber" },
  posted: { label: "Posted", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
}

const PAYMENT_META: Record<PaymentStatus, { label: string; tone: Tone }> = {
  unpaid: { label: "Unpaid", tone: "amber" },
  partial: { label: "Partial", tone: "blue" },
  paid: { label: "Paid", tone: "green" },
  cancelled: { label: "Cancelled", tone: "neutral" },
}

type FormState = {
  creatorName: string
  instagramHandle: string
  reelsPromised: string
  reelsDelivered: string
  agreedAmount: string
  paidAmount: string
  currency: string
  email: string
  phone: string
  upiId: string
  contentStatus: ContentStatus
  paymentStatus: PaymentStatus
  contentLink: string
  dueDate: string
  notes: string
}

const EMPTY_FORM: FormState = {
  creatorName: "",
  instagramHandle: "",
  reelsPromised: "1",
  reelsDelivered: "0",
  agreedAmount: "",
  paidAmount: "",
  currency: "INR",
  email: "",
  phone: "",
  upiId: "",
  contentStatus: "contacted",
  paymentStatus: "unpaid",
  contentLink: "",
  dueDate: "",
  notes: "",
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount}`
  }
}

function profileUrl(handle: string) {
  return `https://instagram.com/${handle.replace(/^@+/, "").trim()}`
}

/** Payment status derived from numbers — cancelled stays manual. */
function derivePayment(
  paid: number,
  agreed: number,
  current: PaymentStatus
): PaymentStatus {
  if (current === "cancelled") return "cancelled"
  if (agreed > 0 && paid >= agreed) return "paid"
  if (paid > 0) return "partial"
  return "unpaid"
}

function toCsv(deals: CreatorDeal[]) {
  const head = [
    "creator",
    "instagram_handle",
    "instagram_profile",
    "reels_done",
    "reels_promised",
    "agreed",
    "paid",
    "balance_left",
    "currency",
    "email",
    "phone",
    "upi_id",
    "content_status",
    "payment_status",
    "due_date",
    "notes",
  ]
  const esc = (v: string | number | null | undefined) => {
    const s = String(v ?? "")
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = deals.map((d) =>
    [
      d.creatorName,
      `@${d.instagramHandle}`,
      profileUrl(d.instagramHandle),
      d.reelsDelivered,
      d.reelsPromised,
      d.agreedAmount,
      d.paidAmount,
      d.balanceAmount,
      d.currency,
      d.email ?? "",
      d.phone ?? "",
      d.upiId ?? "",
      d.contentStatus,
      d.paymentStatus,
      d.dueDate ?? "",
      (d.notes ?? "").replace(/\n/g, " "),
    ]
      .map(esc)
      .join(",")
  )
  return [head.join(","), ...lines].join("\n")
}

function CreatorTableSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="flex items-center gap-3 border-b border-[var(--admin-border)] px-5 py-2.5">
        <AdminSkeleton className="h-3 w-20 rounded" />
        <AdminSkeleton className="h-3 w-12 rounded" />
        <AdminSkeleton className="ml-auto h-3 w-14 rounded" />
        <AdminSkeleton className="h-3 w-14 rounded" />
        <AdminSkeleton className="h-3 w-14 rounded" />
        <AdminSkeleton className="h-3 w-16 rounded" />
        <AdminSkeleton className="h-3 w-12 rounded" />
      </div>
      <div className="space-y-1 p-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2">
            <AdminSkeleton className="size-7 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <AdminSkeleton className="h-3.5 w-2/5 rounded-md" />
              <AdminSkeleton className="h-3 w-3/5 rounded-md" />
            </div>
            <AdminSkeleton className="hidden h-6 w-16 shrink-0 rounded-md sm:block" />
            <AdminSkeleton className="hidden h-6 w-16 shrink-0 rounded-md md:block" />
            <AdminSkeleton className="hidden h-6 w-16 shrink-0 rounded-md md:block" />
            <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
              <AdminSkeleton className="h-5 w-14 rounded-md" />
              <AdminSkeleton className="h-5 w-14 rounded-md" />
            </div>
            <AdminSkeleton className="size-7 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminCreatorsPage() {
  const [deals, setDeals] = useState<CreatorDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [contentFilter, setContentFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CreatorDeal | null>(null)
  const [contactDeal, setContactDeal] = useState<CreatorDeal | null>(null)
  const [notesDeal, setNotesDeal] = useState<CreatorDeal | null>(null)
  const [deleteDeal, setDeleteDeal] = useState<CreatorDeal | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [actingId, setActingId] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300)
    return () => window.clearTimeout(timer)
  }, [search])

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (opts?.silent) setRefreshing(true)
      else setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim())
        if (contentFilter !== "all") params.set("content", contentFilter)
        if (paymentFilter !== "all") params.set("payment", paymentFilter)
        const res = await fetch(`/api/admin/creators?${params.toString()}`, {
          cache: "no-store",
          credentials: "same-origin",
        })
        const json = (await res.json()) as {
          deals?: CreatorDeal[]
          error?: string
        }
        if (!res.ok) throw new Error(json.error ?? "Failed to load creators")
        setDeals(json.deals ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load creators")
        setDeals([])
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [debouncedSearch, contentFilter, paymentFilter]
  )

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [load])

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [message])

  const stats = useMemo(() => {
    const reelsPromised = deals.reduce((s, d) => s + d.reelsPromised, 0)
    const reelsDone = deals.reduce((s, d) => s + d.reelsDelivered, 0)
    const agreed = deals.reduce((s, d) => s + d.agreedAmount, 0)
    const paid = deals.reduce((s, d) => s + d.paidAmount, 0)
    return {
      creators: deals.length,
      reelsPromised,
      reelsDone,
      agreed,
      paid,
      left: agreed - paid,
    }
  }, [deals])

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(deal: CreatorDeal) {
    setEditing(deal)
    setForm({
      creatorName: deal.creatorName,
      instagramHandle: deal.instagramHandle,
      reelsPromised: String(deal.reelsPromised),
      reelsDelivered: String(deal.reelsDelivered),
      agreedAmount: String(deal.agreedAmount ?? ""),
      paidAmount: String(deal.paidAmount ?? ""),
      currency: deal.currency,
      email: deal.email ?? "",
      phone: deal.phone ?? "",
      upiId: deal.upiId ?? "",
      contentStatus: deal.contentStatus,
      paymentStatus: deal.paymentStatus,
      contentLink: deal.contentLink ?? "",
      dueDate: deal.dueDate ?? "",
      notes: deal.notes ?? "",
    })
    setDialogOpen(true)
  }

  async function save() {
    if (!form.creatorName.trim() || !form.instagramHandle.trim()) {
      setError("Creator name and Instagram handle are required.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const promised = Number(form.reelsPromised || 0)
      const delivered = Number(form.reelsDelivered || 0)
      const agreed = Number(form.agreedAmount || 0)
      const paid = Number(form.paidAmount || 0)
      const payload = {
        creatorName: form.creatorName.trim(),
        instagramHandle: form.instagramHandle.trim(),
        deliverable: `${promised} reel${promised === 1 ? "" : "s"}`,
        reelsPromised: promised,
        reelsDelivered: delivered,
        agreedAmount: agreed,
        paidAmount: paid,
        currency: form.currency.trim().toUpperCase() || "INR",
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        upiId: form.upiId.trim() || null,
        contentStatus: form.contentStatus,
        paymentStatus: derivePayment(paid, agreed, form.paymentStatus),
        contentLink: form.contentLink.trim() || null,
        dueDate: form.dueDate || null,
        notes: form.notes.trim() || null,
      }
      const res = await fetch(
        editing ? `/api/admin/creators/${editing.id}` : "/api/admin/creators",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(payload),
        }
      )
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error ?? "Save failed")
      setDialogOpen(false)
      setMessage(
        editing
          ? `Updated ${payload.creatorName}.`
          : `Added ${payload.creatorName} to the tracker.`
      )
      await load({ silent: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function patchDeal(
    deal: CreatorDeal,
    patch: Record<string, unknown>,
    label: string
  ) {
    setActingId(deal.id)
    try {
      const res = await fetch(`/api/admin/creators/${deal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(patch),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error ?? "Update failed")
      setMessage(`${label} — ${deal.creatorName}.`)
      await load({ silent: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed")
    } finally {
      setActingId(null)
    }
  }

  /** One more reel done. Auto-marks content posted when all promised are in. */
  function reelDone(deal: CreatorDeal) {
    const delivered = deal.reelsDelivered + 1
    const allIn = deal.reelsPromised > 0 && delivered >= deal.reelsPromised
    void patchDeal(
      deal,
      {
        reelsDelivered: delivered,
        ...(allIn ? { contentStatus: "posted" } : {}),
      },
      `Reel ${delivered}/${deal.reelsPromised} done`
    )
  }

  /** Full balance cleared. */
  function paidFull(deal: CreatorDeal) {
    void patchDeal(
      deal,
      { paidAmount: deal.agreedAmount, paymentStatus: "paid" },
      `Paid ${formatMoney(deal.balanceAmount, deal.currency)} in full`
    )
  }

  async function remove(deal: CreatorDeal) {
    setDeleteDeal(null)
    setActingId(deal.id)
    try {
      const res = await fetch(`/api/admin/creators/${deal.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error ?? "Delete failed")
      setMessage(`Removed ${deal.creatorName}.`)
      await load({ silent: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed")
    } finally {
      setActingId(null)
    }
  }

  function copyContact(key: string, value: string) {
    window.setTimeout(() => setCopiedKey(null), 1500)
    setCopiedKey(key)
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(value).catch(() => undefined)
    }
  }

  function exportCsv() {
    const blob = new Blob([toCsv(deals)], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `creators-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminShell
      title="Creators"
      subtitle="One line per creator — reels done, money paid, balance left"
      largeTitle
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={deals.length === 0}
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load({ silent: true })}
            disabled={refreshing}
            aria-label="Refresh creators"
          >
            <RefreshCw
              className={cn(
                "size-3.5",
                refreshing && "animate-spin motion-reduce:animate-none"
              )}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="size-3.5" />
            Add creator
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {error ? <AdminNotice>{error}</AdminNotice> : null}
        {message ? <AdminNotice tone="success">{message}</AdminNotice> : null}

        <AdminSkeletonReveal
          loading={loading}
          skeleton={
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Creators"
              value={stats.creators}
              hint="One line each"
              icon={<Users className="size-4" />}
            />
            <StatCard
              label="Reels done"
              value={`${stats.reelsDone}/${stats.reelsPromised}`}
              hint="Delivered of promised"
              icon={<Clock className="size-4" />}
            />
            <StatCard
              label="Balance left"
              value={formatMoney(stats.left, "INR")}
              hint={stats.left > 0 ? "Still to pay" : "All settled"}
              icon={<CircleDollarSign className="size-4" />}
            />
            <StatCard
              label="Paid out"
              value={formatMoney(stats.paid, "INR")}
              hint={`Of ${formatMoney(stats.agreed, "INR")} agreed`}
              icon={<CircleCheck className="size-4" />}
            />
          </div>
        </AdminSkeletonReveal>

        <Card className="gap-0 overflow-hidden py-0">
          <PanelHeader
            title="Deal sheet"
            description="Tap @handle to open Instagram. +Reel when content lands, Paid full when money goes."
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or @handle…"
                  aria-label="Search creators"
                  className="h-8 w-48"
                />
                <Select value={contentFilter} onValueChange={setContentFilter}>
                  <SelectTrigger size="sm" className="h-8 w-36">
                    <SelectValue placeholder="Content" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All content</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="agreed">Agreed</SelectItem>
                    <SelectItem value="in_progress">Making</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger size="sm" className="h-8 w-32">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All payments</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
          />

          {loading || deals.length > 0 ? (
            <AdminSkeletonReveal
              loading={loading}
              skeleton={<CreatorTableSkeleton />}
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-5">Creator</TableHead>
                      <TableHead>Reels</TableHead>
                      <TableHead className="text-right">Agreed</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Left</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="pr-5 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deals.map((deal) => {
                      const content = CONTENT_META[deal.contentStatus]
                      const payment = PAYMENT_META[deal.paymentStatus]
                      const busy = actingId === deal.id
                      const pct =
                        deal.reelsPromised > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (deal.reelsDelivered / deal.reelsPromised) * 100
                              )
                            )
                          : 0
                      return (
                        <TableRow key={deal.id}>
                          <TableCell className="pl-5">
                            <div className="flex items-center gap-2.5">
                              <AdminAvatar name={deal.creatorName} size="sm" />
                              <div className="min-w-0 leading-tight">
                                <p className="truncate text-[13px] font-semibold text-[var(--admin-fg)]">
                                  {deal.creatorName}
                                </p>
                                <a
                                  href={profileUrl(deal.instagramHandle)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 truncate text-xs text-[var(--admin-blue-fg)] hover:underline"
                                >
                                  <AtSign className="size-3" />
                                  {deal.instagramHandle}
                                </a>
                                {deal.email || deal.phone ? (
                                  <button
                                    type="button"
                                    onClick={() => setContactDeal(deal)}
                                    className="mt-0.5 inline-flex items-center gap-1.5 text-[11px] text-[var(--admin-muted)] hover:text-[var(--admin-fg)]"
                                    title="View contact details"
                                  >
                                    {deal.email ? (
                                      <Mail className="size-3" />
                                    ) : null}
                                    {deal.phone ? (
                                      <Phone className="size-3" />
                                    ) : null}
                                    <span className="truncate">
                                      {deal.phone ?? deal.email}
                                    </span>
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="min-w-24">
                              <p className="text-[13px] font-semibold text-[var(--admin-fg)] tabular-nums">
                                {deal.reelsDelivered}
                                <span className="font-normal text-[var(--admin-muted)]">
                                  /{deal.reelsPromised}
                                </span>
                              </p>
                              <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-[var(--admin-fill)]">
                                <div
                                  className="h-full rounded-full bg-[var(--admin-green)] transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-[13px] text-[var(--admin-muted)] tabular-nums">
                            {formatMoney(deal.agreedAmount, deal.currency)}
                          </TableCell>
                          <TableCell className="text-right text-[13px] text-[var(--admin-fg)] tabular-nums">
                            {formatMoney(deal.paidAmount, deal.currency)}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right text-[13px] font-semibold tabular-nums",
                              deal.balanceAmount > 0
                                ? "text-[var(--admin-amber-fg)]"
                                : "text-[var(--admin-green-fg)]"
                            )}
                          >
                            {deal.balanceAmount > 0
                              ? formatMoney(deal.balanceAmount, deal.currency)
                              : "Settled"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <AdminBadge tone={content.tone}>
                                {content.label}
                              </AdminBadge>
                              <AdminBadge tone={payment.tone}>
                                {payment.label}
                              </AdminBadge>
                            </div>
                            {deal.dueDate ? (
                              <p className="mt-1 text-xs text-[var(--admin-muted)]">
                                Due {deal.dueDate}
                              </p>
                            ) : null}
                          </TableCell>
                          <TableCell className="pr-5">
                            <div className="flex items-center justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    disabled={busy}
                                    aria-label={`More options for ${deal.creatorName}`}
                                  >
                                    <MoreVertical className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-52 border-[var(--admin-border)] bg-[var(--admin-surface)]"
                                >
                                  <DropdownMenuItem
                                    onSelect={() => setContactDeal(deal)}
                                  >
                                    <AtSign className="size-4" />
                                    Contact details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() => setNotesDeal(deal)}
                                  >
                                    <NotebookText className="size-4" />
                                    Deal notes
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() => reelDone(deal)}
                                  >
                                    <CircleCheck className="size-4" />
                                    +1 reel done ({deal.reelsDelivered + 1}/
                                    {deal.reelsPromised})
                                  </DropdownMenuItem>
                                  {deal.balanceAmount > 0 ? (
                                    <DropdownMenuItem
                                      onSelect={() => paidFull(deal)}
                                    >
                                      <Wallet className="size-4" />
                                      Paid in full (
                                      {formatMoney(
                                        deal.balanceAmount,
                                        deal.currency
                                      )}
                                      )
                                    </DropdownMenuItem>
                                  ) : null}
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      window.open(
                                        profileUrl(deal.instagramHandle),
                                        "_blank",
                                        "noreferrer"
                                      )
                                    }
                                  >
                                    <ExternalLink className="size-4" />
                                    Open Instagram
                                  </DropdownMenuItem>
                                  {deal.contentLink ? (
                                    <DropdownMenuItem
                                      onSelect={() =>
                                        window.open(
                                          deal.contentLink as string,
                                          "_blank",
                                          "noreferrer"
                                        )
                                      }
                                    >
                                      <ExternalLink className="size-4" />
                                      Open posted reel
                                    </DropdownMenuItem>
                                  ) : null}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onSelect={() => openEdit(deal)}
                                  >
                                    <Pencil className="size-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={() => setDeleteDeal(deal)}
                                  >
                                    <Trash2 className="size-4" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </AdminSkeletonReveal>
          ) : (
            <AdminEmptyState
              icon={<AtSign className="size-6" />}
              title="No creators here"
              description="Add your first deal — reels promised, amount agreed, and track done vs paid."
              action={
                <Button size="sm" onClick={openAdd}>
                  Add creator
                </Button>
              }
            />
          )}
        </Card>

        <p className="text-xs text-[var(--admin-muted)]">
          Left = agreed minus paid. Payment badge flips to Partial/Paid on its
          own when you update the paid amount. Chats stay in Instagram DM.
        </p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-[var(--admin-border)] bg-[var(--admin-surface)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${editing.creatorName}` : "Add creator deal"}
            </DialogTitle>
            <DialogDescription>
              One line per creator — reels promised vs done, money agreed vs
              paid.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="creator-name">Creator name *</Label>
              <Input
                id="creator-name"
                value={form.creatorName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, creatorName: e.target.value }))
                }
                placeholder="e.g. Shrasti Agarwal"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="creator-handle">Instagram handle *</Label>
              <Input
                id="creator-handle"
                value={form.instagramHandle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, instagramHandle: e.target.value }))
                }
                placeholder="@username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="creator-promised">Reels promised</Label>
              <Input
                id="creator-promised"
                inputMode="numeric"
                value={form.reelsPromised}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reelsPromised: e.target.value }))
                }
                placeholder="3"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="creator-done">Reels done</Label>
              <Input
                id="creator-done"
                inputMode="numeric"
                value={form.reelsDelivered}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reelsDelivered: e.target.value }))
                }
                placeholder="1"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="creator-agreed">Agreed ₹ (total)</Label>
              <Input
                id="creator-agreed"
                inputMode="numeric"
                value={form.agreedAmount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, agreedAmount: e.target.value }))
                }
                placeholder="3000"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="creator-paid">Paid ₹</Label>
                <Input
                  id="creator-paid"
                  inputMode="numeric"
                  value={form.paidAmount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, paidAmount: e.target.value }))
                  }
                  placeholder="1500"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Content status</Label>
              <Select
                value={form.contentStatus}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, contentStatus: v as ContentStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CONTENT_META) as ContentStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {CONTENT_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Payment status</Label>
              <Select
                value={form.paymentStatus}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, paymentStatus: v as PaymentStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PAYMENT_META) as PaymentStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {PAYMENT_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="creator-due">Due date</Label>
              <Input
                id="creator-due"
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="creator-link">Posted link</Label>
              <Input
                id="creator-link"
                value={form.contentLink}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contentLink: e.target.value }))
                }
                placeholder="https://instagram.com/reel/…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="creator-email">Email</Label>
              <Input
                id="creator-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="creator@gmail.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="creator-phone">Phone</Label>
              <Input
                id="creator-phone"
                inputMode="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="98765 43210"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="creator-upi">UPI ID (for payouts)</Label>
              <Input
                id="creator-upi"
                value={form.upiId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, upiId: e.target.value }))
                }
                placeholder="name@upi"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="creator-notes">Notes / deal summary</Label>
              <Textarea
                id="creator-notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="e.g. 1500 paid 12 Sep via PhonePe, 2 new reels by 15 Oct"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add creator"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact details popup */}
      <Dialog
        open={contactDeal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setContactDeal(null)
            setCopiedKey(null)
          }
        }}
      >
        <DialogContent className="border-[var(--admin-border)] bg-[var(--admin-surface)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {contactDeal ? `Contact — ${contactDeal.creatorName}` : "Contact"}
            </DialogTitle>
            <DialogDescription>
              Tap copy to grab a detail for UPI apps or email.
            </DialogDescription>
          </DialogHeader>
          {contactDeal ? (
            <ul className="space-y-2">
              <li className="flex items-center justify-between gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-canvas)] px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <AtSign className="size-4 shrink-0 text-[var(--admin-muted)]" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium tracking-wider text-[var(--admin-muted)] uppercase">
                      Instagram
                    </p>
                    <a
                      href={profileUrl(contactDeal.instagramHandle)}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-[13px] font-medium text-[var(--admin-blue-fg)] hover:underline"
                    >
                      @{contactDeal.instagramHandle}
                    </a>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  asChild
                >
                  <a
                    href={profileUrl(contactDeal.instagramHandle)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                </Button>
              </li>
              {(
                [
                  {
                    key: "email",
                    label: "Email",
                    icon: Mail,
                    value: contactDeal.email,
                    href: contactDeal.email
                      ? `mailto:${contactDeal.email}`
                      : null,
                    action: "Mail",
                  },
                  {
                    key: "phone",
                    label: "Phone",
                    icon: Phone,
                    value: contactDeal.phone,
                    href: contactDeal.phone
                      ? `tel:${contactDeal.phone.replace(/\s/g, "")}`
                      : null,
                    action: "Call",
                  },
                  {
                    key: "upi",
                    label: "UPI ID",
                    icon: Wallet,
                    value: contactDeal.upiId,
                    href: null,
                    action: null,
                  },
                ] as const
              ).map((row) => (
                <li
                  key={row.key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-canvas)] px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <row.icon className="size-4 shrink-0 text-[var(--admin-muted)]" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium tracking-wider text-[var(--admin-muted)] uppercase">
                        {row.label}
                      </p>
                      <p className="truncate text-[13px] font-medium text-[var(--admin-fg)]">
                        {row.value ?? "Not added"}
                      </p>
                    </div>
                  </div>
                  {row.value ? (
                    <div className="flex shrink-0 items-center gap-1.5">
                      {row.href ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          asChild
                        >
                          <a href={row.href}>{row.action}</a>
                        </Button>
                      ) : null}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() =>
                          copyContact(
                            `${contactDeal.id}-${row.key}`,
                            row.value as string
                          )
                        }
                      >
                        <Copy className="size-3" />
                        {copiedKey === `${contactDeal.id}-${row.key}`
                          ? "Copied"
                          : "Copy"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        setContactDeal(null)
                        openEdit(contactDeal)
                      }}
                    >
                      Add
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Deal notes popup */}
      <Dialog
        open={notesDeal !== null}
        onOpenChange={(open) => {
          if (!open) setNotesDeal(null)
        }}
      >
        <DialogContent className="border-[var(--admin-border)] bg-[var(--admin-surface)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {notesDeal ? `Notes — ${notesDeal.creatorName}` : "Notes"}
            </DialogTitle>
            <DialogDescription>
              {notesDeal
                ? `${notesDeal.reelsDelivered}/${notesDeal.reelsPromised} reels · ${formatMoney(notesDeal.paidAmount, notesDeal.currency)} paid of ${formatMoney(notesDeal.agreedAmount, notesDeal.currency)}`
                : null}
            </DialogDescription>
          </DialogHeader>
          <p className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-canvas)] px-3 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap text-[var(--admin-fg-soft)]">
            {notesDeal?.notes ?? "No notes yet."}
          </p>
          <DialogFooter>
            {notesDeal ? (
              <Button
                variant="outline"
                onClick={() => {
                  setNotesDeal(null)
                  openEdit(notesDeal)
                }}
              >
                Edit notes
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm popup */}
      <Dialog
        open={deleteDeal !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteDeal(null)
        }}
      >
        <DialogContent className="border-[var(--admin-border)] bg-[var(--admin-surface)] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {deleteDeal ? `Remove ${deleteDeal.creatorName}?` : "Remove?"}
            </DialogTitle>
            <DialogDescription>
              {deleteDeal
                ? `This deletes @${deleteDeal.instagramHandle} and the full deal history. This can't be undone.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDeal(null)}>
              Keep
            </Button>
            <Button
              variant="destructive"
              disabled={actingId !== null}
              onClick={() => {
                if (deleteDeal) void remove(deleteDeal)
              }}
            >
              {actingId ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
