import { macwallAppIconRadiusClass } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

type MacWallAppIconProps = Readonly<{
  /** Render width/height in CSS px. */
  size?: number
  className?: string
  /** Fetch it early (e.g. the thank-you mark). Never for the nav or footer logo. */
  priority?: boolean
  alt?: string
  "aria-hidden"?: boolean
}>

/**
 * Pre-sized copies of public/MacWall.png, smallest first. The 64px one covers
 * the 20px nav logo at 3x in about 3 KB.
 */
const ICON_SOURCES = [
  { px: 64, src: "/favicon_io/macwall-icon-64.png" },
  { px: 192, src: "/favicon_io/android-chrome-192x192.png" },
  { px: 512, src: "/favicon_io/android-chrome-512x512.png" },
] as const

/** The smallest copy that stays sharp at 2x (the 512px one past 256px). */
function iconSource(size: number): string {
  const needed = size * 2
  return (ICON_SOURCES.find((s) => s.px >= needed) ?? ICON_SOURCES[2]).src
}

/**
 * Marketing/UI app icon. A plain <img> of a pre-sized PNG: no image
 * optimizer round trip, no client runtime, and no preload unless `priority`.
 */
export function MacWallAppIcon({
  size = 24,
  className,
  priority,
  alt = "",
  "aria-hidden": ariaHidden,
}: MacWallAppIconProps) {
  return (
    <span
      className={cn(
        macwallAppIconRadiusClass,
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden={ariaHidden ?? (alt === "" ? true : undefined)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt}
        src={iconSource(size)}
        width={size}
        height={size}
        decoding="async"
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : undefined}
        className="size-full object-contain"
      />
    </span>
  )
}
