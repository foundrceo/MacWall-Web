import { AdminShell } from "@/components/admin/admin-shell"
import { AdminSkeleton } from "@/components/admin/admin-ui"

export default function Loading() {
  return (
    <AdminShell
      title="Wallpapers"
      description="Bulk upload catalog videos, review likes, and edit wallpaper metadata."
    >
      <AdminSkeleton className="h-12 w-full" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <AdminSkeleton key={index} className="h-40 w-full" />
        ))}
      </div>
    </AdminShell>
  )
}
