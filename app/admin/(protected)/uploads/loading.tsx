import { AdminShell } from "@/components/admin/admin-shell"
import { AdminSkeleton } from "@/components/admin/admin-skeleton-reveal"

export default function Loading() {
  return (
    <AdminShell title="Uploads">
      <div className="space-y-5" aria-hidden="true">
        <div className="flex h-9 w-72 items-center justify-between gap-0.5 rounded-full bg-[var(--admin-fill)] p-1">
          <AdminSkeleton className="h-full w-1/3 rounded-full" />
          <AdminSkeleton className="h-full w-1/3 rounded-full" />
          <AdminSkeleton className="h-full w-1/3 rounded-full" />
        </div>
        <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]">
            <div className="border-b border-[var(--admin-border)] p-3">
              <AdminSkeleton className="h-9 w-full rounded-full" />
            </div>
            <div className="space-y-0.5 p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg px-3 py-2.5">
                  <AdminSkeleton className="h-3.5 w-3/5 rounded-md" />
                  <div className="mt-1.5 flex items-center gap-2">
                    <AdminSkeleton className="h-3 w-16 rounded-md" />
                    <AdminSkeleton className="ml-auto h-5 w-16 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]">
            <div className="border-b border-[var(--admin-border)] px-5 py-3">
              <AdminSkeleton className="h-3.5 w-40 rounded-md" />
              <AdminSkeleton className="mt-1.5 h-3 w-64 rounded-md" />
            </div>
            <div className="space-y-4 p-5">
              <AdminSkeleton className="aspect-video w-full rounded-xl" />
              <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <AdminSkeleton className="h-2.5 w-14 rounded" />
                    <AdminSkeleton className="h-3.5 w-4/5 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
