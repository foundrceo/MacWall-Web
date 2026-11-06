import type { ContentImageBlock, ContentVideoBlock } from "@/lib/content/types"
import { cn } from "@/lib/utils"

/**
 * In-body screenshots and screen recordings for blog, docs and learn pages.
 * Plain elements, not next/image: the files are already sized for the page
 * (the optimizer only takes allow-listed `/public` folders), and `width` /
 * `height` reserve the space so nothing shifts while they load.
 */

const figure = "my-7 md:my-8"
const frame =
  "block h-auto w-full overflow-hidden rounded-2xl border border-border bg-white/[0.04]"
const caption =
  "mt-2.5 text-center font-sans text-[13px] leading-5 text-pretty text-marketing-muted"

export function ContentImageFigure({
  block,
  className,
}: Readonly<{ block: ContentImageBlock; className?: string }>) {
  return (
    <figure className={cn(figure, className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized local screenshot */}
      <img
        src={block.src}
        alt={block.alt}
        width={block.width}
        height={block.height}
        loading="lazy"
        decoding="async"
        sizes="(min-width: 768px) 620px, 100vw"
        className={frame}
      />
      {block.caption ? (
        <figcaption className={caption}>{block.caption}</figcaption>
      ) : null}
    </figure>
  )
}

/**
 * A recording with native controls. `preload="none"` keeps the page light:
 * only the poster loads until the reader presses play.
 */
export function ContentVideoFigure({
  block,
  className,
}: Readonly<{ block: ContentVideoBlock; className?: string }>) {
  return (
    <figure className={cn(figure, className)}>
      <video
        src={block.src}
        poster={block.poster}
        width={block.width}
        height={block.height}
        controls
        playsInline
        preload="none"
        aria-label={block.caption}
        className={frame}
      />
      <figcaption className={caption}>{block.caption}</figcaption>
      {block.clips && block.clips.length > 0 ? (
        <ol className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 font-sans text-[13px] leading-5 text-marketing-muted">
          {block.clips.map((clip) => (
            <li key={clip.startOffset}>
              <a href={clip.url} className="underline-offset-2 hover:underline">
                {formatOffset(clip.startOffset)} {clip.name}
              </a>
            </li>
          ))}
        </ol>
      ) : null}
    </figure>
  )
}

/** 75 → "1:15". */
function formatOffset(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(total / 60)
  return `${minutes}:${String(total % 60).padStart(2, "0")}`
}
