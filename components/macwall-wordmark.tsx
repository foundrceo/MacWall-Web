import Link from "next/link"
import { MacWallAppIcon } from "@/components/macwall-app-icon"
import { cn } from "@/lib/utils"
import { macwall } from "@/lib/macwall-site"

type MacWallWordmarkProps = Readonly<{
  /** Pass `null` to render a non-clickable wordmark. */
  href?: string | null
  className?: string
  iconClassName?: string
  labelClassName?: string
}>

/** App icon + MacWall — same artwork as the macOS app. */
export function MacWallWordmark({
  href = "/",
  className,
  iconClassName,
  labelClassName,
}: MacWallWordmarkProps) {
  const body = (
    <>
      <MacWallAppIcon size={28} className={iconClassName} aria-hidden />
      <span
        className={cn(
          "font-semibold tracking-tight text-foreground",
          labelClassName
        )}
      >
        {macwall.name}
      </span>
    </>
  )

  if (href === null) {
    return (
      <div className={cn("flex items-center gap-2", className)}>{body}</div>
    )
  }

  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      {body}
    </Link>
  )
}
