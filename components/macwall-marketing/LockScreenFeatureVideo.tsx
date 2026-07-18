import {
  MARKETING_LOCK_SCREEN_VIDEO_MP4,
  MARKETING_LOCK_SCREEN_VIDEO_WEBM,
} from "@/lib/marketing-shell/assets"

/** Lock Screen feature demo — static markup so hydration never remounts or reloads the clip. */
export default function LockScreenFeatureVideo({
  ariaLabel,
}: Readonly<{ ariaLabel: string }>) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="h-full w-full object-cover"
        aria-label={ariaLabel}
      >
        <source src={MARKETING_LOCK_SCREEN_VIDEO_WEBM} type="video/webm" />
        <source src={MARKETING_LOCK_SCREEN_VIDEO_MP4} type="video/mp4" />
      </video>
    </div>
  )
}
