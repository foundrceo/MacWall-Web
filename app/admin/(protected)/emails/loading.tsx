import { AdminShell } from "@/components/admin/admin-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminEmailsLoading() {
  return (
    <AdminShell title="Emails" fill>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="w-full space-y-2 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 lg:w-80 lg:border-r lg:border-b-0">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
        <div className="flex-1 bg-[var(--admin-canvas)] p-6">
          <Skeleton className="mx-auto h-[60vh] max-w-[720px] rounded-xl" />
        </div>
      </div>
    </AdminShell>
  )
}
