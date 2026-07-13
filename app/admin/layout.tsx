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
    <div className="admin-portal min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased [color-scheme:light]">
      {children}
    </div>
  )
}
