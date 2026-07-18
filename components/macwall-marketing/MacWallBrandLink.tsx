import Link from "next/link"
import { MacWallAppIcon } from "@/components/macwall-app-icon"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

/** Nav + footer brand row — icon and wordmark share one optical center line. */
export const MACWALL_BRAND_ICON_SIZE = 20 as const

const brandTextBase =
  "text-[15px] font-medium leading-none tracking-[-0.01em]"

type MacWallBrandLinkProps = Readonly<{
  href?: string
  /** Nav uses white text on dark chrome; footer uses foreground token. */
  variant?: "nav" | "footer"
  className?: string
  priority?: boolean
}>

export function MacWallBrandLink({
  href = "/",
  variant = "nav",
  className,
  priority,
}: MacWallBrandLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-[20px] min-w-0 shrink-0 items-center gap-2",
        "rounded-sm transition-opacity hover:opacity-80",
        className
      )}
      aria-label={macwall.name}
    >
      <MacWallAppIcon
        size={MACWALL_BRAND_ICON_SIZE}
        priority={priority}
        aria-hidden
      />
      <span
        className={cn(
          brandTextBase,
          "truncate",
          variant === "nav" ? "text-white" : "text-foreground"
        )}
      >
        {macwall.name}
      </span>
    </Link>
  )
}
