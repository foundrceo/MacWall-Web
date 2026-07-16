import { redirect } from "next/navigation"
import { Suspense } from "react"

import { AdminLoginForm } from "@/components/admin/admin-login-form"
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
    <Suspense fallback={<p className="p-8 text-sm text-[#86868b]">Loading…</p>}>
      <AdminLoginForm nextPath={nextPath} />
    </Suspense>
  )
}
