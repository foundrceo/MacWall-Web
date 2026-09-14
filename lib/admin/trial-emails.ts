import "server-only"

import { getSupabaseAdmin } from "@/lib/supabase/admin"

const TRIAL_MS = 24 * 60 * 60 * 1000

export type TrialEmailStats = {
  leads: number
  uniqueEmails: number
  converted: number
  unconvertedEnded: number
  stillInTrial: number
  unsubscribed: number
  queuedPending: number
  queuedSent: number
  queuedSkipped: number
  queuedCancelled: number
}

const EMPTY: TrialEmailStats = {
  leads: 0,
  uniqueEmails: 0,
  converted: 0,
  unconvertedEnded: 0,
  stillInTrial: 0,
  unsubscribed: 0,
  queuedPending: 0,
  queuedSent: 0,
  queuedSkipped: 0,
  queuedCancelled: 0,
}

export async function fetchTrialEmailStats(): Promise<TrialEmailStats> {
  const supabase = getSupabaseAdmin()
  const [leadsRes, licensesRes, licenseEmailsRes, queueRes] = await Promise.all([
    supabase
      .from("macwall_trial_leads")
      .select("email, trial_started_at, unsubscribed_at")
      .limit(20000),
    supabase
      .from("macwall_licenses")
      .select("customer_email, status")
      .in("status", ["active", "trial"])
      .not("customer_email", "is", null)
      .limit(20000),
    supabase
      .from("macwall_stripe_license_emails")
      .select("customer_email")
      .not("customer_email", "is", null)
      .limit(20000),
    supabase
      .from("macwall_trial_ended_queue")
      .select("status")
      .limit(20000),
  ])

  if (leadsRes.error) {
    console.warn("[admin] trial leads", leadsRes.error.message)
    return EMPTY
  }

  if (queueRes.error) {
    console.warn("[admin] trial queue", queueRes.error.message)
  }

  const converted = new Set<string>()
  for (const row of licensesRes.data ?? []) {
    const email = row.customer_email?.trim().toLowerCase()
    if (email) converted.add(email)
  }
  for (const row of licenseEmailsRes.data ?? []) {
    const email = row.customer_email?.trim().toLowerCase()
    if (email) converted.add(email)
  }

  const unique = new Set<string>()
  let unsubscribed = 0
  let convertedCount = 0
  let unconvertedEnded = 0
  let stillInTrial = 0
  const now = Date.now()

  for (const row of leadsRes.data ?? []) {
    const email = row.email.trim().toLowerCase()
    unique.add(email)
    if (row.unsubscribed_at) unsubscribed += 1
    if (converted.has(email)) {
      convertedCount += 1
      continue
    }
    const started = Date.parse(row.trial_started_at)
    if (!Number.isFinite(started) || now - started < TRIAL_MS) {
      stillInTrial += 1
    } else {
      unconvertedEnded += 1
    }
  }

  let queuedPending = 0
  let queuedSent = 0
  let queuedSkipped = 0
  let queuedCancelled = 0
  for (const row of queueRes.data ?? []) {
    if (row.status === "pending") queuedPending += 1
    else if (row.status === "sent") queuedSent += 1
    else if (row.status === "skipped") queuedSkipped += 1
    else if (row.status === "cancelled") queuedCancelled += 1
  }

  return {
    leads: leadsRes.data?.length ?? 0,
    uniqueEmails: unique.size,
    converted: convertedCount,
    unconvertedEnded,
    stillInTrial,
    unsubscribed,
    queuedPending,
    queuedSent,
    queuedSkipped,
    queuedCancelled,
  }
}
