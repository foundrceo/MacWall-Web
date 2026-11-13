"use client"

/**
 * Creator deals, one row each: reels promised vs done, amount agreed vs paid
 * vs left, content and payment status.
 */

import {
  AtSign,
  CircleCheck,
  Clapperboard,
  Download,
  Plus,
  RefreshCw,
  SearchX,
  Users,
  Wallet,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { CreatorDetail } from "@/components/admin/creators/creator-detail"
import { CreatorForm } from "@/components/admin/creators/creator-form"
import {
  CreatorsTable,
  CreatorsTableSkeleton,
} from "@/components/admin/creators/creators-table"
import { CreatorsToolbar } from "@/components/admin/creators/creators-toolbar"
import {
  CONTENT_META,
  LoadDealsError,
  createDeal,
  deleteDeal,
  downloadCsv,
  fetchDeals,
  formatMoney,
  updateDeal,
  type ContentStatus,
  type CreatorDeal,
  type DealFilters,
  type DealPayload,
} from "@/components/admin/creators/deals"
import { DeleteCreatorDialog } from "@/components/admin/creators/delete-creator-dialog"
import { AdminPage } from "@/components/admin/page"
import {
  EmptyState,
  IconButton,
  Notice,
  Panel,
  Skeleton,
  Stat,
  StatGroup,
} from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

export function CreatorsView() {
  /* Filters. Search and both statuses are applied by the API. */
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [content, setContent] = useState<DealFilters["content"]>("all")
  const [payment, setPayment] = useState<DealFilters["payment"]>("all")
  const [reloads, setReloads] = useState(0)

  /* Data. `deals` stays on screen while a newer request is in flight. */
  const [deals, setDeals] = useState<CreatorDeal[] | null>(null)
  const [loadError, setLoadError] = useState<LoadDealsError | null>(null)
  const [settledKey, setSettledKey] = useState<string | null>(null)

  /* Overlays. The record outlives `open` so closing can animate. */
  const [detailDeal, setDetailDeal] = useState<CreatorDeal | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [formDeal, setFormDeal] = useState<CreatorDeal | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formSession, setFormSession] = useState(0)
  const [removeTarget, setRemoveTarget] = useState<CreatorDeal | null>(null)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [actingId, setActingId] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300)
    return () => window.clearTimeout(timer)
  }, [search])

  const term = debouncedSearch.trim()
  const requestKey = `${reloads}|${content}|${payment}|${term}`

  useEffect(() => {
    const controller = new AbortController()
    fetchDeals({ search: term, content, payment }, controller.signal)
      .then((next) => {
        setDeals(next)
        setLoadError(null)
        setSettledKey(requestKey)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setLoadError(
          error instanceof LoadDealsError
            ? error
            : new LoadDealsError(
                errorMessage(error, "The creators list didn't load.")
              )
        )
        setSettledKey(requestKey)
      })
    return () => controller.abort()
  }, [requestKey, term, content, payment])

  const loading = settledKey !== requestKey
  const firstLoad = deals === null && loading
  const refreshing = deals !== null && loading
  const hasFilters = term !== "" || content !== "all" || payment !== "all"

  const reload = useCallback(() => setReloads((count) => count + 1), [])

  /** Put a saved deal on screen at once; the reload that follows confirms it. */
  const applyDeal = useCallback((deal: CreatorDeal) => {
    setDeals((current) => {
      if (!current) return current
      return current.some((item) => item.id === deal.id)
        ? current.map((item) => (item.id === deal.id ? deal : item))
        : [deal, ...current]
    })
    setDetailDeal((current) => (current?.id === deal.id ? deal : current))
  }, [])

  const stats = useMemo(() => {
    const list = deals ?? []
    const reelsPromised = list.reduce((sum, d) => sum + d.reelsPromised, 0)
    const reelsDone = list.reduce((sum, d) => sum + d.reelsDelivered, 0)
    const agreed = list.reduce((sum, d) => sum + d.agreedAmount, 0)
    const paid = list.reduce((sum, d) => sum + d.paidAmount, 0)
    return {
      creators: list.length,
      reelsPromised,
      reelsDone,
      agreed,
      paid,
      left: agreed - paid,
    }
  }, [deals])

  function clearFilters() {
    setSearch("")
    setDebouncedSearch("")
    setContent("all")
    setPayment("all")
  }

  function openAdd() {
    setFormDeal(null)
    setFormSession((session) => session + 1)
    setFormOpen(true)
  }

  function openEdit(deal: CreatorDeal) {
    setDetailOpen(false)
    setFormDeal(deal)
    setFormSession((session) => session + 1)
    setFormOpen(true)
  }

  function openDetail(deal: CreatorDeal) {
    setDetailDeal(deal)
    setDetailOpen(true)
  }

  function askRemove(deal: CreatorDeal) {
    setRemoveTarget(deal)
    setRemoveOpen(true)
  }

  /** Create or update from the form. Throws so the form can show the error. */
  async function saveDeal(payload: DealPayload, editing: CreatorDeal | null) {
    const saved = editing
      ? await updateDeal(editing.id, payload)
      : await createDeal(payload)
    if (saved) applyDeal(saved)
    setFormOpen(false)
    toast.success(
      editing
        ? `Updated ${payload.creatorName}`
        : `Added ${payload.creatorName} to the tracker`
    )
    reload()
  }

  async function patchDeal(
    deal: CreatorDeal,
    patch: Record<string, unknown>,
    label: string
  ) {
    setActingId(deal.id)
    try {
      const updated = await updateDeal(deal.id, patch)
      if (updated) applyDeal(updated)
      toast.success(label, { description: deal.creatorName })
      reload()
    } catch (error) {
      toast.error(`${deal.creatorName} wasn't updated`, {
        description: errorMessage(error, "Update failed. Try again."),
      })
    } finally {
      setActingId(null)
    }
  }

  /** One more reel done. Marks content posted when all promised are in. */
  function reelDone(deal: CreatorDeal) {
    const delivered = deal.reelsDelivered + 1
    const allIn = deal.reelsPromised > 0 && delivered >= deal.reelsPromised
    void patchDeal(
      deal,
      {
        reelsDelivered: delivered,
        ...(allIn ? { contentStatus: "posted" } : {}),
      },
      `Reel ${delivered}/${deal.reelsPromised} done`
    )
  }

  /** Full balance cleared. */
  function paidFull(deal: CreatorDeal) {
    void patchDeal(
      deal,
      { paidAmount: deal.agreedAmount, paymentStatus: "paid" },
      `Paid ${formatMoney(deal.balanceAmount, deal.currency)} in full`
    )
  }

  function changeContentStatus(deal: CreatorDeal, status: ContentStatus) {
    if (status === deal.contentStatus) return
    void patchDeal(
      deal,
      { contentStatus: status },
      `Content marked ${CONTENT_META[status].label.toLowerCase()}`
    )
  }

  async function confirmRemove() {
    const deal = removeTarget
    if (!deal) return
    setActingId(deal.id)
    try {
      await deleteDeal(deal.id)
      setDeals(
        (current) => current?.filter((item) => item.id !== deal.id) ?? current
      )
      setRemoveOpen(false)
      if (detailDeal?.id === deal.id) setDetailOpen(false)
      toast.success(`Removed ${deal.creatorName}`)
      reload()
    } catch (error) {
      toast.error(`${deal.creatorName} wasn't removed`, {
        description: errorMessage(error, "Delete failed. Try again."),
      })
    } finally {
      setActingId(null)
    }
  }

  /* The open detail follows the list, so quick actions update it in place. */
  const detail = detailDeal
    ? (deals?.find((item) => item.id === detailDeal.id) ?? detailDeal)
    : null

  const statCells = [
    {
      label: "Creators",
      value: stats.creators,
      hint: hasFilters ? "Matching the filters" : "Creator partnerships",
      icon: <Users />,
    },
    {
      label: "Reels done",
      value: `${stats.reelsDone}/${stats.reelsPromised}`,
      hint: "Delivered of promised",
      icon: <Clapperboard />,
    },
    {
      label: "Balance left",
      value: formatMoney(stats.left, "INR"),
      hint: stats.left > 0 ? "Still to pay" : "All settled",
      icon: <Wallet />,
    },
    {
      label: "Paid out",
      value: formatMoney(stats.paid, "INR"),
      hint: `Of ${formatMoney(stats.agreed, "INR")} agreed`,
      icon: <CircleCheck />,
    },
  ]

  const count = deals?.length ?? 0
  const countLabel = hasFilters
    ? `${count} ${count === 1 ? "match" : "matches"}`
    : `${count} ${count === 1 ? "creator" : "creators"}`

  return (
    <AdminPage
      title="Creators"
      description="Instagram creator deals: reels promised and delivered, what's agreed, paid and left."
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCsv(deals ?? [])}
            disabled={count === 0}
          >
            <Download aria-hidden />
            Export CSV
          </Button>
          <IconButton
            label="Refresh"
            variant="outline"
            size="icon"
            onClick={reload}
            disabled={loading}
          >
            <RefreshCw
              aria-hidden
              className={cn(
                loading && "animate-spin motion-reduce:animate-none"
              )}
            />
          </IconButton>
          <Button size="sm" onClick={openAdd}>
            <Plus aria-hidden />
            Add creator
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {loadError && !firstLoad ? (
          <Notice
            title={
              deals
                ? "Couldn't refresh the creators list"
                : "The creators list didn't load"
            }
            action={
              <Button variant="outline" size="sm" onClick={reload}>
                Try again
              </Button>
            }
          >
            <p>{loadError.message}</p>
            <p>
              {loadError.hint ??
                (deals
                  ? "Showing what loaded last. Try again in a moment."
                  : "Check the connection, then try again.")}
            </p>
          </Notice>
        ) : null}

        {deals || firstLoad ? (
          <StatGroup columns={4}>
            {statCells.map((cell) =>
              firstLoad ? (
                <div
                  key={cell.label}
                  className="border-r border-b border-border p-4"
                >
                  <p className="text-[12.5px] text-muted-foreground">
                    {cell.label}
                  </p>
                  <Skeleton className="mt-2.5 h-6 w-24" />
                  <Skeleton className="mt-3.5 mb-1 h-3 w-28" />
                </div>
              ) : (
                <Stat key={cell.label} {...cell} />
              )
            )}
          </StatGroup>
        ) : null}

        <div className="space-y-3">
          <CreatorsToolbar
            search={search}
            onSearchChange={setSearch}
            content={content}
            onContentChange={setContent}
            payment={payment}
            onPaymentChange={setPayment}
            hasFilters={hasFilters}
            onClear={clearFilters}
            countLabel={deals ? countLabel : null}
            refreshing={refreshing}
          />

          {firstLoad ? (
            <Panel className="overflow-hidden" aria-busy="true">
              <CreatorsTableSkeleton />
            </Panel>
          ) : deals && deals.length > 0 ? (
            <Panel className="overflow-hidden" aria-busy={refreshing}>
              <CreatorsTable
                deals={deals}
                actingId={actingId}
                stale={refreshing}
                onOpen={openDetail}
                onReelDone={reelDone}
                onPaidFull={paidFull}
                onEdit={openEdit}
                onRemove={askRemove}
              />
            </Panel>
          ) : deals ? (
            <Panel>
              {hasFilters ? (
                <EmptyState
                  icon={<SearchX />}
                  title="No creators match"
                  description="Nothing fits this search and these filters. Try another name or handle, or clear them."
                  action={
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={<AtSign />}
                  title="No creators yet"
                  description="Add your first deal to track reels promised and delivered, and what's agreed, paid and left."
                  action={
                    <Button variant="outline" size="sm" onClick={openAdd}>
                      <Plus aria-hidden />
                      Add creator
                    </Button>
                  }
                />
              )}
            </Panel>
          ) : null}

          {deals && deals.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Left is agreed minus paid. Payment status follows the paid amount.
              The totals above add up the rows shown.
            </p>
          ) : null}
        </div>
      </div>

      <CreatorDetail
        deal={detail}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        busy={detail !== null && actingId === detail.id}
        onReelDone={reelDone}
        onPaidFull={paidFull}
        onContentStatus={changeContentStatus}
        onEdit={openEdit}
        onRemove={askRemove}
      />

      <CreatorForm
        key={formSession}
        deal={formDeal}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={saveDeal}
      />

      <DeleteCreatorDialog
        deal={removeTarget}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        removing={removeTarget !== null && actingId === removeTarget.id}
        onConfirm={() => void confirmRemove()}
      />
    </AdminPage>
  )
}
