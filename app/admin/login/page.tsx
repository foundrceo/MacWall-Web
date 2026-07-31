import { redirect } from "next/navigation"
import { Suspense } from "react"

import { AdminLoginForm } from "@/components/admin/admin-login-form"
import { Skeleton } from "@/components/ui/skeleton"
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
        <div className="flex min-h-svh items-center justify-center px-4 py-12">
          <Skeleton className="h-80 w-full max-w-sm rounded-2xl" />
        </div>
      }
    >
      <AdminLoginForm nextPath={nextPath} />
    </Suspense>
  )
}
