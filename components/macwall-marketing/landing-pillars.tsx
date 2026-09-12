import { LandingSurface } from "@/components/macwall-marketing/landing-surface"
import {
  DisplaysMark,
  ImportMark,
  LockMark,
  PickMark,
} from "@/components/macwall-marketing/landing-marks"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"

const MARKS = {
  pick: PickMark,
  import: ImportMark,
  displays: DisplaysMark,
  lock: LockMark,
} as const

export function LandingPillars() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {macwallMarketingCopy.landing.pillars.map((item) => {
        const Mark = MARKS[item.id]
        return (
          <LandingSurface
            key={item.id}
            className="flex h-full min-w-0 flex-col gap-4 rounded-none p-5 sm:gap-5 sm:p-6 md:p-8"
          >
            <Mark />
            <div className="flex flex-col gap-2">
              <h3 className="text-[18px] leading-7 font-normal text-white sm:text-[20px]">
                {item.title}
              </h3>
              <p className="text-[15px] leading-6 font-normal text-landing-muted sm:min-h-12 sm:text-[16px]">
                {item.body}
              </p>
            </div>
          </LandingSurface>
        )
      })}
    </div>
  )
}
