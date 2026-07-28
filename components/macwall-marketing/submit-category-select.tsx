"use client"

import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { Select as SelectPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type SubmitCategorySelectProps = Readonly<{
  id?: string
  value: string
  options: readonly string[]
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  onValueChange: (value: string) => void
}>

export function SubmitCategorySelect({
  id,
  value,
  options,
  placeholder = "Select a category",
  disabled,
  invalid,
  describedBy,
  onValueChange,
}: SubmitCategorySelectProps) {
  return (
    <SelectPrimitive.Root
      value={value}
      disabled={disabled}
      onValueChange={onValueChange}
    >
      <SelectPrimitive.Trigger
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(
          "group flex h-auto w-full items-center justify-between gap-2 rounded-2xl border-0 bg-background/70 px-4 py-3 text-left text-[15px] text-foreground ring-1 ring-foreground/8",
          "transition-[color,background-color,box-shadow,transform] duration-200 outline-none",
          "hover:bg-background hover:ring-foreground/14",
          "focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary",
          "data-[state=open]:bg-background data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-secondary",
          "data-placeholder:text-marketing-muted",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:ring-2 aria-invalid:ring-red-500/35"
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon
            aria-hidden
            className="size-4 shrink-0 text-marketing-muted transition-transform duration-300 ease-out group-data-[state=open]:-rotate-180 group-data-[state=open]:text-foreground"
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={8}
          className={cn(
            "z-60 max-h-(--radix-select-content-available-height) w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width)",
            "origin-(--radix-select-content-transform-origin) overflow-hidden rounded-2xl bg-secondary p-1.5 text-foreground shadow-2xl shadow-black/40",
            "data-open:animate-in data-open:duration-150 data-open:ease-out data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:duration-100 data-closed:fade-out-0 data-closed:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1"
          )}
        >
          <SelectPrimitive.Viewport className="max-h-72 overflow-y-auto">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option}
                value={option}
                className={cn(
                  "relative flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-2 rounded-xl py-2.5 pr-2.5 pl-3 text-[15px] text-foreground/75 outline-none select-none",
                  "transition-colors duration-150",
                  "data-highlighted:bg-background/70 data-highlighted:text-foreground",
                  "data-[state=checked]:font-medium data-[state=checked]:text-foreground",
                  "data-disabled:pointer-events-none data-disabled:opacity-50"
                )}
              >
                <SelectPrimitive.ItemText>{option}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="flex shrink-0 items-center justify-center">
                  <CheckIcon aria-hidden className="size-4 text-foreground" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
