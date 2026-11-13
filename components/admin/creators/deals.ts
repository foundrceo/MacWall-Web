/**
 * Creator deals: types, status meaning, formatting, the form model and the
 * API calls. Everything the Creators screen shares between its files.
 */

import type { Tone } from "@/components/admin/ui"
import type {
  CreatorContentStatus,
  CreatorDeal,
  CreatorPaymentStatus,
} from "@/lib/admin/creators"

export type { CreatorDeal }
export type ContentStatus = CreatorContentStatus
export type PaymentStatus = CreatorPaymentStatus

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

/** Pipeline order, first contact to posted. */
export const CONTENT_STATUSES: readonly ContentStatus[] = [
  "contacted",
  "agreed",
  "in_progress",
  "delivered",
  "posted",
  "cancelled",
]

export const PAYMENT_STATUSES: readonly PaymentStatus[] = [
  "unpaid",
  "partial",
  "paid",
  "cancelled",
]

export const CONTENT_META: Record<
  ContentStatus,
  { label: string; tone: Tone }
> = {
  contacted: { label: "Contacted", tone: "neutral" },
  agreed: { label: "Agreed", tone: "blue" },
  in_progress: { label: "Making", tone: "blue" },
  delivered: { label: "Delivered", tone: "amber" },
  posted: { label: "Posted", tone: "green" },
  cancelled: { label: "Cancelled", tone: "neutral" },
}

export const PAYMENT_META: Record<
  PaymentStatus,
  { label: string; tone: Tone }
> = {
  unpaid: { label: "Unpaid", tone: "amber" },
  partial: { label: "Partial", tone: "blue" },
  paid: { label: "Paid", tone: "green" },
  cancelled: { label: "Cancelled", tone: "neutral" },
}

/** Derived from the amounts; cancelled is only ever set by hand. */
export function derivePayment(
  paid: number,
  agreed: number,
  current: PaymentStatus
): PaymentStatus {
  if (current === "cancelled") return "cancelled"
  if (agreed > 0 && paid >= agreed) return "paid"
  if (paid > 0) return "partial"
  return "unpaid"
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

/** Deals are mostly INR, so amounts use Indian grouping and no decimals. */
export function formatMoney(amount: number, currency: string) {
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

export function profileUrl(handle: string) {
  return `https://instagram.com/${handle.replace(/^@+/, "").trim()}`
}

export function reelsProgress(deal: CreatorDeal) {
  return `${deal.reelsDelivered}/${deal.reelsPromised}`
}

/** A `YYYY-MM-DD` date column read as a local calendar day. */
function parseDay(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

export function formatDay(value: string) {
  const date = parseDay(value)
  if (!date) return value
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  })
}

/** A timestamp as a calendar day: "Oct 15, 2026". */
export function formatTimestampDay(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export type DueInfo = {
  /** "In 3 days", "2 days overdue", "Oct 15". */
  label: string
  /** The calendar date, for tooltips and the detail panel. */
  date: string
  tone: Tone
}

/**
 * How close the due date is. Only deals still waiting on content can be
 * overdue; once it is delivered, posted or cancelled the date is history.
 */
export function describeDue(deal: CreatorDeal): DueInfo | null {
  if (!deal.dueDate) return null
  const due = parseDay(deal.dueDate)
  if (!due) return { label: deal.dueDate, date: deal.dueDate, tone: "neutral" }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000)
  const date = formatDay(deal.dueDate)
  const waiting =
    deal.contentStatus !== "delivered" &&
    deal.contentStatus !== "posted" &&
    deal.contentStatus !== "cancelled"
  const plural = (count: number) => (count === 1 ? "day" : "days")

  if (waiting && days < 0) {
    return { label: `${-days} ${plural(-days)} overdue`, date, tone: "red" }
  }
  if (days === 0) {
    return { label: "Today", date, tone: waiting ? "amber" : "neutral" }
  }
  if (days === 1) {
    return { label: "Tomorrow", date, tone: waiting ? "amber" : "neutral" }
  }
  if (days > 1 && days <= 14) {
    return {
      label: `In ${days} days`,
      date,
      tone: waiting && days <= 3 ? "amber" : "neutral",
    }
  }
  return { label: date, date, tone: "neutral" }
}

/* -------------------------------------------------------------------------- */
/* CSV                                                                        */
/* -------------------------------------------------------------------------- */

export function toCsv(deals: readonly CreatorDeal[]) {
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
  const escape = (value: string | number | null | undefined) => {
    const text = String(value ?? "")
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  const lines = deals.map((deal) =>
    [
      deal.creatorName,
      `@${deal.instagramHandle}`,
      profileUrl(deal.instagramHandle),
      deal.reelsDelivered,
      deal.reelsPromised,
      deal.agreedAmount,
      deal.paidAmount,
      deal.balanceAmount,
      deal.currency,
      deal.email ?? "",
      deal.phone ?? "",
      deal.upiId ?? "",
      deal.contentStatus,
      deal.paymentStatus,
      deal.dueDate ?? "",
      (deal.notes ?? "").replace(/\n/g, " "),
    ]
      .map(escape)
      .join(",")
  )
  return [head.join(","), ...lines].join("\n")
}

export function downloadCsv(deals: readonly CreatorDeal[]) {
  const blob = new Blob([toCsv(deals)], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `creators-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/* -------------------------------------------------------------------------- */
/* Form model                                                                 */
/* -------------------------------------------------------------------------- */

export type DealForm = {
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

export const EMPTY_FORM: DealForm = {
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

export function formFromDeal(deal: CreatorDeal): DealForm {
  return {
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
  }
}

/** Empty counts as zero; thousands separators are tolerated. */
export function parseAmount(value: string) {
  return Number(value.replace(/,/g, "").trim() || 0)
}

export type DealFormErrors = Partial<
  Record<
    | "creatorName"
    | "instagramHandle"
    | "reelsPromised"
    | "reelsDelivered"
    | "agreedAmount"
    | "paidAmount",
    string
  >
>

/** Field order here is the order errors are focused in. */
export const VALIDATED_FIELDS = [
  "creatorName",
  "instagramHandle",
  "reelsPromised",
  "reelsDelivered",
  "agreedAmount",
  "paidAmount",
] as const satisfies readonly (keyof DealFormErrors)[]

export function validateForm(form: DealForm): DealFormErrors {
  const errors: DealFormErrors = {}
  if (!form.creatorName.trim()) {
    errors.creatorName = "Enter the creator's name."
  }
  if (!form.instagramHandle.trim().replace(/^@+/, "").replace(/\/+$/, "")) {
    errors.instagramHandle = "Enter their Instagram handle."
  }
  for (const field of ["reelsPromised", "reelsDelivered"] as const) {
    const count = parseAmount(form[field])
    if (!Number.isInteger(count) || count < 0) {
      errors[field] = "Enter a whole number, 0 or more."
    }
  }
  for (const field of ["agreedAmount", "paidAmount"] as const) {
    const amount = parseAmount(form[field])
    if (!Number.isFinite(amount) || amount < 0) {
      errors[field] = "Enter an amount, digits only."
    }
  }
  return errors
}

export type DealPayload = ReturnType<typeof payloadFromForm>

/** The body for POST /api/admin/creators and PATCH /api/admin/creators/:id. */
export function payloadFromForm(form: DealForm) {
  const promised = parseAmount(form.reelsPromised)
  const delivered = parseAmount(form.reelsDelivered)
  const agreed = parseAmount(form.agreedAmount)
  const paid = parseAmount(form.paidAmount)
  return {
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
}

/* -------------------------------------------------------------------------- */
/* API                                                                        */
/* -------------------------------------------------------------------------- */

export type DealFilters = {
  search: string
  content: ContentStatus | "all"
  payment: PaymentStatus | "all"
}

/** A failed list request; `hint` says how to fix a missing table. */
export class LoadDealsError extends Error {
  hint?: string
  constructor(message: string, hint?: string) {
    super(message)
    this.name = "LoadDealsError"
    this.hint = hint
  }
}

export async function fetchDeals(filters: DealFilters, signal: AbortSignal) {
  const params = new URLSearchParams()
  if (filters.search) params.set("search", filters.search)
  if (filters.content !== "all") params.set("content", filters.content)
  if (filters.payment !== "all") params.set("payment", filters.payment)
  const res = await fetch(`/api/admin/creators?${params.toString()}`, {
    cache: "no-store",
    credentials: "same-origin",
    signal,
  })
  const json = (await res.json().catch(() => ({}))) as {
    deals?: CreatorDeal[]
    error?: string
    setupHint?: string
  }
  if (!res.ok) {
    throw new LoadDealsError(
      json.error ?? "The creators list didn't load.",
      json.setupHint
    )
  }
  return json.deals ?? []
}

async function send(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  body: unknown,
  fallback: string
) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    credentials: "same-origin",
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = (await res.json().catch(() => ({}))) as {
    deal?: CreatorDeal
    error?: string
  }
  if (!res.ok) throw new Error(json.error ?? fallback)
  return json.deal ?? null
}

export function createDeal(payload: DealPayload) {
  return send("/api/admin/creators", "POST", payload, "Save failed")
}

export function updateDeal(id: string, patch: Record<string, unknown>) {
  return send(`/api/admin/creators/${id}`, "PATCH", patch, "Update failed")
}

export function deleteDeal(id: string) {
  return send(`/api/admin/creators/${id}`, "DELETE", null, "Delete failed")
}
