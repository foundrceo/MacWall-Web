"use client"

/**
 * Uploads: the community review queue plus the two publishing tools (bulk
 * catalog upload and still images to R2 `static-wallpapers/`). Each tool has
 * its own file; this view owns the page, the tab switch and the queue data.
 */

import { RefreshCw } from "lucide-react"
import { useState, type ReactNode } from "react"

import { AdminPage } from "@/components/admin/page"
import { IconButton, Segmented } from "@/components/admin/ui"
import { cn } from "@/lib/utils"

import { CatalogBulkUploadPanel } from "./catalog-bulk-upload-panel"
import { useReviewQueue } from "./review-data"
import { ReviewWorkspace } from "./review-workspace"
import { StaticWallpaperUploadPanel } from "./static-wallpaper-upload-panel"

type UploadsTab = "review" | "bulk" | "static"

/** Short label on phones, full label from `sm` up. */
function TabLabel({ short, full }: Readonly<{ short: string; full: string }>) {
  return (
    <>
      <span className="sm:hidden">{short}</span>
      <span className="hidden sm:inline">{full}</span>
    </>
  )
}

export function UploadsView() {
  const [tab, setTab] = useState<UploadsTab>("review")
  // A publishing tool mounts on its first visit and then stays mounted, so
  // switching tabs never interrupts an upload that is in progress.
  const [opened, setOpened] = useState({ bulk: false, static: false })
  const queue = useReviewQueue()
  const { pendingCount, refresh, refreshing } = queue

  function changeTab(next: UploadsTab) {
    setTab(next)
    if (next !== "review") {
      setOpened((current) => ({ ...current, [next]: true }))
    }
  }

  return (
    <AdminPage
      title="Uploads"
      description="Review submissions and publish new wallpapers."
      fill
      actions={
        <>
          {tab === "review" ? (
            <IconButton
              label="Refresh queue"
              side="bottom"
              disabled={refreshing}
              onClick={() => void refresh()}
            >
              <RefreshCw
                aria-hidden
                className={cn(
                  refreshing && "animate-spin motion-reduce:animate-none"
                )}
              />
            </IconButton>
          ) : null}
          <Segmented
            label="Uploads section"
            value={tab}
            onChange={changeTab}
            options={[
              {
                value: "review",
                label: <TabLabel short="Review" full="Review queue" />,
                count: pendingCount ?? undefined,
                ariaLabel:
                  pendingCount === null
                    ? "Review queue"
                    : `Review queue, ${pendingCount} pending`,
              },
              {
                value: "bulk",
                label: <TabLabel short="Bulk" full="Bulk upload" />,
                ariaLabel: "Bulk upload",
              },
              {
                value: "static",
                label: <TabLabel short="Static" full="Static wallpapers" />,
                ariaLabel: "Static wallpapers",
              },
            ]}
          />
        </>
      }
    >
      {tab === "review" ? <ReviewWorkspace queue={queue} /> : null}

      {opened.bulk ? (
        <ToolPane label="Bulk upload" hidden={tab !== "bulk"}>
          <CatalogBulkUploadPanel
            onUploaded={() => {
              // Keep the queue and its pending count current; never blocks
              // or fails the uploader.
              void refresh()
            }}
          />
        </ToolPane>
      ) : null}

      {opened.static ? (
        <ToolPane label="Static wallpapers" hidden={tab !== "static"}>
          <StaticWallpaperUploadPanel />
        </ToolPane>
      ) : null}
    </AdminPage>
  )
}

/** Scrolling, centred column for the publishing forms inside the fill page. */
function ToolPane({
  label,
  hidden,
  children,
}: Readonly<{ label: string; hidden: boolean; children: ReactNode }>) {
  return (
    <section
      aria-label={label}
      className={cn("min-h-0 flex-1 overflow-y-auto", hidden && "hidden")}
    >
      <div className="mx-auto w-full max-w-[1240px] px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  )
}
