import { marketingLockScreenVideoSources } from "@/lib/marketing-assets-urls"

/** Lock Screen feature demo — static markup so hydration never remounts or reloads the clip. */
export default function LockScreenFeatureVideo({
  ariaLabel,
}: Readonly<{ ariaLabel: string }>) {
  const sources = marketingLockScreenVideoSources()

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
        {sources.map((src) => (
          <source key={src} src={src} />
        ))}
      </video>
    </div>
  )
}
