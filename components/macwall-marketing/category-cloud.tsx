"use client"

import Link from "next/link"

import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { macwall } from "@/lib/macwall-site"
import { wallpapersGalleryPath } from "@/lib/public-catalog/urls"
import { categorySlugFromName } from "@/lib/seo/category-slugs"

export function CategoryCloud() {
  return (
    <div className="relative min-w-0 w-full overflow-hidden sm:w-[50%]">
      <InfiniteSlider gap={42} reverse speed={50} speedOnHover={18}>
        {macwall.categories.map((genre) => {
          const slug = categorySlugFromName(genre)
          return (
            <Link
              key={genre}
              href={wallpapersGalleryPath(slug)}
              className="font-pixel shrink-0 text-sm font-medium tracking-wide whitespace-nowrap text-foreground/80 hover:text-foreground"
            >
              {genre}
            </Link>
          )
        })}
      </InfiniteSlider>
    </div>
  )
}
