"use client"

import Image from "next/image"
import { X } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"

import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import { MarketingSocialBrandIcon } from "@/components/macwall-marketing/marketing-social-icons"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { INSTALL_GUIDE_EVENT } from "@/lib/install-guide-event"
import {
  macwall,
  macwallAppIconPath,
  macwallAppIconRadiusClass,
  macwallInstallerLatestPath,
} from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

const GUIDE_WIDTH =
  "w-[min(calc(100%-2rem),880px)] max-w-[min(calc(100%-2rem),880px)] sm:max-w-[min(calc(100%-2rem),880px)]"

/** The macOS arrow pointer, drawn so each scene shows where to click. */
function Pointer({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      viewBox="0 0 16 22"
      aria-hidden
      className={cn("absolute h-[22px] w-4 drop-shadow-[0_1px_2px_rgb(0_0_0/0.5)]", className)}
    >
      <path
        d="M1 1v17.5l4.2-4.1 2.9 6.6 2.6-1.1-2.9-6.5H14L1 1Z"
        fill="#000"
        stroke="#fff"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AppIcon({ size, className }: Readonly<{ size: number; className?: string }>) {
  return (
    <Image
      src={macwallAppIconPath}
      alt=""
      width={size}
      height={size}
      loading="eager"
      className={cn(macwallAppIconRadiusClass, "shadow-[0_8px_24px_rgb(0_0_0/0.45)]", className)}
      style={{ width: size, height: size }}
    />
  )
}

/** The macOS Applications folder. */
function ApplicationsFolder() {
  return (
    <Image
      src="/install/applications.png"
      alt=""
      width={160}
      height={160}
      loading="eager"
      className="size-[72px] drop-shadow-[0_8px_20px_rgb(0_0_0/0.4)]"
    />
  )
}

/**
 * Apple's own apps for the Dock, converted from this Mac's app bundles.
 * macOS icons carry ~10% transparent padding, so they are scaled up to
 * match the MacWall icon, which has none.
 */
const DOCK_APPS = {
  finder: "/install/finder.png",
  safari: "/install/safari.png",
  photos: "/install/photos.png",
  music: "/install/music.png",
} as const

function DockApp({
  app,
  className,
}: Readonly<{ app: keyof typeof DOCK_APPS; className?: string }>) {
  return (
    <Image
      src={DOCK_APPS[app]}
      alt=""
      width={64}
      height={64}
      loading="eager"
      className={cn("size-8 shrink-0 scale-[1.24]", className)}
    />
  )
}

function Scene({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      aria-hidden
      className="relative flex h-32 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.06] sm:h-44"
    >
      <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_45%,rgb(255_255_255/0.06),transparent_70%)]" />
      {children}
    </div>
  )
}

function Step({
  number,
  title,
  scene,
  children,
}: Readonly<{ number: number; title: string; scene: ReactNode; children: ReactNode }>) {
  return (
    <li className="flex flex-col">
      {scene}
      <p className="mt-5 text-[13px] text-marketing-muted">Step {number}</p>
      <p className="mt-1 font-display text-2xl leading-tight tracking-tight text-foreground">
        {title}
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-marketing-muted">{children}</p>
    </li>
  )
}

/**
 * Opens when a Mac visitor starts the download (see `announceDownloadStarted`)
 * and shows, as three small scenes, what they will actually see: the DMG in
 * Downloads, the drag onto Applications, the app in the Dock. Most
 * downloaders never get to a running app; this walks them there.
 */
export function InstallGuide() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const show = () => setOpen(true)
    window.addEventListener(INSTALL_GUIDE_EVENT, show)
    return () => window.removeEventListener(INSTALL_GUIDE_EVENT, show)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          GUIDE_WIDTH,
          "max-h-[92vh] gap-0 overflow-y-auto rounded-3xl border border-white/10 bg-secondary p-0 shadow-2xl ring-0"
        )}
      >
        <div className="px-6 pt-7 pb-8 sm:px-10 sm:pt-9 sm:pb-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="font-display text-3xl leading-tight font-normal tracking-tight text-foreground sm:text-4xl">
                Your Mac is about to come alive.
              </DialogTitle>
              <p className="mt-2 text-[14px] text-marketing-muted">
                {macwall.name} is downloading now. If it didn’t start,{" "}
                <TrackedDownloadButton
                  href={macwallInstallerLatestPath}
                  size="pill"
                  location="install_guide"
                  className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
                >
                  download it again
                </TrackedDownloadButton>
                .
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={macwall.discordInvite}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden h-9 items-center gap-2 rounded-full bg-white/10 px-3.5 text-[13px] font-medium text-foreground transition-colors outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/40 sm:inline-flex"
              >
                <MarketingSocialBrandIcon brand="Discord" className="size-4" />
                Join our Discord
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-9 items-center justify-center rounded-full bg-white/10 text-muted-foreground transition-colors outline-none hover:bg-white/15 hover:text-foreground focus-visible:ring-2 focus-visible:ring-white/40"
                aria-label="Close"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          <ol className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            <Step
              number={1}
              title="Open"
              scene={
                <Scene>
                  <div className="relative flex flex-col items-center">
                    <AppIcon size={56} />
                    <Pointer className="top-9 left-11" />
                    <span className="mt-3 rounded-[5px] bg-[#0a64d8] px-2 py-0.5 text-[13px] font-medium text-white">
                      {macwall.name}.dmg
                    </span>
                  </div>
                </Scene>
              }
            >
              Open {macwall.name}.dmg from your Downloads.
            </Step>
            <Step
              number={2}
              title="Install"
              scene={
                <Scene>
                  {/* Looping drag (styles: .mw-drag-* in globals.css). */}
                  <div className="relative flex items-center gap-10">
                    <div className="relative">
                      <div className="mw-drag-origin">
                        <AppIcon size={64} />
                      </div>
                      <div className="mw-drag-ghost absolute inset-0">
                        <AppIcon size={64} />
                      </div>
                      <Pointer className="mw-drag-pointer top-11 left-12 z-10" />
                    </div>
                    <div className="mw-drag-folder">
                      <ApplicationsFolder />
                    </div>
                  </div>
                </Scene>
              }
            >
              Drag {macwall.name} into your Applications folder.
            </Step>
            <Step
              number={3}
              title="Launch"
              scene={
                <Scene>
                  {/* None may shrink; the fifth app joins once the cards are
                      wide enough (lg) to hold it. */}
                  <div className="relative flex items-end gap-1.5 rounded-2xl bg-white/[0.08] px-2 py-1.5 ring-1 ring-white/10 backdrop-blur">
                    <DockApp app="finder" />
                    <DockApp app="safari" />
                    {/* Launch bounce (styles: .mw-dock-* in globals.css). */}
                    <div className="relative flex shrink-0 flex-col items-center">
                      <div className="mw-dock-bounce">
                        <AppIcon size={32} className="shadow-none" />
                      </div>
                      <span className="mw-dock-dot absolute -bottom-1 size-1 rounded-full bg-white/80" />
                      <Pointer className="mw-dock-click top-4 left-5 z-10 origin-top-left" />
                    </div>
                    <DockApp app="photos" />
                    <DockApp app="music" className="hidden lg:block" />
                  </div>
                </Scene>
              }
            >
              Open {macwall.name} and your 24 hours free, with everything
              included, begin.
            </Step>
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  )
}
