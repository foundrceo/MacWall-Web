import "server-only"
import { createHmac } from "node:crypto"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { clientIpFromRequest } from "./rate-limit"

/** Durable fixed windows shared by all instances, without retaining raw IPs. */
export async function consumePublicQuota(request: Request, operation: string, limit: number, seconds: 60 | 3600 | 86400 = 3600): Promise<boolean> {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error("quota_not_configured")
  const ip = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || clientIpFromRequest(request)
    : clientIpFromRequest(request)
  return consumePublicSubjectQuota(ip, operation, limit, seconds)
}

/** Also bounds paid operations per recipient, without storing their address. */
export async function consumePublicSubjectQuota(subject: string, operation: string, limit: number, seconds: 60 | 3600 | 86400): Promise<boolean> {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error("quota_not_configured")
  const subjectHash = createHmac("sha256", secret).update(subject).digest("hex")
  const { data, error } = await getSupabaseAdmin().rpc("consume_macwall_public_quota", {
    p_operation: operation, p_subject_hash: subjectHash, p_limit: limit, p_window_seconds: seconds,
  })
  if (error) throw new Error("quota_unavailable")
  return data === true
}
