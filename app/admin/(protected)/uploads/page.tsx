import { AdminShell } from "@/components/admin/admin-shell"
import { UploadReviewPanel } from "@/components/admin/upload-review-panel"

export default function AdminUploadsPage() {
  return (
    <AdminShell
      title="Community uploads"
      description="Preview pending wallpapers, approve to publish, or reject with notes."
    >
      <UploadReviewPanel />
    </AdminShell>
  )
}
