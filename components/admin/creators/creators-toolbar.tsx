"use client"

import {
  CONTENT_META,
  CONTENT_STATUSES,
  PAYMENT_META,
  PAYMENT_STATUSES,
  type DealFilters,
} from "@/components/admin/creators/deals"
import { SearchInput, Spinner } from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/** Search, the two status filters and the size of the result. */
export function CreatorsToolbar({
  search,
  onSearchChange,
  content,
  onContentChange,
  payment,
  onPaymentChange,
  hasFilters,
  onClear,
  countLabel,
  refreshing,
}: Readonly<{
  search: string
  onSearchChange: (value: string) => void
  content: DealFilters["content"]
  onContentChange: (value: DealFilters["content"]) => void
  payment: DealFilters["payment"]
  onPaymentChange: (value: DealFilters["payment"]) => void
  hasFilters: boolean
  onClear: () => void
  /** "12 creators" or "3 matches"; null until the first load lands. */
  countLabel: string | null
  refreshing: boolean
}>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search name or @handle"
        label="Search creators by name or handle"
      />
      <div className="flex w-full gap-2 sm:w-auto">
        <StatusFilter
          name="Content"
          value={content}
          onChange={onContentChange}
          options={CONTENT_STATUSES.map((status) => ({
            value: status,
            label: CONTENT_META[status].label,
          }))}
        />
        <StatusFilter
          name="Payment"
          value={payment}
          onChange={onPaymentChange}
          options={PAYMENT_STATUSES.map((status) => ({
            value: status,
            label: PAYMENT_META[status].label,
          }))}
        />
      </div>
      {hasFilters ? (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      ) : null}
      <p
        aria-live="polite"
        className="ml-auto flex h-8 items-center gap-2 text-xs text-muted-foreground tabular-nums"
      >
        {refreshing ? <Spinner className="size-3.5" /> : null}
        {countLabel}
      </p>
    </div>
  )
}

/** A status select that names itself in the trigger: "Content All". */
function StatusFilter<T extends string>({
  name,
  value,
  onChange,
  options,
}: Readonly<{
  name: string
  value: T | "all"
  onChange: (value: T | "all") => void
  options: readonly { value: T; label: string }[]
}>) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as T | "all")}>
      <SelectTrigger
        aria-label={`Filter by ${name.toLowerCase()} status`}
        className="min-w-0 flex-1 rounded-[9px] sm:w-44 sm:flex-none"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="text-muted-foreground">{name}</span>
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent position="popper" align="start">
        <SelectItem value="all">All</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
