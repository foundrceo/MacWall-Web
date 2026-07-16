import { AdminShell } from "@/components/admin/admin-shell"
import { CatalogBulkUploadPanel } from "@/components/admin/catalog-bulk-upload-panel"
import { UploadReviewPanel } from "@/components/admin/upload-review-panel"

export default function AdminUploadsPage() {
  return (
    <AdminShell
      title="Uploads"
      description="Bulk upload catalog videos, review pending community wallpapers, approve to publish, or reject with notes."
    >
      <div className="space-y-6">
        <CatalogBulkUploadPanel />
        <UploadReviewPanel />
      </div>
    </AdminShell>
  )
}
