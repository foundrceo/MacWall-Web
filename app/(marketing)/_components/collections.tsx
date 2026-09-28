import Link from "next/link"

import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import {
  WALLPAPER_COLLECTIONS_HUB_PATH,
  getWallpaperCollection,
  wallpaperCollectionPath,
  type WallpaperCollection,
} from "@/lib/seo/wallpaper-collections"

/** Highest-volume topics first (Semrush US) — the homepage is the strongest internal link source. */
const HOME_COLLECTION_SLUGS = [
  "gojo",
  "spider-man",
  "naruto",
  "goku",
  "anime-girl",
  "purple",
  "red",
  "batman",
  "lamborghini",
  "bmw",
  "f1",
  "jdm",
  "rain",
  "lofi",
  "cyberpunk",
  "galaxy",
  "ocean",
  "moon",
] as const

export function Collections() {
  const collections = HOME_COLLECTION_SLUGS.map((slug) =>
    getWallpaperCollection(slug)
  ).filter((entry): entry is WallpaperCollection => Boolean(entry))

  return (
    <MarketingSection className="relative w-full py-10">
      <div className="flex flex-col gap-8 px-6">
        <div className="flex flex-col gap-2">
          <h2 className="max-w-xl text-left text-3xl font-normal tracking-tighter md:text-5xl">
            Live backgrounds for every Mac desktop
          </h2>
          <p className="max-w-2xl text-left text-lg leading-relaxed tracking-tight text-muted-foreground">
            Moving wallpapers for anime fans, car people, and anyone who wants
            rain on the window while they work. Every collection is a set of 4K
            live desktop backgrounds you can preview on the web and set on your
            Mac in one click.
          </p>
        </div>
        <ul className="flex flex-wrap gap-2.5">
          {collections.map((entry) => (
            <li key={entry.slug}>
              <Link
                href={wallpaperCollectionPath(entry.slug)}
                className="inline-flex h-9 items-center rounded-full border border-border bg-muted/60 px-3.5 text-[14px] text-foreground transition-colors hover:bg-muted"
              >
                {entry.name} wallpapers
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={WALLPAPER_COLLECTIONS_HUB_PATH}
              className="inline-flex h-9 items-center rounded-full bg-foreground px-3.5 text-[14px] text-background transition-opacity hover:opacity-90"
            >
              All collections
            </Link>
          </li>
        </ul>
      </div>
    </MarketingSection>
  )
}
