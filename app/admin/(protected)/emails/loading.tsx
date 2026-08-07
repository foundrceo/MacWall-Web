import { Skeleton } from "@/components/ui/skeleton"

export default function AdminEmailsLoading() {
  return (
    <div className="flex min-h-svh flex-col bg-[var(--admin-canvas)] md:flex-row">
      <div className="hidden w-[var(--admin-sidebar-width)] border-r border-[var(--admin-border)] bg-white md:block" />
      <div className="flex min-w-0 flex-1 flex-col md:pl-0">
        <div className="h-[var(--admin-topbar-height)] border-b border-[var(--admin-border)] bg-white" />
        <div className="flex flex-1 gap-0 lg:flex-row">
          <div className="w-full space-y-2 border-b border-[var(--admin-border)] bg-white p-3 lg:w-80 lg:border-r lg:border-b-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="mx-auto h-[60vh] max-w-[720px] rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}