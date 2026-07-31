import { AdminShell } from "@/components/admin/admin-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <AdminShell title="Live Support" fill>
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] md:grid-cols-[19rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)_18rem]">
        <div className="flex min-h-0 flex-col gap-3 border-r border-[var(--admin-border)] bg-white p-4">
          <Skeleton className="h-9 w-full rounded-full" />
          <Skeleton className="h-9 w-full rounded-full" />
          <div className="space-y-3 pt-1">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/5 rounded-md" />
                  <Skeleton className="h-3 w-4/5 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden bg-[var(--admin-canvas)] md:block" />
        <div className="hidden border-l border-[var(--admin-border)] bg-white xl:block" />
      </div>
    </AdminShell>
  )
}
