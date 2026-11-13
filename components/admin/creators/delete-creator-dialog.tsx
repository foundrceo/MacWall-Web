"use client"

import type { CreatorDeal } from "@/components/admin/creators/deals"
import { Spinner } from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function DeleteCreatorDialog({
  deal,
  open,
  onOpenChange,
  removing,
  onConfirm,
}: Readonly<{
  deal: CreatorDeal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  removing: boolean
  onConfirm: () => void
}>) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!removing) onOpenChange(next)
      }}
    >
      <DialogContent showCloseButton={false} className="gap-5 sm:max-w-sm">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-[15px] leading-snug font-semibold">
            {deal ? `Remove ${deal.creatorName}?` : "Remove creator?"}
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            {deal
              ? `This deletes @${deal.instagramHandle} and the whole deal: reels, payments, contact details and notes. It can't be undone.`
              : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={removing}
          >
            Keep
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={removing || !deal}
          >
            {removing ? <Spinner className="size-3.5 text-current" /> : null}
            {removing ? "Removing…" : "Remove creator"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
