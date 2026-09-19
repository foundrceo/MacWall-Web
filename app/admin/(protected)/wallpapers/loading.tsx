import { AdminShell } from "@/components/admin/admin-shell"
import { AdminSkeleton } from "@/components/admin/admin-skeleton-reveal"

export default function Loading() {
  return (
    <AdminShell title="Wallpapers">
      <div className="space-y-5" aria-hidden="true">
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]">
          <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
            <AdminSkeleton className="h-9 min-w-0 flex-1 rounded-full" />
            <div className="flex gap-2">
              <AdminSkeleton className="h-9 w-40 rounded-full" />
              <AdminSkeleton className="h-9 w-36 rounded-full" />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 border-t border-[var(--admin-border)] px-4 py-3">
            <AdminSkeleton className="h-6 w-20 rounded-full" />
            <AdminSkeleton className="h-6 w-24 rounded-full" />
            <AdminSkeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]">
            <div className="flex items-center gap-3 border-b border-[var(--admin-border)] px-5 py-2.5">
              <AdminSkeleton className="h-3 w-16 rounded" />
              <AdminSkeleton className="h-3 w-24 rounded" />
              <AdminSkeleton className="h-3 w-20 rounded" />
              <AdminSkeleton className="ml-auto h-3 w-12 rounded" />
              <AdminSkeleton className="h-3 w-16 rounded" />
            </div>
            <div className="space-y-1 p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2">
                  <AdminSkeleton className="size-11 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <AdminSkeleton className="h-3.5 w-2/5 rounded-md" />
                    <AdminSkeleton className="h-3 w-3/5 rounded-md" />
                  </div>
                  <AdminSkeleton className="hidden h-3.5 w-20 shrink-0 rounded-md sm:block" />
                  <AdminSkeleton className="h-3.5 w-12 shrink-0 rounded-md" />
                </div>
              ))}
            </div>
          </div>
          <div className="hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] xl:block">
            <div className="border-b border-[var(--admin-border)] px-5 py-3">
              <AdminSkeleton className="h-3.5 w-32 rounded-md" />
              <AdminSkeleton className="mt-1.5 h-3 w-48 rounded-md" />
            </div>
            <div className="space-y-4 p-5">
              <AdminSkeleton className="aspect-video w-full rounded-xl" />
              <AdminSkeleton className="h-9 w-full rounded-full" />
              <AdminSkeleton className="h-9 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
