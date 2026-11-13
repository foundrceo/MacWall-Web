"use client"

/** Wallpaper catalog, likes and community upload moderation. */

import {
  Panel,
  PanelBody,
  PanelHeader,
  Stat,
  StatGroup,
} from "@/components/admin/ui"

import { DashboardSection, PanelFigure, RankedList } from "./blocks"
import { formatCount, formatPercent, percentOf } from "./format"
import type { SectionProps } from "./types"

export function CatalogSection({ snapshot }: SectionProps) {
  const { data } = snapshot
  const uploads = data.communityUploads
  const uploadTotal = uploads.pending + uploads.approved + uploads.rejected
  const averageLikes =
    data.catalogWallpaperCount > 0
      ? Math.round(data.totalLikes / data.catalogWallpaperCount)
      : 0

  return (
    <DashboardSection
      id="catalog"
      title="Catalog and community"
      description="Wallpapers, likes and community uploads. All time."
    >
      <StatGroup columns={4}>
        <Stat
          label="Wallpapers"
          value={formatCount(data.catalogWallpaperCount)}
          hint="Live in the catalog"
        />
        <Stat
          label="Likes"
          value={formatCount(data.totalLikes)}
          hint={`${formatCount(averageLikes)} per wallpaper on average`}
        />
        <Stat
          label="Uploads to review"
          value={formatCount(uploads.pending)}
          hint="Community uploads awaiting moderation"
        />
        <Stat
          label="Upload approval rate"
          value={formatPercent(
            Math.round(percentOf(uploads.approved, uploadTotal))
          )}
          hint={`${formatCount(uploads.approved)} approved · ${formatCount(uploads.rejected)} rejected of ${formatCount(uploadTotal)}`}
        />
      </StatGroup>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Wallpapers by category"
            description="Count and share of the catalog"
            actions={
              data.wallpaperCategoryCounts.length > 0 ? (
                <PanelFigure
                  value={formatCount(data.wallpaperCategoryCounts.length)}
                  label={
                    data.wallpaperCategoryCounts.length === 1
                      ? "category"
                      : "categories"
                  }
                />
              ) : null
            }
          />
          <PanelBody>
            <RankedList
              label="Wallpapers by category"
              rows={data.wallpaperCategoryCounts.map((row) => ({
                key: row.category,
                label: row.category,
                value: row.count,
              }))}
              total={data.catalogWallpaperCount}
              empty="The catalog is empty."
            />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader
            title="Most liked wallpapers"
            description="Likes per wallpaper, all time"
          />
          <PanelBody>
            <RankedList
              label="Most liked wallpapers"
              rows={data.topLikedWallpapers.map((row) => ({
                key: row.id,
                label: row.name,
                value: row.likeCount,
                detail: (
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {row.category}
                  </span>
                ),
              }))}
              showShare={false}
              empty="No likes recorded yet."
            />
          </PanelBody>
        </Panel>
      </div>
    </DashboardSection>
  )
}
