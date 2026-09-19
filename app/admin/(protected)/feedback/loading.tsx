import { AdminShell } from "@/components/admin/admin-shell"
import { AdminSkeleton } from "@/components/admin/admin-skeleton-reveal"

export default function Loading() {
  return (
    <AdminShell title="Live Support" fill>
      <div
        className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] md:grid-cols-[19rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)_18rem]"
        aria-hidden="true"
      >
        <div className="flex min-h-0 flex-col bg-[var(--admin-surface)] md:border-r md:border-[var(--admin-border)]">
          <div className="space-y-3 border-b border-[var(--admin-border)] px-4 py-3">
            <AdminSkeleton className="h-9 w-full rounded-full" />
            <AdminSkeleton className="h-9 w-full rounded-full" />
          </div>
          <div className="space-y-0.5 p-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex gap-3 rounded-2xl p-2.5">
                <AdminSkeleton className="size-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <AdminSkeleton className="h-3.5 w-2/5 rounded-md" />
                    <AdminSkeleton className="ml-auto h-2.5 w-10 shrink-0 rounded" />
                  </div>
                  <AdminSkeleton className="mt-1 h-3 w-4/5 rounded-md" />
                  <div className="mt-1.5 flex gap-1">
                    <AdminSkeleton className="h-5 w-14 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden min-h-0 flex-col bg-[var(--admin-canvas)] md:flex">
          <div className="flex h-14 items-center gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-4">
            <AdminSkeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <AdminSkeleton className="h-3.5 w-32 rounded-md" />
              <AdminSkeleton className="h-2.5 w-24 rounded" />
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-hidden px-4 py-4 sm:px-6">
            <AdminSkeleton className="h-12 w-2/3 rounded-2xl" />
            <AdminSkeleton className="ml-auto h-16 w-1/2 rounded-2xl" />
            <AdminSkeleton className="h-10 w-3/5 rounded-2xl" />
          </div>
          <div className="border-t border-[var(--admin-border)] px-3 py-2.5 sm:px-5">
            <AdminSkeleton className="h-11 w-full rounded-2xl" />
          </div>
        </div>
        <div className="hidden border-l border-[var(--admin-border)] bg-[var(--admin-surface)] xl:block">
          <div className="space-y-2.5 px-5 py-4">
            <AdminSkeleton className="size-12 rounded-full" />
            <AdminSkeleton className="h-3.5 w-3/5 rounded-md" />
            <AdminSkeleton className="h-3 w-2/5 rounded-md" />
          </div>
          <div className="space-y-2.5 border-t border-[var(--admin-border)] px-5 py-4">
            <AdminSkeleton className="h-3 w-full rounded-md" />
            <AdminSkeleton className="h-3 w-4/5 rounded-md" />
            <AdminSkeleton className="h-3 w-3/5 rounded-md" />
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
