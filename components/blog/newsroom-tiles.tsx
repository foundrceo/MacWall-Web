import {
  blogTileEyebrow,
  formatTileDateAbsolute,
  formatTileDateRelative,
} from "@/lib/blog/tile-copy"
import { BlogTilePicture } from "@/components/blog/blog-tile-picture"
import {
  blogTilePoster,
  type BlogTileImageVariant,
} from "@/lib/blog/tile-media"
import type { BlogArticle } from "@/lib/content/types"
import { cn } from "@/lib/utils"
import Link from "next/link"

function tileMediaClassName(variant: BlogTileImageVariant): string {
  if (variant === "hero") return "tile__media tile__media--hero"
  if (variant === "list") return "tile__media tile__media--square"
  return "tile__media tile__media--tile"
}

function TileMedia({
  article,
  variant = "tile",
  priority,
}: Readonly<{
  article: BlogArticle
  variant?: BlogTileImageVariant
  priority?: boolean
}>) {
  const src = blogTilePoster(article.slug, article.category, variant)
  return (
    <div
      className={tileMediaClassName(variant)}
      aria-hidden={variant === "hero" ? true : undefined}
    >
      <BlogTilePicture src={src} alt="" variant={variant} priority={priority} />
    </div>
  )
}

function TileTimestamp({
  article,
  style,
  hideIcon,
}: Readonly<{
  article: BlogArticle
  style: "relative" | "absolute"
  hideIcon?: boolean
}>) {
  if (!article.publishedAt) return null

  const label =
    style === "relative"
      ? formatTileDateRelative(article.publishedAt)
      : formatTileDateAbsolute(article.publishedAt)

  return (
    <time
      className={cn("tile__timestamp", hideIcon && "icon-hide")}
      dateTime={article.publishedAt}
    >
      {label}
    </time>
  )
}

function TileCopy({
  article,
  variant = "default",
  timestampStyle = "absolute",
  timestampInHead = false,
  hideTimestampIcon = false,
}: Readonly<{
  article: BlogArticle
  variant?: "hero" | "default" | "overlay"
  timestampStyle?: "relative" | "absolute"
  timestampInHead?: boolean
  hideTimestampIcon?: boolean
}>) {
  const eyebrowLabel = blogTileEyebrow(article.category)
  const HeadlineTag = variant === "hero" ? "h2" : "h3"
  const eyebrow =
    variant === "hero" ? (
      <p className="tile__hero--eyebrow">{eyebrowLabel}</p>
    ) : (
      <p className="tile__category">{eyebrowLabel}</p>
    )

  const timestamp = (
    <TileTimestamp
      article={article}
      style={timestampStyle}
      hideIcon={hideTimestampIcon}
    />
  )

  return (
    <div className="tile__description">
      <div className="tile__description-content">
        <div className="tile__head">
          {eyebrow}
          <HeadlineTag className="tile__headline">
            {article.headline}
          </HeadlineTag>
          {timestampInHead ? timestamp : null}
        </div>
      </div>
      {!timestampInHead ? timestamp : null}
    </div>
  )
}

export function NewsroomHeroTile({
  article,
  reversed,
  priority,
  timestampStyle = "absolute",
  hideTimestampIcon = false,
  itemClassName = "tile-item item-hero",
}: Readonly<{
  article: BlogArticle
  reversed?: boolean
  priority?: boolean
  timestampStyle?: "relative" | "absolute"
  hideTimestampIcon?: boolean
  itemClassName?: string
}>) {
  const copy = (
    <TileCopy
      article={article}
      variant="hero"
      timestampStyle={timestampStyle}
      hideTimestampIcon={hideTimestampIcon}
    />
  )
  const media = (
    <TileMedia article={article} variant="hero" priority={priority} />
  )

  return (
    <li role="listitem" className={itemClassName}>
      <Link
        href={`/blog/${article.slug}`}
        className={cn(
          "tile tile-1up tile-hero tile-hero",
          reversed && "tile-hero__reversed"
        )}
        data-reversed={reversed ? "true" : undefined}
        aria-label={`${article.headline} - ${blogTileEyebrow(article.category)}${article.publishedAt ? ` - Posted on ${formatTileDateAbsolute(article.publishedAt)}` : ""}`}
      >
        {reversed ? (
          <>
            {copy}
            {media}
          </>
        ) : (
          <>
            {media}
            {copy}
          </>
        )}
      </Link>
    </li>
  )
}

export function NewsroomTwoUpTile({
  article,
  itemClassName = "tile-item item-2up",
}: Readonly<{
  article: BlogArticle
  itemClassName?: string
}>) {
  return (
    <li role="listitem" className={itemClassName}>
      <Link href={`/blog/${article.slug}`} className="tile tile-2up">
        <TileMedia article={article} />
        <TileCopy article={article} hideTimestampIcon />
      </Link>
    </li>
  )
}

export function NewsroomThreeUpTile({
  article,
  itemClassName = "tile-item item-3up",
}: Readonly<{
  article: BlogArticle
  itemClassName?: string
}>) {
  return (
    <li role="listitem" className={itemClassName}>
      <Link
        href={`/blog/${article.slug}`}
        className="tile tile-3up tile-fullbleed has-gradient-secondary tile-expands"
      >
        <TileMedia article={article} />
        <div className="tile__gradient-secondary">
          <TileCopy
            article={article}
            variant="overlay"
            timestampInHead
            hideTimestampIcon
          />
        </div>
      </Link>
    </li>
  )
}

export function NewsroomListTile({
  article,
}: Readonly<{ article: BlogArticle }>) {
  const src = blogTilePoster(article.slug, article.category, "list")
  return (
    <li role="listitem" className="tile-item item-list">
      <Link href={`/blog/${article.slug}`} className="tile tile-list">
        <div className="tile__media tile__media--square" aria-hidden="true">
          <BlogTilePicture src={src} alt="" variant="list" />
        </div>
        <TileCopy article={article} hideTimestampIcon />
      </Link>
    </li>
  )
}
