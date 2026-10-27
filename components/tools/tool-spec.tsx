import Link from "next/link"
import type { ReactNode } from "react"
import { ChevronRight, Check } from "lucide-react"

import MarketingFaqSection from "@/components/macwall-marketing/MarketingFaqSection"
import type { ContentFaq } from "@/lib/content/types"
import { macwall } from "@/lib/macwall-site"
import {
  accessedLabel,
  displayResolutionLabel,
  MAC_DISPLAY_SPECS_ACCESSED,
  macDisplays,
} from "@/lib/seo/mac-displays"
import {
  TOOL_APPLE_SOURCES,
  TOOLS_HUB_PATH,
  TOOLS_SHARED_FACTS,
  tools,
  type ToolFact,
  type ToolPage,
} from "@/lib/tools/tools"
import { cn } from "@/lib/utils"

/**
 * /tools pages in the "spec sheet" direction (same structure as PostMesh's
 * /platform pages, which the owner picked): one centred reading column, a
 * direct answer, facts as label/value rows in one card, numbered steps, then
 * the FAQ. The interactive tool sits in its own card right under the header.
 */

export const TOOL_CARD =
  "rounded-[28px] bg-white/[0.035] ring-1 ring-white/[0.08] ring-inset"
const HAIRLINE = "border-white/[0.08]"
const INK = "text-white"
const INK_2 = "text-white/70"
const INK_3 = "text-white/45"
const COLUMN =
  "mx-auto w-full max-w-[720px] px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20"
const H2 =
  "font-display text-[26px] leading-8 font-normal tracking-tight text-balance text-white"
const BODY = cn("text-[16px] leading-7", INK_2)
const PRIMARY =
  "inline-flex h-11 items-center rounded-full bg-white px-5 text-[15px] font-medium text-black transition-colors duration-150 hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
const SECONDARY =
  "inline-flex h-11 items-center rounded-full bg-white/[0.08] px-5 text-[15px] text-white transition-colors duration-150 hover:bg-white/[0.14] focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
const LINK =
  "rounded-sm text-white underline decoration-white/30 decoration-1 underline-offset-4 transition-colors duration-150 hover:decoration-white"

/** Simple line icons, one per tool, drawn in the brand's white on dark. */
export function ToolIcon({
  slug,
  size = 40,
}: Readonly<{ slug: string; size?: number }>) {
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full bg-white/[0.08] text-white"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.5}
        height={size * 0.5}
        {...stroke}
      >
        {slug === "wallpaper-resizer" ? (
          <>
            <rect x="3" y="4" width="18" height="12" rx="2" />
            <path d="M8 20h8M12 16v4M7 8h3M7 8v3M17 12h-3M17 12V9" />
          </>
        ) : slug === "screen-resolution" ? (
          <>
            <rect x="3" y="4" width="18" height="12" rx="2" />
            <path d="M8 20h8M12 16v4M7 10h10M7 10l2-2M7 10l2 2M17 10l-2-2M17 10l-2 2" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="8.5" />
            <circle cx="9" cy="9" r="1.4" />
            <circle cx="14.5" cy="8.5" r="1.4" />
            <circle cx="16" cy="13.5" r="1.4" />
            <path d="M11 19.5c-1.5-1-1.2-3 .4-3.4 1.4-.3 1.7-1.9.3-2.6" />
          </>
        )}
      </svg>
    </span>
  )
}

function Breadcrumb({ current }: Readonly<{ current?: string }>) {
  const crumb = "transition-colors duration-150 hover:text-white"
  return (
    <nav aria-label="Breadcrumb" className={cn("text-[13px] leading-5", INK_3)}>
      <ol className="flex items-center justify-center gap-2">
        <li>
          <Link href="/" className={crumb}>
            Home
          </Link>
        </li>
        <li aria-hidden>/</li>
        {current ? (
          <>
            <li>
              <Link href={TOOLS_HUB_PATH} className={crumb}>
                Tools
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className={INK_2}>
              {current}
            </li>
          </>
        ) : (
          <li aria-current="page" className={INK_2}>
            Tools
          </li>
        )}
      </ol>
    </nav>
  )
}

function Header({
  icon,
  title,
  line,
  breadcrumb,
  children,
}: Readonly<{
  icon: ReactNode
  title: string
  line: string
  breadcrumb?: string
  children?: ReactNode
}>) {
  return (
    <header className="flex flex-col items-center gap-6 pb-12 text-center">
      <Breadcrumb current={breadcrumb} />
      {icon}
      <h1 className="font-display text-[36px] leading-[44px] font-normal tracking-tight text-balance text-white sm:text-[48px] sm:leading-[56px]">
        {title}
      </h1>
      <p
        className={cn(
          "max-w-[560px] text-[17px] leading-7 text-balance",
          INK_2
        )}
      >
        {line}
      </p>
      {children}
    </header>
  )
}

function Section({
  id,
  title,
  children,
}: Readonly<{ id: string; title: string; children: ReactNode }>) {
  return (
    <section aria-labelledby={id} className="mt-16 flex flex-col gap-5">
      <h2 id={id} className={H2}>
        {title}
      </h2>
      {children}
    </section>
  )
}

/** Facts as label / value rows in one card, divided by hairlines. */
export function FactCard({ facts }: Readonly<{ facts: readonly ToolFact[] }>) {
  return (
    <dl className={cn(TOOL_CARD, "px-5 sm:px-6")}>
      {facts.map((fact, i) => (
        <div
          key={fact.label}
          className={cn(
            "grid gap-1 py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6",
            i > 0 && cn("border-t", HAIRLINE)
          )}
        >
          <dt className={cn("text-[15px] leading-6", INK_3)}>{fact.label}</dt>
          <dd className={cn("text-[15px] leading-6", INK)}>{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Apple's native resolutions, the table every tool page shares. */
export function MacDisplayTable() {
  return (
    <div className={cn(TOOL_CARD, "overflow-x-auto")}>
      <table className="w-full min-w-[560px] border-collapse text-left text-[14px] leading-5">
        <caption className="sr-only">
          Native resolution of every Mac, from Apple&apos;s tech specs
        </caption>
        <thead>
          <tr className={INK_3}>
            <th scope="col" className="px-5 py-4 font-normal">
              Display
            </th>
            <th scope="col" className="px-3 py-4 font-normal">
              Screen
            </th>
            <th scope="col" className="px-3 py-4 font-normal">
              Native resolution
            </th>
            <th scope="col" className="px-5 py-4 font-normal">
              Pixels per inch
            </th>
          </tr>
        </thead>
        <tbody>
          {macDisplays.map((d) => (
            <tr key={d.id} className={cn("border-t align-top", HAIRLINE)}>
              <th scope="row" className={cn("px-5 py-3.5 font-normal", INK)}>
                {d.name}
              </th>
              <td className={cn("px-3 py-3.5", INK_2)}>{d.sizeInches}-inch</td>
              <td className={cn("px-3 py-3.5 tabular-nums", INK_2)}>
                {displayResolutionLabel(d)}
              </td>
              <td className={cn("px-5 py-3.5 tabular-nums", INK_2)}>{d.ppi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Sources() {
  return (
    <ul className="flex flex-col gap-2">
      {[...new Map(macDisplays.map((d) => [d.source, d])).values()].map((d) => (
        <li key={d.source} className={cn("text-[14px] leading-6", INK_3)}>
          <a href={d.source} className={LINK} rel="noopener" target="_blank">
            {d.name} tech specs
          </a>
          , Apple, accessed {accessedLabel(d.accessed)}
        </li>
      ))}
    </ul>
  )
}

/** List of tools as rows with chevrons, like PostMesh's network list. */
function ToolList({ exclude }: Readonly<{ exclude?: string }>) {
  const items = tools.filter((tool) => tool.slug !== exclude)
  return (
    <ul className={cn(TOOL_CARD, "p-2")}>
      {items.map((tool, i) => (
        <li
          key={tool.slug}
          className={cn(
            "group/row relative",
            i > 0 &&
              "before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-white/[0.08] before:transition-opacity before:duration-150 hover:before:opacity-0 [li:hover+&]:before:opacity-0"
          )}
        >
          <Link
            href={tool.pathname}
            className="flex items-center gap-4 rounded-[20px] px-4 py-3.5 transition-colors duration-150 outline-none hover:bg-white/[0.06] focus-visible:bg-white/[0.06]"
          >
            <ToolIcon slug={tool.slug} size={40} />
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] leading-6 font-medium text-white">
                {tool.name}
              </span>
              <span className={cn("block text-[14px] leading-5", INK_2)}>
                {tool.summary}
              </span>
            </span>
            <ChevronRight
              aria-hidden
              className="size-5 shrink-0 text-white/45 transition-[color,transform] duration-150 group-hover/row:translate-x-0.5 group-hover/row:text-white motion-reduce:group-hover/row:translate-x-0"
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}

function Faq({ items }: Readonly<{ items: readonly ContentFaq[] }>) {
  return (
    <MarketingFaqSection
      items={items.map((item) => ({ q: item.question, a: item.answer }))}
    />
  )
}

/** /tools: every tool, the screens they size for, and what they share. */
export function ToolsHubPage({
  faq,
}: Readonly<{ faq: readonly ContentFaq[] }>) {
  return (
    <>
      <article className={COLUMN}>
        <Header
          icon={
            <div aria-hidden className="flex -space-x-2">
              {tools.map((tool) => (
                <span
                  key={tool.slug}
                  className="rounded-full ring-4 ring-black"
                >
                  <ToolIcon slug={tool.slug} size={44} />
                </span>
              ))}
            </div>
          }
          title="Wallpaper tools for your Mac"
          line="Free tools that run in your browser. Size a wallpaper for any Mac screen, check your resolution, or pull the colours out of an image."
        >
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={tools[0].pathname} className={PRIMARY}>
              Open the resizer
            </Link>
            <Link href="/wallpapers" className={SECONDARY}>
              Browse live wallpapers
            </Link>
          </div>
        </Header>

        <section aria-labelledby="tools" className="flex flex-col gap-5">
          <h2 id="tools" className={H2}>
            Tools
          </h2>
          <ToolList />
        </section>

        <Section id="screens" title="Every Mac screen, side by side">
          <MacDisplayTable />
          <p className={cn("text-[14px] leading-6", INK_3)}>
            From Apple&apos;s tech specs, read{" "}
            {accessedLabel(MAC_DISPLAY_SPECS_ACCESSED)}. Sources are listed on
            each tool.
          </p>
        </Section>

        <Section id="same" title="The same in every tool">
          <FactCard facts={TOOLS_SHARED_FACTS} />
        </Section>
      </article>
      <Faq items={faq} />
    </>
  )
}

/** /tools/[slug]: the tool, then the spec sheet around it. */
export function ToolSpecPage({
  tool,
  children,
}: Readonly<{ tool: ToolPage; children: ReactNode }>) {
  const showDisplays = tool.slug !== "color-palette"
  return (
    <>
      <article className={COLUMN}>
        <Header
          icon={<ToolIcon slug={tool.slug} size={64} />}
          title={tool.headline.replace(/^./, (c) => c.toUpperCase())}
          line={tool.line}
          breadcrumb={tool.name}
        />

        {children}

        <Section id="answer" title={tool.question}>
          <p className={cn(BODY, "sm:text-[17px]")}>{tool.answer}</p>
        </Section>

        <Section id="facts" title={`What the ${tool.name.toLowerCase()} does`}>
          <FactCard facts={tool.facts} />
        </Section>

        <Section id="how-to" title="How to use it">
          <ol className="flex flex-col gap-5">
            {tool.steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/[0.08] text-[14px] text-white tabular-nums">
                  {i + 1}
                </span>
                <p className={cn("pt-0.5", BODY)}>
                  <span className="font-medium text-white">{step.title}.</span>{" "}
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        {showDisplays ? (
          <Section id="screens" title="Native resolution of every Mac">
            <MacDisplayTable />
          </Section>
        ) : null}

        <Section id="live" title="Want it to move?">
          <ul className="flex flex-col gap-3">
            {[
              `${macwall.name} plays 4K video wallpapers behind your windows on macOS.`,
              "Every wallpaper page shows its resolution and the colours measured from it.",
              "Every download starts with a free 24-hour trial.",
            ].map((item) => (
              <li key={item} className={cn("flex gap-3", BODY)}>
                <Check
                  aria-hidden
                  className="mt-1.5 size-4 shrink-0 text-white/70"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link href="/download" className={PRIMARY}>
              Download {macwall.name}
            </Link>
            <Link href="/wallpapers" className={SECONDARY}>
              Browse live wallpapers
            </Link>
          </div>
        </Section>

        <Section id="more" title="More tools">
          <ToolList exclude={tool.slug} />
        </Section>

        {showDisplays ? (
          <Section id="sources" title="Sources">
            <Sources />
          </Section>
        ) : null}
      </article>
      <Faq items={tool.faq} />
    </>
  )
}

export { TOOL_APPLE_SOURCES }
