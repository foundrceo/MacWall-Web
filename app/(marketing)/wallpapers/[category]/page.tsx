import { SeoLandingPage } from "@/components/content/seo-landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import {
  categoryNameFromSlug,
  wallpaperCategorySlugs,
} from "@/lib/seo/category-slugs"
import { wallpaperCategoryPage } from "@/lib/seo/landing-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

type PageProps = {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return wallpaperCategorySlugs.map((category) => ({ category }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params
  const name = categoryNameFromSlug(category)
  if (!name) return {}

  return createSeoPageMetadata(wallpaperCategoryPage(name))
}


export default async function WallpaperCategoryPage({ params }: PageProps) {
  const { category } = await params
  const name = categoryNameFromSlug(category)
  if (!name) notFound()

  const page = wallpaperCategoryPage(name)
  const origin = canonicalSiteOrigin()

  return (
    <>
      <JsonLd
        payload={webPageWithBreadcrumbsJsonLd({
          origin,
          pathname: page.pathname,
          pageTitle: `${name} Wallpapers`,
          headline: page.headline,
          description: page.description,
        })}
      />
      {page.faq ? <JsonLd payload={faqPageJsonLd(page.faq)} /> : null}
      <SeoLandingPage
        page={page}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Wallpapers", href: "/live-wallpaper-mac" },
          { label: name, href: page.pathname },
        ]}
      />
    </>
  )
}
