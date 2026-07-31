import { AdminShell } from "@/components/admin/admin-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <AdminShell title="Wallpapers">
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid gap-4 min-[1200px]:grid-cols-[minmax(0,1fr)_22rem]">
          <Skeleton className="h-[560px] rounded-2xl" />
          <Skeleton className="hidden h-[520px] rounded-2xl min-[1200px]:block" />
        </div>
      </div>
    </AdminShell>
  )
}
