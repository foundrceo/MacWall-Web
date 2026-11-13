"use client"

import {
  AtSign,
  ExternalLink,
  Mail,
  Phone,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { profileUrl, type CreatorDeal } from "@/components/admin/creators/deals"
import { CopyButton } from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/** Ways to reach and pay a creator, each one openable or copyable. */
export function CreatorContact({
  deal,
  onAdd,
}: Readonly<{
  deal: CreatorDeal
  /** Opens the edit form to fill in a missing detail. */
  onAdd: () => void
}>) {
  return (
    <ul className="mt-2 space-y-1">
      <ContactRow
        icon={AtSign}
        label="Instagram"
        copyLabel="Copy handle"
        value={`@${deal.instagramHandle}`}
        copyValue={deal.instagramHandle}
        link={{
          href: profileUrl(deal.instagramHandle),
          label: "Open Instagram",
          icon: ExternalLink,
          external: true,
        }}
        onAdd={onAdd}
      />
      <ContactRow
        icon={Mail}
        label="Email"
        copyLabel="Copy email"
        value={deal.email}
        link={
          deal.email
            ? {
                href: `mailto:${deal.email}`,
                label: "Send email",
                icon: Mail,
              }
            : undefined
        }
        onAdd={onAdd}
      />
      <ContactRow
        icon={Phone}
        label="Phone"
        copyLabel="Copy phone number"
        value={deal.phone}
        link={
          deal.phone
            ? {
                href: `tel:${deal.phone.replace(/\s/g, "")}`,
                label: "Call",
                icon: Phone,
              }
            : undefined
        }
        onAdd={onAdd}
      />
      <ContactRow
        icon={Wallet}
        label="UPI ID"
        copyLabel="Copy UPI ID"
        value={deal.upiId}
        onAdd={onAdd}
      />
    </ul>
  )
}

function ContactRow({
  icon: Icon,
  label,
  value,
  copyValue,
  copyLabel,
  link,
  onAdd,
}: Readonly<{
  icon: LucideIcon
  label: string
  value: string | null
  copyLabel: string
  /** What lands on the clipboard, when it differs from what is shown. */
  copyValue?: string
  link?: { href: string; label: string; icon: LucideIcon; external?: boolean }
  /** Opens the edit form when the detail is missing. */
  onAdd: () => void
}>) {
  const LinkIcon = link?.icon
  return (
    <li className="flex min-h-10 items-center gap-3">
      <Icon aria-hidden className="text-faint size-4 shrink-0" />
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-0.5 truncate text-[13px]",
            value ? "font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          {value ?? "Not added"}
        </p>
      </div>
      {value ? (
        <div className="flex shrink-0 items-center gap-0.5">
          {link && LinkIcon ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="ghost" size="icon-sm">
                  <a
                    href={link.href}
                    aria-label={link.label}
                    {...(link.external
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                  >
                    <LinkIcon aria-hidden />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{link.label}</TooltipContent>
            </Tooltip>
          ) : null}
          <CopyButton value={copyValue ?? value} label={copyLabel} />
        </div>
      ) : (
        <Button variant="ghost" size="xs" onClick={onAdd}>
          Add
        </Button>
      )}
    </li>
  )
}
