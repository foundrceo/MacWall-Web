import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AdminLoginForm } from "@/components/admin/login-form"
import { isAdminAuthenticated } from "@/lib/admin/auth"

export const metadata: Metadata = { title: "Sign in · MacWall Admin" }

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

  return <AdminLoginForm nextPath={nextPath} />
}
