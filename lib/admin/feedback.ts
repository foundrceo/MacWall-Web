import { getSupabaseAdmin } from "@/lib/supabase/admin"

export type FeedbackSentiment = "like" | "dislike" | "neutral"
export type FeedbackFilter = FeedbackSentiment | "all" | "unread"

export type AdminFeedback = {
  id: string
  deviceId: string | null
  sentiment: FeedbackSentiment
  name: string | null
  message: string
  appVersion: string | null
  osVersion: string | null
  deviceModel: string | null
  modelIdentifier: string | null
  chip: string | null
  memoryGb: number | null
  isResolved: boolean
  createdAt: string
}

export type FeedbackTotals = {
  total: number
  like: number
  dislike: number
  neutral: number
  unresolved: number
}

type FeedbackRow = {
  id: string
  device_id: string | null
  sentiment: FeedbackSentiment
  name: string | null
  message: string
  app_version: string | null
  os_version: string | null
  device_model: string | null
  model_identifier: string | null
  chip: string | null
  memory_gb: number | null
  is_resolved: boolean
  created_at: string
}

const COLUMNS =
  "id,device_id,sentiment,name,message,app_version,os_version,device_model,model_identifier,chip,memory_gb,is_resolved,created_at"

function mapFeedback(row: FeedbackRow): AdminFeedback {
  return {
    id: row.id,
    deviceId: row.device_id,
    sentiment: row.sentiment,
    name: row.name,
    message: row.message,
    appVersion: row.app_version,
    osVersion: row.os_version,
    deviceModel: row.device_model,
    modelIdentifier: row.model_identifier,
    chip: row.chip,
    memoryGb: row.memory_gb,
    isResolved: row.is_resolved,
    createdAt: row.created_at,
  }
}

export async function listAppFeedback(
  filter: FeedbackFilter = "all"
): Promise<AdminFeedback[]> {
  const supabase = getSupabaseAdmin()
  let query = supabase
    .from("app_feedback")
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .limit(300)

  if (filter === "unread") {
    query = query.eq("is_resolved", false)
  } else if (filter !== "all") {
    query = query.eq("sentiment", filter)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as FeedbackRow[]).map(mapFeedback)
}

export async function getFeedbackTotals(): Promise<FeedbackTotals> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("app_feedback")
    .select("sentiment,is_resolved")
    .limit(5000)

  if (error) throw new Error(error.message)

  const rows = (data ?? []) as Array<Pick<FeedbackRow, "sentiment" | "is_resolved">>
  const totals: FeedbackTotals = {
    total: rows.length,
    like: 0,
    dislike: 0,
    neutral: 0,
    unresolved: 0,
  }
  for (const row of rows) {
    if (row.sentiment in totals) {
      totals[row.sentiment] += 1
    }
    if (!row.is_resolved) totals.unresolved += 1
  }
  return totals
}

export async function setFeedbackResolved(id: string, resolved: boolean) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from("app_feedback")
    .update({ is_resolved: resolved })
    .eq("id", id)

  if (error) throw new Error(error.message)
  return { id, isResolved: resolved }
}
