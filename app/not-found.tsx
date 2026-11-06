import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"

import { CommandPaletteMount } from "@/components/command-palette/command-palette-mount"
import { NavSearchButton } from "@/components/macwall-marketing/nav-search-button"
import { StatusPage, statusPrimaryButton } from "@/components/status-page"
import { NotFoundIllustration } from "@/components/ui/404-page-not-found"
import { footerCategoryLinks } from "@/lib/marketing-footer-nav"
import { macwall } from "@/lib/macwall-site"
import {
  getWallpaperCollection,
  WALLPAPER_COLLECTIONS_HUB_PATH,
  wallpaperCollectionPath,
} from "@/lib/seo/wallpaper-collections"
import { cn } from "@/lib/utils"

/**
 * No `robots` here: the framework already adds `noindex` to every not-found
 * response, and a second robots tag only duplicated it.
 */
export const metadata: Metadata = {
  title: "Page not found",
  description: `The page you requested is not on the ${macwall.name} site.`,
}

/** Generic topics (no franchise or brand), so the list never needs a rights review. */
const POPULAR_COLLECTION_SLUGS = [
  "rain",
  "lofi",
  "mountain",
  "sunset",
  "galaxy",
  "ocean",
  "forest",
  "city",
] as const

const popularCollections = POPULAR_COLLECTION_SLUGS.flatMap((slug) => {
  const entry = getWallpaperCollection(slug)
  return entry?.rights === "generic"
    ? [{ href: wallpaperCollectionPath(slug), label: entry.name }]
    : []
})

/** The 8 browsable categories; "Others" is a catch-all, not a destination. */
const categoryLinks = footerCategoryLinks.filter(
  (link) => link.href !== "/wallpapers/others"
)

const secondaryButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/10 px-5 text-sm font-medium text-foreground transition-colors outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/40"

const chipClass =
  "inline-flex h-8 items-center rounded-full border border-border px-3 text-[13px] text-muted-foreground transition-colors outline-none hover:border-white/30 hover:text-foreground focus-visible:ring-2 focus-visible:ring-white/40"

function LinkGroup({
  title,
  links,
}: Readonly<{
  title: string
  links: readonly { href: string; label: string }[]
}>) {
  return (
    <nav aria-label={title} className="flex flex-col items-center gap-3">
      <p className="text-[13px] text-muted-foreground/80">{title}</p>
      <ul className="flex max-w-xl flex-wrap justify-center gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} prefetch={false} className={chipClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function NotFound() {
  return (
    <StatusPage
      art={<NotFoundIllustration className="text-[#67edec]" />}
      title="Page not found"
      body="This page doesn't exist or has moved. Search the wallpapers, or pick up from one of these."
      action={
        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/wallpapers" className={statusPrimaryButton}>
              Browse wallpapers
            </Link>
            <CommandPaletteMount>
              <NavSearchButton
                showLabel
                className={cn(secondaryButton, "text-foreground")}
              />
            </CommandPaletteMount>
          </div>

          <LinkGroup title="Categories" links={categoryLinks} />
          <LinkGroup
            title="Popular collections"
            links={[
              ...popularCollections,
              {
                href: WALLPAPER_COLLECTIONS_HUB_PATH,
                label: "All collections",
              },
            ]}
          />

          <nav
            aria-label={macwall.name}
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
          >
            <Link
              href="/"
              prefetch={false}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Home
            </Link>
            <Link
              href="/download"
              prefetch={false}
              className="transition-colors hover:text-foreground"
            >
              Download {macwall.name}
            </Link>
            <Link
              href="/pricing"
              prefetch={false}
              className="transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              prefetch={false}
              className="transition-colors hover:text-foreground"
            >
              Help center
            </Link>
          </nav>
        </div>
      }
    />
  )
}
