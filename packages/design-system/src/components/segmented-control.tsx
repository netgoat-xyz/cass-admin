"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "../lib/utils"
import { easings } from "../lib/motion"

type SegmentedContextValue = {
  value: string
  setValue: (v: string) => void
  layoutId: string
}

const SegmentedContext = React.createContext<SegmentedContextValue | null>(null)

function useSegmented() {
  const ctx = React.useContext(SegmentedContext)
  if (!ctx) {
    throw new Error("SegmentedItem must be used within SegmentedControl")
  }
  return ctx
}

const segmentedListVariants = cva(
  "relative inline-flex items-center rounded-lg border border-border bg-surface-sunken p-0.5",
  {
    variants: {
      size: {
        sm: "h-8",
        md: "h-9",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface SegmentedControlProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof segmentedListVariants> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  layoutId?: string
}

function SegmentedControl({
  className,
  size,
  value: controlled,
  defaultValue,
  onValueChange,
  layoutId = "segmented-indicator",
  children,
  ...props
}: SegmentedControlProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "")
  const isControlled = controlled !== undefined
  const value = isControlled ? controlled : uncontrolled

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )

  const contextValue = React.useMemo(
    () => ({ value, setValue, layoutId }),
    [value, setValue, layoutId]
  )

  return (
    <SegmentedContext.Provider value={contextValue}>
      <div
        role="tablist"
        data-slot="segmented-control"
        className={cn(segmentedListVariants({ size }), className)}
        {...props}
      >
        {children}
      </div>
    </SegmentedContext.Provider>
  )
}

function SegmentedItem({
  className,
  value,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const { value: active, setValue, layoutId } = useSegmented()
  const selected = active === value
  const reduceMotion = useReducedMotion()

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      data-slot="segmented-item"
      data-selected={selected ? "" : undefined}
      className={cn(
        "relative z-10 inline-flex h-full items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        "data-selected:text-foreground",
        className
      )}
      onClick={(event) => {
        props.onClick?.(event)
        setValue(value)
      }}
      {...props}
    >
      {selected ? (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 -z-10 rounded-md bg-surface-raised shadow-xs"
          transition={
            reduceMotion
              ? { duration: 0 }
              : { ...easings.springSoft, bounce: 0.12 }
          }
        />
      ) : null}
      <span className="relative">{children}</span>
    </button>
  )
}

export { SegmentedControl, SegmentedItem, segmentedListVariants }
