import { AdminShell } from "@/components/admin/admin-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <AdminShell title="Uploads">
      <div className="space-y-5">
        <Skeleton className="h-9 w-64 rounded-full" />
        <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    </AdminShell>
  )
}
