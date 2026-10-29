"use client"

import * as React from "react"

import { cn } from "../lib/utils"

function Checkbox({
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  ...props
}: Omit<React.ComponentProps<"button">, "onChange"> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  const [uncontrolled, setUncontrolled] = React.useState(!!defaultChecked)
  const isControlled = checked !== undefined
  const value = isControlled ? checked : uncontrolled

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={value}
      data-slot="checkbox"
      data-checked={value ? "" : undefined}
      disabled={disabled}
      className={cn(
        "border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary aria-invalid:aria-checked:border-primary aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 flex size-4 items-center justify-center rounded-[4px] border shadow-xs transition-shadow focus-visible:ring-[3px] aria-invalid:ring-[3px] peer relative shrink-0 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={(e) => {
        props.onClick?.(e)
        if (disabled) return
        const next = !value
        if (!isControlled) setUncontrolled(next)
        onCheckedChange?.(next)
      }}
      {...props}
    >
      <span
        data-slot="checkbox-indicator"
        className={cn(
          "grid place-content-center text-current transition-none",
          !value && "opacity-0"
        )}
      >
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden>
          <path
            d="M3.5 8.5L6.5 11.5L12.5 4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  )
}

export { Checkbox }
