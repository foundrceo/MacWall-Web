import { AdminShell } from "@/components/admin/admin-shell"
import { AdminSkeleton } from "@/components/admin/admin-skeleton-reveal"

export default function AdminEmailsLoading() {
  return (
    <AdminShell title="Emails" fill>
      <div
        className="flex min-h-0 flex-1 flex-col lg:flex-row"
        aria-hidden="true"
      >
        <div className="w-full border-b border-[var(--admin-border)] bg-[var(--admin-surface)] lg:w-80 lg:border-r lg:border-b-0">
          <div className="space-y-1 border-b border-[var(--admin-border)] px-4 py-3">
            <AdminSkeleton className="h-4 w-24 rounded-md" />
            <AdminSkeleton className="h-3 w-40 rounded-md" />
          </div>
          <div className="space-y-1 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
              >
                <AdminSkeleton className="size-8 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <AdminSkeleton className="h-3.5 w-3/5 rounded-md" />
                  <AdminSkeleton className="h-2.5 w-2/5 rounded" />
                </div>
                <AdminSkeleton className="h-5 w-10 shrink-0 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <div className="min-h-0 flex-1 bg-[var(--admin-canvas)]">
          <div className="space-y-1.5 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 sm:px-6">
            <AdminSkeleton className="h-3.5 w-64 rounded-md" />
            <AdminSkeleton className="h-3 w-48 rounded-md" />
          </div>
          <div className="px-3 py-4 sm:px-6 sm:py-6">
            <AdminSkeleton className="mx-auto h-[60vh] max-w-[720px] rounded-xl" />
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
