import { AdminShell } from "@/components/admin/admin-shell"
import { AdminSkeleton } from "@/components/admin/admin-ui"

export default function Loading() {
  return (
    <AdminShell
      title="Uploads"
      description="Bulk upload catalog videos, review pending community wallpapers, approve to publish, or reject with notes."
    >
      <AdminSkeleton className="h-48 w-full" />
      <AdminSkeleton className="h-64 w-full" />
    </AdminShell>
  )
}
