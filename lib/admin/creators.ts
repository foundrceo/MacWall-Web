import "server-only"

import { getSupabaseAdmin } from "@/lib/supabase/admin"

export type CreatorContentStatus =
  | "contacted"
  | "agreed"
  | "in_progress"
  | "delivered"
  | "posted"
  | "cancelled"

export type CreatorPaymentStatus = "unpaid" | "partial" | "paid" | "cancelled"

export type CreatorDeal = {
  id: string
  creatorName: string
  instagramHandle: string
  deliverable: string
  reelsPromised: number
  reelsDelivered: number
  agreedAmount: number
  paidAmount: number
  /** Agreed minus paid — what you still owe. */
  balanceAmount: number
  currency: string
  email: string | null
  phone: string | null
  upiId: string | null
  contentStatus: CreatorContentStatus
  paymentStatus: CreatorPaymentStatus
  contentLink: string | null
  dueDate: string | null
  paidAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

type CreatorRow = {
  id: string
  creator_name: string
  instagram_handle: string
  deliverable: string
  reels_promised: number
  reels_delivered: number
  agreed_amount: number | string
  paid_amount: number | string
  currency: string
  email: string | null
  phone: string | null
  upi_id: string | null
  content_status: CreatorContentStatus
  payment_status: CreatorPaymentStatus
  content_link: string | null
  due_date: string | null
  paid_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

const SELECT_COLUMNS =
  "id,creator_name,instagram_handle,deliverable,reels_promised,reels_delivered,agreed_amount,paid_amount,currency,email,phone,upi_id,content_status,payment_status,content_link,due_date,paid_at,notes,created_at,updated_at"

export const CREATOR_CONTENT_STATUSES: CreatorContentStatus[] = [
  "contacted",
  "agreed",
  "in_progress",
  "delivered",
  "posted",
  "cancelled",
]

export const CREATOR_PAYMENT_STATUSES: CreatorPaymentStatus[] = [
  "unpaid",
  "partial",
  "paid",
  "cancelled",
]

function mapRow(row: CreatorRow): CreatorDeal {
  const agreed = Number(row.agreed_amount ?? 0)
  const paid = Number(row.paid_amount ?? 0)
  return {
    id: row.id,
    creatorName: row.creator_name,
    instagramHandle: row.instagram_handle,
    deliverable: row.deliverable,
    reelsPromised: Number(row.reels_promised ?? 0),
    reelsDelivered: Number(row.reels_delivered ?? 0),
    agreedAmount: agreed,
    paidAmount: paid,
    balanceAmount: agreed - paid,
    currency: row.currency ?? "INR",
    email: row.email,
    phone: row.phone,
    upiId: row.upi_id,
    contentStatus: row.content_status,
    paymentStatus: row.payment_status,
    contentLink: row.content_link,
    dueDate: row.due_date,
    paidAt: row.paid_at,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@+/, "").replace(/\/+$/, "")
}

export function instagramProfileUrl(handle: string): string {
  return `https://instagram.com/${normalizeHandle(handle)}`
}

export async function listCreatorDeals(filters?: {
  search?: string
  contentStatus?: string
  paymentStatus?: string
}): Promise<CreatorDeal[]> {
  const supabase = getSupabaseAdmin()
  let query = supabase
    .from("creator_deals")
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(500)

  const content = filters?.contentStatus
  if (content && content !== "all") query = query.eq("content_status", content)

  const payment = filters?.paymentStatus
  if (payment && payment !== "all") query = query.eq("payment_status", payment)

  const search = filters?.search?.trim()
  if (search) {
    const needle = `%${search.replace(/[%_]/g, "")}%`
    query = query.or(
      `creator_name.ilike.${needle},instagram_handle.ilike.${needle}`
    )
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as CreatorRow[]).map(mapRow)
}

export type CreatorDealInput = {
  creatorName: string
  instagramHandle: string
  deliverable?: string
  reelsPromised?: number
  reelsDelivered?: number
  agreedAmount?: number
  paidAmount?: number
  currency?: string
  email?: string | null
  phone?: string | null
  upiId?: string | null
  contentStatus?: CreatorContentStatus
  paymentStatus?: CreatorPaymentStatus
  contentLink?: string | null
  dueDate?: string | null
  paidAt?: string | null
  notes?: string | null
}

function toRow(input: CreatorDealInput) {
  return {
    creator_name: input.creatorName.trim(),
    instagram_handle: normalizeHandle(input.instagramHandle),
    deliverable: (input.deliverable ?? "reel").trim() || "reel",
    reels_promised: Number.isFinite(input.reelsPromised)
      ? Number(input.reelsPromised)
      : 0,
    reels_delivered: Number.isFinite(input.reelsDelivered)
      ? Number(input.reelsDelivered)
      : 0,
    agreed_amount: Number.isFinite(input.agreedAmount)
      ? Number(input.agreedAmount)
      : 0,
    paid_amount: Number.isFinite(input.paidAmount)
      ? Number(input.paidAmount)
      : 0,
    currency: (input.currency ?? "INR").trim().toUpperCase() || "INR",
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    upi_id: input.upiId?.trim() || null,
    content_status: input.contentStatus ?? "contacted",
    payment_status: input.paymentStatus ?? "unpaid",
    content_link: input.contentLink?.trim() || null,
    due_date: input.dueDate || null,
    paid_at: input.paidAt || null,
    notes: input.notes?.trim() || null,
  }
}

export async function createCreatorDeal(
  input: CreatorDealInput
): Promise<CreatorDeal> {
  if (!input.creatorName?.trim()) throw new Error("Creator name is required")
  if (!normalizeHandle(input.instagramHandle ?? ""))
    throw new Error("Instagram handle is required")

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("creator_deals")
    .insert(toRow(input))
    .select(SELECT_COLUMNS)
    .single()
  if (error) throw new Error(error.message)
  return mapRow(data as CreatorRow)
}

export async function updateCreatorDeal(
  id: string,
  input: Partial<CreatorDealInput>
): Promise<CreatorDeal> {
  const patch: Record<string, unknown> = {}
  if (input.creatorName !== undefined)
    patch.creator_name = input.creatorName.trim()
  if (input.instagramHandle !== undefined)
    patch.instagram_handle = normalizeHandle(input.instagramHandle)
  if (input.deliverable !== undefined)
    patch.deliverable = input.deliverable.trim() || "reel"
  if (input.reelsPromised !== undefined)
    patch.reels_promised = Number(input.reelsPromised) || 0
  if (input.reelsDelivered !== undefined)
    patch.reels_delivered = Number(input.reelsDelivered) || 0
  if (input.agreedAmount !== undefined)
    patch.agreed_amount = Number(input.agreedAmount) || 0
  if (input.paidAmount !== undefined)
    patch.paid_amount = Number(input.paidAmount) || 0
  if (input.currency !== undefined)
    patch.currency = input.currency.trim().toUpperCase() || "INR"
  if (input.email !== undefined) patch.email = input.email?.trim() || null
  if (input.phone !== undefined) patch.phone = input.phone?.trim() || null
  if (input.upiId !== undefined) patch.upi_id = input.upiId?.trim() || null
  if (input.contentStatus !== undefined)
    patch.content_status = input.contentStatus
  if (input.paymentStatus !== undefined)
    patch.payment_status = input.paymentStatus
  if (input.contentLink !== undefined)
    patch.content_link = input.contentLink?.trim() || null
  if (input.dueDate !== undefined) patch.due_date = input.dueDate || null
  if (input.paidAt !== undefined) patch.paid_at = input.paidAt || null
  if (input.notes !== undefined) patch.notes = input.notes?.trim() || null

  // Paying in full stamps paid_at automatically when not supplied.
  if (input.paymentStatus === "paid" && input.paidAt === undefined) {
    patch.paid_at = new Date().toISOString()
  }
  if (input.paymentStatus === "unpaid" && input.paidAt === undefined) {
    patch.paid_at = null
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("creator_deals")
    .update(patch)
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single()
  if (error) throw new Error(error.message)
  return mapRow(data as CreatorRow)
}

export async function deleteCreatorDeal(id: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from("creator_deals").delete().eq("id", id)
  if (error) throw new Error(error.message)
}
