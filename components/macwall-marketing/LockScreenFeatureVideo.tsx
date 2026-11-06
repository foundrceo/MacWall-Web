import { DeferredVideo } from "@/components/macwall-marketing/deferred-video"
import { MARKETING_LOCK_SCREEN_VIDEO_MP4_URL } from "@/lib/marketing-assets-urls"
import { cn } from "@/lib/utils"

/** H.264 rather than VP9: Safari's WebM support is too patchy for the Mac audience. */
const LOCK_SCREEN_VIDEO_SRC = MARKETING_LOCK_SCREEN_VIDEO_MP4_URL
const LOCK_SCREEN_POSTER_SRC = "/hero/lockscreen-poster.avif"

/**
 * Lock Screen feature demo. Like every home-page clip it is in the server
 * HTML with `preload="none"`, plays only while near the viewport (pausing
 * when it leaves, so it never decodes off-screen) and never for reduced
 * motion.
 */
export default function LockScreenFeatureVideo({
  ariaLabel,
  className,
}: Readonly<{ ariaLabel: string; className?: string }>) {
  return (
    <div className={cn("relative h-full w-full bg-black", className)}>
      <DeferredVideo
        src={LOCK_SCREEN_VIDEO_SRC}
        poster={LOCK_SCREEN_POSTER_SRC}
        label={ariaLabel}
      />
    </div>
  )
}
