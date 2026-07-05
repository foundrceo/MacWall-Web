import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

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
