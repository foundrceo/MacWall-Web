import { redirect } from "next/navigation"
import { Suspense } from "react"

import { AdminLoginForm } from "@/components/admin/admin-login-form"
import { AdminSkeleton } from "@/components/admin/admin-skeleton-reveal"
import { isAdminAuthenticated } from "@/lib/admin/auth"

type AdminLoginPageProps = {
  searchParams: Promise<{ next?: string }>
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams
  const nextPath =
    params.next?.startsWith("/admin") && !params.next.startsWith("/admin/login")
      ? params.next
      : "/admin"

  if (await isAdminAuthenticated()) {
    redirect(nextPath)
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center bg-[var(--admin-canvas)] px-4 py-12">
          <div
            className="w-full max-w-sm space-y-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6"
            aria-hidden="true"
          >
            <div className="flex flex-col items-center gap-3 pt-2 text-center">
              <AdminSkeleton className="size-14 rounded-2xl" />
              <AdminSkeleton className="h-5 w-2/5 rounded-md" />
              <AdminSkeleton className="h-3.5 w-3/5 rounded-md" />
            </div>
            <div className="space-y-1.5">
              <AdminSkeleton className="h-3 w-24 rounded" />
              <AdminSkeleton className="h-10 w-full rounded-full" />
            </div>
            <AdminSkeleton className="h-10 w-full rounded-full" />
            <div className="flex justify-center">
              <AdminSkeleton className="h-3 w-48 rounded" />
            </div>
          </div>
        </div>
      }
    >
      <AdminLoginForm nextPath={nextPath} />
    </Suspense>
  )
}
