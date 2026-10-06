import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"

import { StatusPage, statusPrimaryButton } from "@/components/status-page"
import { NotFoundIllustration } from "@/components/ui/404-page-not-found"
import { macwall } from "@/lib/macwall-site"

export const metadata: Metadata = {
  title: "Page not found",
  description: `The page you requested is not on the ${macwall.name} site.`,
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <StatusPage
      art={<NotFoundIllustration className="text-[#67edec]" />}
      title="Page not found"
      body="This page doesn't exist or has moved."
      action={
        <Link href="/" className={statusPrimaryButton}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to home
        </Link>
      }
    />
  )
}
