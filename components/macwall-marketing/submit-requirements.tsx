import { SUBMIT_REQUIREMENTS } from "@/lib/community/submit-validation"
import { cn } from "@/lib/utils"

export function SubmitRequirements({
  className,
}: Readonly<{ className?: string }>) {
  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-[15px] font-medium text-foreground">
        Upload requirements
      </p>
      <ul className="space-y-3">
        {SUBMIT_REQUIREMENTS.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-[14px] leading-[1.45] text-marketing-muted"
          >
            <span
              aria-hidden
              className="mt-[7px] size-1.5 shrink-0 rounded-full bg-foreground/35"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
