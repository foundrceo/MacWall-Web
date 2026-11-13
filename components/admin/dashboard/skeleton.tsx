import { Skeleton } from "@/components/admin/ui"

/** First-load placeholder, laid out like the top of the real dashboard. */
export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading analytics" className="space-y-8">
      <div className="space-y-4">
        <StatsSkeleton />
        <PanelSkeleton />
      </div>
      <div className="space-y-4">
        <HeadingSkeleton />
        <StatsSkeleton />
        <div className="grid gap-4 lg:grid-cols-2">
          <PanelSkeleton />
          <PanelSkeleton />
        </div>
      </div>
    </div>
  )
}

function HeadingSkeleton() {
  return (
    <div>
      <Skeleton className="h-5 w-24" />
      <Skeleton className="mt-2 h-4 w-72 max-w-full" />
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-card">
      <div className="-mr-px -mb-px grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="border-r border-b border-border p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-6 w-28" />
            <Skeleton className="mt-3 h-4 w-36 max-w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

function PanelSkeleton() {
  return (
    <div className="rounded-[14px] border border-border bg-card">
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="p-4">
        <Skeleton className="h-[240px] w-full rounded-lg" />
      </div>
    </div>
  )
}
