"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "../lib/utils"
import { easings } from "../lib/motion"

const chipVariants = cva(
  "relative inline-flex items-center gap-1.5 rounded-full border text-xs font-medium select-none outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          "border-border bg-card text-foreground hover:bg-muted data-[selected=true]:border-brand/40 data-[selected=true]:bg-brand-muted",
        brand:
          "border-transparent bg-brand text-brand-foreground hover:bg-brand/90",
        outline:
          "border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60 data-[selected=true]:border-foreground/30 data-[selected=true]:text-foreground",
      },
      size: {
        sm: "h-6 px-2",
        md: "h-7 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  selected?: boolean
  onRemove?: () => void
}

function Chip({
  className,
  variant,
  size,
  selected,
  onRemove,
  children,
  ...props
}: ChipProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.button
      type="button"
      data-slot="chip"
      data-selected={selected ? "true" : undefined}
      aria-pressed={selected}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={easings.springSnappy}
      className={cn(chipVariants({ variant, size }), className)}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {children}
      {onRemove ? (
        <span
          role="button"
          tabIndex={-1}
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full text-current/70 transition-colors hover:bg-black/10 hover:text-current dark:hover:bg-white/15"
          aria-label="Remove"
        >
          ×
        </span>
      ) : null}
    </motion.button>
  )
}

export { Chip, chipVariants }
