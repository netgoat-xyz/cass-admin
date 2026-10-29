"use client"

import * as React from "react"

import { cn } from "../lib/utils"

function Switch({
  className,
  size = "default",
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  ...props
}: Omit<React.ComponentProps<"button">, "onChange"> & {
  size?: "sm" | "default"
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
      role="switch"
      aria-checked={value}
      data-slot="switch"
      data-size={size}
      data-checked={value ? "" : undefined}
      data-unchecked={!value ? "" : undefined}
      disabled={disabled}
      className={cn(
        "data-checked:bg-primary data-unchecked:bg-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 dark:data-unchecked:bg-input/80 shrink-0 rounded-full border border-transparent shadow-xs focus-visible:ring-[3px] aria-invalid:ring-[3px] data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] peer group/switch relative inline-flex items-center transition-all outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 disabled:opacity-50",
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
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-unchecked:bg-foreground dark:data-checked:bg-primary-foreground rounded-full group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 pointer-events-none block ring-0 transition-transform",
          value
            ? "translate-x-[calc(100%-2px)]"
            : "translate-x-0"
        )}
        data-checked={value ? "" : undefined}
        data-unchecked={!value ? "" : undefined}
      />
    </button>
  )
}

export { Switch }
