import { AdminShell } from "@/components/admin/admin-shell"
import { StatCardSkeleton } from "@/components/admin/admin-ui"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <AdminShell title="Analytics">
      <div className="space-y-8">
        <Skeleton className="h-5 w-56 rounded-md" />
        {Array.from({ length: 2 }).map((_, section) => (
          <div key={section} className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40 rounded-md" />
              <Skeleton className="h-3 w-64 rounded-md" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <StatCardSkeleton key={index} />
              ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
              <Skeleton className="h-80 rounded-2xl" />
              <Skeleton className="h-80 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  )
}
