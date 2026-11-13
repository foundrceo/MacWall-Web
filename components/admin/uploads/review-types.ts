/**
 * Shapes and copy shared by the community-upload review queue. The row types
 * come from the data layer (type-only, so nothing server-side is bundled).
 */

import type { Tone } from "@/components/admin/ui"
import type {
  AdminCommunityUpload,
  CommunityRightsBasis,
  CommunityUploadStatus,
  ModerationEvent,
} from "@/lib/admin/uploads"

export type UploadItem = AdminCommunityUpload
export type UploadStatus = CommunityUploadStatus
export type UploadFilter = UploadStatus | "all"
export type ReviewAction = "approve" | "reject" | "request-info" | "block"
export type { ModerationEvent }

export type DecisionResult = { ok: true } | { ok: false; message: string }

export const STATUS_FILTERS: readonly { value: UploadFilter; label: string }[] =
  [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "all", label: "All" },
  ]

const STATUS_META: Record<UploadStatus, { label: string; tone: Tone }> = {
  pending: { label: "Pending", tone: "amber" },
  approved: { label: "Approved", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
}

/** Pending uploads waiting on the uploader read as "Info requested". */
export function statusMeta(upload: UploadItem): { label: string; tone: Tone } {
  if (upload.status === "pending" && upload.infoRequestedAt) {
    return { label: "Info requested", tone: "blue" }
  }
  return STATUS_META[upload.status]
}

export const RIGHTS_STATEMENTS: Record<CommunityRightsBasis, string> = {
  own_work:
    "I created this wallpaper and own the rights necessary to publish it.",
  licensed:
    "I have permission or a license allowing me to publish and distribute this wallpaper through MacWall.",
}

export const LICENSE_LABELS: Record<string, string> = {
  creative_commons: "Creative Commons license",
  free_stock_license: "Free stock license",
  written_permission: "Written permission from the creator",
  purchased_license: "Purchased license",
  other: "Other license",
}

export const EVENT_META: Record<string, { label: string; tone: Tone }> = {
  submitted: { label: "Submitted with rights declaration", tone: "neutral" },
  approved: { label: "Approved and published", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
  info_requested: { label: "More information requested", tone: "amber" },
  removed: { label: "Removed from the catalog", tone: "red" },
  submitter_blocked: { label: "Uploader blocked", tone: "red" },
  rights_status_changed: { label: "Rights status changed", tone: "blue" },
}

/** Error codes the upload routes return, in words a moderator can act on. */
const API_ERRORS: Record<string, string> = {
  message_required: "Write what you need from the uploader first.",
  reason_required: "Write the reason for blocking first.",
  rights_declaration_missing:
    "This upload has no rights declaration, so it can't be approved.",
  upload_not_found: "This upload no longer exists. Refresh the queue.",
  upload_not_pending: "This upload was already reviewed. Refresh the queue.",
  upload_rejected: "This upload was already rejected and can't be approved.",
}

export function describeApiError(code: string | undefined, fallback: string) {
  if (!code) return fallback
  return API_ERRORS[code] ?? code
}

export function authorLabel(upload: UploadItem) {
  return upload.authorName?.trim() || "Anonymous"
}

export function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown"
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}
