import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { MacWallBrandLink } from "@/components/macwall-marketing/MacWallBrandLink"
import { LANDING_SHELL_CLASS } from "@/components/macwall-marketing/landing-type"
import MarketingFooterAiSummary from "@/components/macwall-marketing/marketing-footer-ai-summary"
import { MarketingSocialBrandIcon } from "@/components/macwall-marketing/marketing-social-icons"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"
import {
  footerCategoryLinks,
  footerCompareLinks,
  getMarketingFooterColumns,
  getMarketingFooterSocialLinks,
  type MarketingFooterLink,
} from "@/lib/marketing-footer-nav"

function FooterLink({ link }: Readonly<{ link: MarketingFooterLink }>) {
  const className = "transition-colors hover:text-landing-muted"

  if (link.external) {
    return (
      <a
        href={link.href}
        className={className}
        {...(link.href.startsWith("mailto:")
          ? {}
          : { target: "_blank", rel: "noopener noreferrer" })}
      >
        {link.label}
      </a>
    )
  }

  return (
    <Link href={link.href} className={className}>
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
    <footer id="company" className="bg-background">
      <div className={cn(LANDING_SHELL_CLASS, "py-20 md:py-28")}>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-between gap-8">
            <div className="flex flex-col gap-4">
              <MacWallBrandLink variant="footer" priority />
              <p className="max-w-sm text-[14px] leading-5 text-landing-muted">
                {macwall.tagline}
              </p>
              <div className="-ml-2 flex items-center gap-0.5">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="inline-flex size-9 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MarketingSocialBrandIcon brand={social.brand} />
                  </a>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Link
                href="/download"
                className="inline-flex w-fit items-center gap-1 border-b border-current pb-0.5 text-[16px] leading-6 text-white"
              >
                Download
                <ArrowUpRight className="size-4" />
              </Link>
              <p className="text-[14px] leading-5 text-landing-muted">
                © {macwall.legalCompanyName} {new Date().getFullYear()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title} className="flex flex-col gap-4">
                <p className="text-[14px] leading-5 text-landing-muted">
                  {column.title}
                </p>
                <ul className="flex flex-col gap-2.5 text-[16px] leading-6 text-white">
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

      <MarketingFooterAiSummary />
    </footer>
  )
}
