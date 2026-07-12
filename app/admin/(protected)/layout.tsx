import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { isAdminAuthenticated } from "@/lib/admin/auth"

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login")
  }

  return children
}
