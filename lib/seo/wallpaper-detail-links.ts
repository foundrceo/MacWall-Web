import type { PublicWallpaper } from "@/lib/public-catalog/types"
import {
  COLLECTION_MIN_WALLPAPERS,
  getWallpaperCollection,
  wallpaperCollectionPath,
  wallpaperCollections,
  wallpaperMatchesCollection,
  type WallpaperCollection,
} from "@/lib/seo/wallpaper-collections"
import {
  isThinWallpaper,
  type WallpaperDetailContent,
} from "@/lib/seo/wallpaper-detail-content"
import type { WallpaperColor } from "@/lib/seo/wallpaper-palette"

/**
 * Detail-page links that depend on the rest of the catalog: collection chips,
 * tag and colour chips that lead to collections, and the "Also in" strip.
 * Only collections with enough wallpapers to be indexed are linked, and the
 * strip never links a noindex wallpaper.
 */

/** Wallpapers in the "Also in {collection}" strip. */
export const ALSO_IN_COLLECTION_LIMIT = 6

/** A strip with fewer new wallpapers than this isn't shown. */
const ALSO_IN_COLLECTION_MIN = 3

const COLLECTION_CHIP_LIMIT = 4

export type DetailCollectionLink = {
  collection: WallpaperCollection
  href: string
}

/** A tag chip: linked to the collection it names, or plain text. */
export type DetailTagChip = { label: string; href: string | null }

export type DetailColorChip = WallpaperColor & {
  href: string | null
  /** The colour collection the chip leads to. */
  collectionName: string | null
}

export type WallpaperDetailLinks = {
  collections: DetailCollectionLink[]
  tags: DetailTagChip[]
  colors: DetailColorChip[]
  alsoIn: {
    collection: WallpaperCollection
    href: string
    wallpapers: PublicWallpaper[]
  } | null
}

/** Colour collections per measured colour name, best match first. */
const COLOR_COLLECTION_SLUGS: Readonly<Record<string, readonly string[]>> = {
  red: ["red"],
  pink: ["pink"],
  magenta: ["pink", "purple"],
  purple: ["purple"],
  indigo: ["blue", "purple"],
  blue: ["blue"],
  teal: ["teal", "blue"],
  green: ["green"],
  lime: ["green"],
  orange: ["orange"],
  amber: ["orange"],
  black: ["black"],
  charcoal: ["black"],
  white: ["white"],
  "off-white": ["white"],
  "light grey": ["white"],
}

/** A collection about a real person. Read defensively: older data has no `rights`. */
function isLikenessCollection(entry: WallpaperCollection): boolean {
  return (entry as { rights?: string }).rights === "likeness"
}

/**
 * Whether a collection has enough wallpapers to be indexed (collection pages
 * below the minimum are noindex). Without the catalog nothing can be counted,
 * so every existing collection stays linkable, as before.
 */
function collectionLinkability(catalog: readonly PublicWallpaper[] | null) {
  const memo = new Map<string, boolean>()
  return (entry: WallpaperCollection): boolean => {
    if (!catalog) return true
    const known = memo.get(entry.slug)
    if (known !== undefined) return known
    let count = 0
    for (const wallpaper of catalog) {
      if (!wallpaperMatchesCollection(wallpaper, entry)) continue
      count += 1
      if (count >= COLLECTION_MIN_WALLPAPERS) break
    }
    const linkable = count >= COLLECTION_MIN_WALLPAPERS
    memo.set(entry.slug, linkable)
    return linkable
  }
}

function colorCollection(
  name: string,
  linkable: (entry: WallpaperCollection) => boolean
): WallpaperCollection | null {
  const base = name.replace(/^(?:deep|pale) /, "")
  for (const slug of COLOR_COLLECTION_SLUGS[name] ??
    COLOR_COLLECTION_SLUGS[base] ??
    []) {
    const entry = getWallpaperCollection(slug)
    if (entry && linkable(entry)) return entry
  }
  return null
}

function tagCollection(
  tag: string,
  linkable: (entry: WallpaperCollection) => boolean
): WallpaperCollection | null {
  return (
    wallpaperCollections.find(
      (entry) =>
        wallpaperMatchesCollection({ name: "", tags: [tag] }, entry) &&
        linkable(entry)
    ) ?? null
  )
}

function alsoInStrip(
  wallpaper: PublicWallpaper,
  candidates: readonly WallpaperCollection[],
  catalog: readonly PublicWallpaper[],
  similar: readonly PublicWallpaper[]
): WallpaperDetailLinks["alsoIn"] {
  // Wallpapers the rail already links add nothing here.
  const skip = new Set([wallpaper.id, ...similar.map((item) => item.id)])
  // Topic collections before real-person ones; at most three tried.
  const ordered = [
    ...candidates.filter((entry) => !isLikenessCollection(entry)),
    ...candidates.filter(isLikenessCollection),
  ].slice(0, 3)
  for (const collection of ordered) {
    const wallpapers: PublicWallpaper[] = []
    // The catalog index is most-liked first.
    for (const item of catalog) {
      if (skip.has(item.id) || !wallpaperMatchesCollection(item, collection))
        continue
      if (isThinWallpaper(item)) continue
      wallpapers.push(item)
      if (wallpapers.length >= ALSO_IN_COLLECTION_LIMIT) break
    }
    if (wallpapers.length >= ALSO_IN_COLLECTION_MIN) {
      return {
        collection,
        href: wallpaperCollectionPath(collection.slug),
        wallpapers,
      }
    }
  }
  return null
}

export function buildWallpaperDetailLinks(input: {
  wallpaper: PublicWallpaper
  content: WallpaperDetailContent
  /** The catalog index, most-liked first; null when it couldn't be read. */
  catalog: readonly PublicWallpaper[] | null
  /** The "More like this" rail on the same page. */
  similar: readonly PublicWallpaper[]
}): WallpaperDetailLinks {
  const { wallpaper, content, catalog, similar } = input
  const linkable = collectionLinkability(catalog)
  const indexable = content.collections.filter(linkable)
  const collections = indexable.slice(0, COLLECTION_CHIP_LIMIT)

  // Themes are the words the collection chips don't already cover: a tag
  // whose collection has a chip is left out, one leading to another
  // collection links there, and the rest are plain text (filtered ?tag=
  // views are noindex). A tag the name already says only earns a link.
  const linked = new Set(collections.map((entry) => entry.slug))
  const tags: DetailTagChip[] = []
  for (const tag of content.tags) {
    const entry = tagCollection(tag.label, linkable)
    if (entry && linked.has(entry.slug)) continue
    if (!entry && tag.echo) continue
    if (entry) linked.add(entry.slug)
    tags.push({
      label: tag.display,
      href: entry ? wallpaperCollectionPath(entry.slug) : null,
    })
  }

  const colors = content.colors.map((color) => {
    const entry = colorCollection(color.name, linkable)
    return {
      ...color,
      href: entry ? wallpaperCollectionPath(entry.slug) : null,
      collectionName: entry?.name ?? null,
    }
  })

  return {
    collections: collections.map((collection) => ({
      collection,
      href: wallpaperCollectionPath(collection.slug),
    })),
    tags,
    colors,
    alsoIn: catalog
      ? alsoInStrip(wallpaper, indexable, catalog, similar)
      : null,
  }
}
