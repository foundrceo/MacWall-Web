import type { Metadata } from "next"
import type { ReactNode } from "react"

import { AdminProviders } from "@/components/admin/providers"
import "./admin.css"

export const metadata: Metadata = {
  title: "MacWall Admin",
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    // Theme tokens key off `.admin-portal` (see admin.css).
    <div className="admin-portal min-h-svh bg-background font-sans text-foreground">
      <AdminProviders>{children}</AdminProviders>
    </div>
  )
}
