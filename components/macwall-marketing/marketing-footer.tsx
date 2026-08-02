import Link from "next/link"

import { MacWallBrandLink } from "@/components/macwall-marketing/MacWallBrandLink"
import MarketingFooterAiSummary from "@/components/macwall-marketing/marketing-footer-ai-summary"
import { MarketingSocialBrandIcon } from "@/components/macwall-marketing/marketing-social-icons"
import { macwall } from "@/lib/macwall-site"
import {
  footerCategoryLinks,
  footerCompareLinks,
  getMarketingFooterColumns,
  getMarketingFooterSocialLinks,
  type MarketingFooterLink,
} from "@/lib/marketing-footer-nav"

const footerColumnTitleClass =
  "mb-4 text-[15px] font-medium leading-none text-foreground"

const footerLinkClass =
  "inline-block rounded-sm text-[14px] leading-[1.45] text-marketing-muted transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const socialLinkClass =
  "inline-flex size-9 items-center justify-center rounded-full text-white/70 transition-colors outline-none hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-white/40"

function FooterLink({ link }: Readonly<{ link: MarketingFooterLink }>) {
  if (link.external) {
    return (
      <a
        href={link.href}
        className={footerLinkClass}
        {...(link.href.startsWith("mailto:")
          ? {}
          : { target: "_blank", rel: "noopener noreferrer" })}
      >
        {link.label}
      </a>
    )
  }

  return (
    <Link href={link.href} className={footerLinkClass}>
      {link.label}
    </Link>
  )
}

export default function MacWallMarketingFooter() {
  const columns = [
    ...getMarketingFooterColumns(),
    {
      title: "Compare",
      links: footerCompareLinks.map((link) => ({
        label: link.label,
        href: link.href,
      })),
    },
    {
      title: "Categories",
      links: footerCategoryLinks.map((link) => ({
        label: link.label,
        href: link.href,
      })),
    },
  ]
  const socialLinks = getMarketingFooterSocialLinks()

  return (
    <footer className="border-t border-border bg-background">
      <div className="marketing-container py-14 md:py-16 lg:py-20">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16 xl:gap-24">
          <div className="max-w-[18rem] shrink-0">
            <MacWallBrandLink variant="footer" priority />

            <p className="mt-4 text-[14px] leading-[1.55] text-marketing-muted">
              {macwall.tagline}
            </p>

            <div className="-ml-[9px] mt-5 flex items-center gap-0.5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={socialLinkClass}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MarketingSocialBrandIcon brand={social.brand} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-3 sm:gap-x-12 lg:max-w-[42rem] lg:justify-self-end xl:max-w-[48rem] xl:gap-x-14">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <p className={footerColumnTitleClass}>{column.title}</p>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.href}`}>
                      <FooterLink link={link} />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </div>

      <MarketingFooterAiSummary className="border-t border-border/60" />
    </footer>
  )
}
