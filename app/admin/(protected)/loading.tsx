import { Skeleton } from "@/components/admin/ui"

/** Shown while a page's code loads; each page then draws its own skeleton. */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="mx-auto w-full max-w-[1240px] px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8"
    >
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-2.5 h-4 w-72" />
      <Skeleton className="mt-6 h-[104px] rounded-[14px]" />
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-72 rounded-[14px]" />
        <Skeleton className="h-72 rounded-[14px]" />
      </div>
    </div>
  )
}
