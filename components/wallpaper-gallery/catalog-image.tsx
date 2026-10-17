import type { CSSProperties, ImgHTMLAttributes } from "react"

import { catalogImageUrlAtWidth } from "@/lib/macwall-catalog-urls"

/** Widths Cloudflare resizes catalog thumbs to; the browser picks via `sizes`. */
const CATALOG_IMAGE_WIDTHS = [96, 160, 320, 480, 640, 960, 1280] as const

const FILL_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
}

type CatalogImageProps = Readonly<
  Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "sizes"> & {
    src: string
    alt: string
    /** Required: the rendered width, as for `next/image`. */
    sizes: string
    /** Cover the nearest positioned parent (like `next/image` `fill`). */
    fill?: boolean
    /** Above the fold: load eagerly at high priority. */
    priority?: boolean
    quality?: number
  }
>

/**
 * Catalog thumbs on the R2 CDN, sized by Cloudflare (`catalogImageUrlAtWidth`)
 * so phones get a ~640px AVIF instead of the 1280px JPEG, with no image
 * optimizer bill. A plain `<img>` with its own `srcset`, not `next/image` with
 * a custom loader: vinext (Cloudflare Workers) ignores the loader's srcset and
 * served every thumb at 16px, which rendered as a blur.
 */
export function CatalogImage({
  src,
  alt,
  sizes,
  fill,
  priority,
  quality,
  loading,
  fetchPriority,
  style,
  ...rest
}: CatalogImageProps) {
  const resized = catalogImageUrlAtWidth(src, 640, quality) !== src
  const srcSet = resized
    ? CATALOG_IMAGE_WIDTHS.map(
        (width) => `${catalogImageUrlAtWidth(src, width, quality)} ${width}w`
      ).join(", ")
    : undefined

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      alt={alt}
      src={resized ? catalogImageUrlAtWidth(src, 640, quality) : src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      loading={loading ?? (priority ? "eager" : "lazy")}
      fetchPriority={fetchPriority ?? (priority ? "high" : undefined)}
      decoding="async"
      style={fill ? { ...FILL_STYLE, ...style } : style}
    />
  )
}
