import Link from "next/link"
import type { Metadata } from "next"
import { buttonVariants } from "@/components/ui/button"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Page not found",
  description: `The page you requested is not on the ${macwall.name} site.`,
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        We couldn&apos;t find that URL. Try the {macwall.name} home page
        instead.
      </p>
      <Link href="/" className={cn(buttonVariants())}>
        Back to home
      </Link>
    </div>
  )
}
