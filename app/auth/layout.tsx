import type { Metadata } from "next"
import { macwall } from "@/lib/macwall-site"

export const metadata: Metadata = {
  title: "Account",
  description: `Sign in or create an account for ${macwall.name}.`,
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
