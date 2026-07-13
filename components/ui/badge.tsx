import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#0071e3]/10 text-[#0071e3]",
        secondary: "border-transparent bg-black/[0.05] text-foreground",
        outline: "border-black/10 text-muted-foreground",
        success: "border-transparent bg-emerald-500/10 text-emerald-700",
        warning: "border-transparent bg-amber-500/10 text-amber-700",
        destructive: "border-transparent bg-red-500/10 text-red-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
