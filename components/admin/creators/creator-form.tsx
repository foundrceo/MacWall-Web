"use client"

/**
 * Add or edit a creator deal in a side panel. The parent remounts this with a
 * new `key` each time it opens, so the fields always start from `deal`.
 */

import { useState, type FormEvent, type ReactNode } from "react"

import {
  CONTENT_META,
  CONTENT_STATUSES,
  EMPTY_FORM,
  PAYMENT_META,
  VALIDATED_FIELDS,
  derivePayment,
  formFromDeal,
  formatMoney,
  parseAmount,
  payloadFromForm,
  validateForm,
  type ContentStatus,
  type CreatorDeal,
  type DealForm,
  type DealFormErrors,
  type DealPayload,
} from "@/components/admin/creators/deals"
import { Field, Notice, Spinner } from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

const CURRENCIES = ["INR", "USD"] as const

const fieldId = (name: keyof DealForm) => `creator-${name}`

export function CreatorForm({
  deal,
  open,
  onOpenChange,
  onSave,
}: Readonly<{
  /** The deal being edited, or null to add one. */
  deal: CreatorDeal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Resolves once saved; rejects with the reason to show in the form. */
  onSave: (payload: DealPayload, editing: CreatorDeal | null) => Promise<void>
}>) {
  const [form, setForm] = useState<DealForm>(() =>
    deal ? formFromDeal(deal) : EMPTY_FORM
  )
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  /* Errors appear after the first submit, then clear as fields are fixed. */
  const errors: DealFormErrors = submitted ? validateForm(form) : {}

  function set<K extends keyof DealForm>(key: K, value: DealForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setSubmitted(true)
    const found = validateForm(form)
    const firstInvalid = VALIDATED_FIELDS.find((field) => found[field])
    if (firstInvalid) {
      document.getElementById(fieldId(firstInvalid))?.focus()
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await onSave(payloadFromForm(form), deal)
    } catch (error) {
      setSaveError(
        error instanceof Error && error.message
          ? error.message
          : "Save failed. Try again."
      )
    } finally {
      setSaving(false)
    }
  }

  const agreed = parseAmount(form.agreedAmount)
  const paid = parseAmount(form.paidAmount)
  const amountsValid = Number.isFinite(agreed) && Number.isFinite(paid)
  const paymentCancelled = form.paymentStatus === "cancelled"
  const autoPayment = amountsValid
    ? derivePayment(paid, agreed, "unpaid")
    : "unpaid"
  const balance = amountsValid ? agreed - paid : 0
  const currencies = CURRENCIES.includes(
    form.currency as (typeof CURRENCIES)[number]
  )
    ? CURRENCIES
    : [...CURRENCIES, form.currency]

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!saving) onOpenChange(next)
      }}
    >
      <SheetContent className="w-full! gap-0 border-border bg-background p-0 sm:max-w-[520px]!">
        <form
          noValidate
          onSubmit={(event) => void onSubmit(event)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <header className="border-b border-border py-4 pr-14 pl-5">
            <SheetTitle className="truncate text-[15px] leading-tight font-semibold tracking-[-0.01em]">
              {deal ? `Edit ${deal.creatorName}` : "Add creator"}
            </SheetTitle>
            <SheetDescription className="mt-1 text-[13px]">
              One deal per creator. Only the name and handle are required.
            </SheetDescription>
          </header>

          <div className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
            <FormSection title="Creator">
              <Field
                label="Name"
                htmlFor={fieldId("creatorName")}
                error={errors.creatorName}
              >
                <Input
                  id={fieldId("creatorName")}
                  value={form.creatorName}
                  onChange={(event) => set("creatorName", event.target.value)}
                  aria-invalid={errors.creatorName ? true : undefined}
                  autoComplete="off"
                  placeholder="Shrasti Agarwal"
                />
              </Field>
              <Field
                label="Instagram handle"
                htmlFor={fieldId("instagramHandle")}
                error={errors.instagramHandle}
              >
                <div className="relative">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-[13px] text-muted-foreground"
                  >
                    @
                  </span>
                  <Input
                    id={fieldId("instagramHandle")}
                    value={form.instagramHandle}
                    onChange={(event) =>
                      set(
                        "instagramHandle",
                        event.target.value.replace(/^@+/, "")
                      )
                    }
                    aria-invalid={errors.instagramHandle ? true : undefined}
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="username"
                    className="pl-6"
                  />
                </div>
              </Field>
            </FormSection>

            <FormSection title="Content">
              <Field
                label="Reels promised"
                htmlFor={fieldId("reelsPromised")}
                error={errors.reelsPromised}
              >
                <Input
                  id={fieldId("reelsPromised")}
                  inputMode="numeric"
                  value={form.reelsPromised}
                  onChange={(event) => set("reelsPromised", event.target.value)}
                  aria-invalid={errors.reelsPromised ? true : undefined}
                  placeholder="3"
                  className="tabular-nums"
                />
              </Field>
              <Field
                label="Reels done"
                htmlFor={fieldId("reelsDelivered")}
                error={errors.reelsDelivered}
              >
                <Input
                  id={fieldId("reelsDelivered")}
                  inputMode="numeric"
                  value={form.reelsDelivered}
                  onChange={(event) =>
                    set("reelsDelivered", event.target.value)
                  }
                  aria-invalid={errors.reelsDelivered ? true : undefined}
                  placeholder="1"
                  className="tabular-nums"
                />
              </Field>
              <Field label="Content status" htmlFor={fieldId("contentStatus")}>
                <Select
                  value={form.contentStatus}
                  onValueChange={(value) =>
                    set("contentStatus", value as ContentStatus)
                  }
                >
                  <SelectTrigger
                    id={fieldId("contentStatus")}
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {CONTENT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {CONTENT_META[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Due date" htmlFor={fieldId("dueDate")}>
                <Input
                  id={fieldId("dueDate")}
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => set("dueDate", event.target.value)}
                />
              </Field>
              <Field
                label="Posted link"
                htmlFor={fieldId("contentLink")}
                className="sm:col-span-2"
              >
                <Input
                  id={fieldId("contentLink")}
                  type="url"
                  inputMode="url"
                  value={form.contentLink}
                  onChange={(event) => set("contentLink", event.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="https://instagram.com/reel/…"
                />
              </Field>
            </FormSection>

            <FormSection title="Payment">
              <Field
                label="Agreed total"
                htmlFor={fieldId("agreedAmount")}
                error={errors.agreedAmount}
              >
                <Input
                  id={fieldId("agreedAmount")}
                  inputMode="decimal"
                  value={form.agreedAmount}
                  onChange={(event) => set("agreedAmount", event.target.value)}
                  aria-invalid={errors.agreedAmount ? true : undefined}
                  placeholder="3000"
                  className="tabular-nums"
                />
              </Field>
              <Field
                label="Paid so far"
                htmlFor={fieldId("paidAmount")}
                error={errors.paidAmount}
              >
                <Input
                  id={fieldId("paidAmount")}
                  inputMode="decimal"
                  value={form.paidAmount}
                  onChange={(event) => set("paidAmount", event.target.value)}
                  aria-invalid={errors.paidAmount ? true : undefined}
                  placeholder="1500"
                  className="tabular-nums"
                />
              </Field>
              <Field label="Currency" htmlFor={fieldId("currency")}>
                <Select
                  value={form.currency}
                  onValueChange={(value) => set("currency", value)}
                >
                  <SelectTrigger id={fieldId("currency")} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field
                label="Payment status"
                htmlFor={fieldId("paymentStatus")}
                hint={
                  paymentCancelled
                    ? "Stays cancelled whatever the amounts say."
                    : `Saves as ${PAYMENT_META[autoPayment].label.toLowerCase()}${
                        balance > 0
                          ? `, ${formatMoney(balance, form.currency)} left`
                          : ""
                      }.`
                }
              >
                <Select
                  value={paymentCancelled ? "cancelled" : "auto"}
                  onValueChange={(value) =>
                    set(
                      "paymentStatus",
                      value === "cancelled" ? "cancelled" : "unpaid"
                    )
                  }
                >
                  <SelectTrigger
                    id={fieldId("paymentStatus")}
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="auto">Follows the amounts</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FormSection>

            <FormSection title="Contact">
              <Field label="Email" htmlFor={fieldId("email")}>
                <Input
                  id={fieldId("email")}
                  type="email"
                  inputMode="email"
                  value={form.email}
                  onChange={(event) => set("email", event.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="creator@gmail.com"
                />
              </Field>
              <Field label="Phone" htmlFor={fieldId("phone")}>
                <Input
                  id={fieldId("phone")}
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(event) => set("phone", event.target.value)}
                  autoComplete="off"
                  placeholder="98765 43210"
                />
              </Field>
              <Field
                label="UPI ID"
                htmlFor={fieldId("upiId")}
                hint="Where payouts go."
                className="sm:col-span-2"
              >
                <Input
                  id={fieldId("upiId")}
                  value={form.upiId}
                  onChange={(event) => set("upiId", event.target.value)}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="name@upi"
                />
              </Field>
            </FormSection>

            <FormSection title="Notes">
              <Field
                label="Deal summary"
                htmlFor={fieldId("notes")}
                className="sm:col-span-2"
              >
                <Textarea
                  id={fieldId("notes")}
                  value={form.notes}
                  onChange={(event) => set("notes", event.target.value)}
                  rows={4}
                  placeholder="1500 paid 12 Sep via PhonePe, 2 new reels by 15 Oct"
                  className="min-h-24"
                />
              </Field>
            </FormSection>
          </div>

          <footer className="space-y-3 border-t border-border px-5 py-3">
            {saveError ? (
              <Notice
                title={deal ? "Changes weren't saved" : "Creator wasn't added"}
              >
                {saveError}
              </Notice>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? <Spinner className="size-3.5 text-current" /> : null}
                {saving ? "Saving…" : deal ? "Save changes" : "Add creator"}
              </Button>
            </div>
          </footer>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function FormSection({
  title,
  children,
}: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <section aria-label={title} className="px-5 py-4">
      <h3 className="text-[13px] font-medium text-foreground">{title}</h3>
      <div className="mt-3 grid gap-x-3 gap-y-3.5 sm:grid-cols-2">
        {children}
      </div>
    </section>
  )
}
