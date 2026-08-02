import Link from "next/link"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import { macwall } from "@/lib/macwall-site"
import { categorySlugFromName } from "@/lib/seo/category-slugs"

const categoryCellClass =
  "flex h-16 w-full items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[15px] font-medium text-foreground/90 transition-colors hover:border-white/20 hover:bg-white/[0.05] sm:h-[4.5rem] md:h-20"

export default function CategoriesSection() {
  const { categoriesTitle, categoriesSubtitle } = macwallExactCopy.demoBrowse

  return (
    <section className="marketing-section">
      <div className="marketing-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[clamp(1.625rem,2.8vw,2.25rem)] font-normal leading-[1.2] tracking-[-0.02em]">
            {categoriesTitle}
          </h2>
          <p className="mt-4 text-[17px] leading-[1.55] text-foreground/70">
            {categoriesSubtitle}
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
          {macwall.categories.map((name) => {
            const slug = categorySlugFromName(name)
            if (!slug) return null

            return (
              <div
                key={name}
                className="relative flex items-center justify-center"
              >
                <Link href={`/wallpapers/${slug}`} className={categoryCellClass}>
                  {name}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
