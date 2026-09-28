"use client"

import Image, { type ImageProps } from "next/image"

import { catalogImageLoader } from "@/lib/macwall-catalog-urls"

/**
 * `next/image` for catalog thumbs on the R2 CDN. Sized by Cloudflare (see
 * `catalogImageUrlAtWidth`), so phones get a ~640px AVIF instead of the
 * 1280px JPEG, with no Vercel Image Optimization cost.
 */
export function CatalogImage({
  alt,
  ...props
}: Readonly<Omit<ImageProps, "loader">>) {
  return <Image alt={alt} {...props} loader={catalogImageLoader} />
}
