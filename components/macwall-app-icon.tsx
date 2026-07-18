import Image from "next/image"
import {
  macwallAppIconPath,
  macwallAppIconRadiusClass,
} from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

type MacWallAppIconProps = Readonly<{
  /** Render width/height in px — full MacWall.png artwork, not favicon assets. */
  size?: number
  className?: string
  priority?: boolean
  alt?: string
  "aria-hidden"?: boolean
}>

/** Marketing/UI app icon — always `public/MacWall.png`. Never use favicon_io here. */
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
      <Image
        alt={alt}
        fill
        src={macwallAppIconPath}
        className="object-contain"
        sizes={`${size}px`}
        priority={priority}
      />
    </span>
  )
}
