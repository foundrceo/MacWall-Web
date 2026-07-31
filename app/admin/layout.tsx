import type { Metadata } from "next"

import "./admin.css"

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="admin-portal min-h-svh bg-[var(--admin-canvas)] font-sans text-[var(--admin-fg)] antialiased">
      {children}
    </div>
  )
}
