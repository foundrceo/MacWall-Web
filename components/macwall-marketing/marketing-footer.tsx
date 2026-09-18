import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import { MacWallBrandLink } from "@/components/macwall-marketing/MacWallBrandLink"
import { landingShellPad } from "@/components/macwall-marketing/landing-type"
import MarketingFooterAiSummary from "@/components/macwall-marketing/marketing-footer-ai-summary"
import { MarketingSocialBrandIcon } from "@/components/macwall-marketing/marketing-social-icons"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { macwall, macwallInstallerLatestPath } from "@/lib/macwall-site"
import {
  getMarketingFooterColumns,
  getMarketingFooterSocialLinks,
  type MarketingFooterLink,
} from "@/lib/marketing-footer-nav"
import { cn } from "@/lib/utils"

const footerColumnTitleClass =
  "mb-4 text-[15px] font-medium leading-none text-foreground"

const footerLinkClass =
  "inline-block rounded-sm text-[14px] leading-[1.45] text-marketing-muted transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const socialLinkClass =
  "inline-flex size-9 items-center justify-center rounded-full text-white/70 transition-colors outline-none hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-white/40"

const footerDownloadClass =
  "mt-6 inline-flex w-fit items-center gap-1 text-[14px] font-medium text-foreground outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"

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
  const columns = getMarketingFooterColumns()
  const socialLinks = getMarketingFooterSocialLinks()

  return (
    <footer id="company" className="bg-background">
      <div className="container relative mx-auto">
        <div className="border-border border-dashed sm:border-x">
          <div className={cn(landingShellPad, "py-14 md:py-16 lg:py-20")}>
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

              <TrackedDownloadButton
                href={macwallInstallerLatestPath}
                size="pill"
                location="footer"
                className={footerDownloadClass}
              >
                <span className="underline decoration-foreground underline-offset-4">
                  {macwallMarketingCopy.footer.shop.download}
                </span>
                <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden />
              </TrackedDownloadButton>

                <p className="mt-4 text-[13px] leading-[1.45] text-white/40">
                  © {new Date().getFullYear()}{" "}
                  {macwallMarketingCopy.footer.copyrightName}
                </p>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-x-10 gap-y-10 sm:gap-x-12 lg:max-w-[46rem] lg:grid-cols-4 lg:justify-self-end xl:max-w-[52rem] xl:gap-x-14">
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

          <MarketingFooterAiSummary />
        </div>
      </div>
    </footer>
  )
}
