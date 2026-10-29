import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils"

const surfaceVariants = cva("text-foreground", {
  variants: {
    variant: {
      flat: "bg-surface",
      raised: "bg-surface-raised border border-border shadow-[var(--shadow-elevated)]",
      sunken: "bg-surface-sunken border border-border/70",
      glass:
        "border border-border/80 bg-surface-raised/70 backdrop-blur-md shadow-[var(--shadow-elevated)]",
      outline: "border border-border bg-transparent",
    },
    padding: {
      none: "p-0",
      sm: "p-3",
      md: "p-5",
      lg: "p-8",
    },
    radius: {
      md: "rounded-lg",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
    },
  },
  defaultVariants: {
    variant: "raised",
    padding: "md",
    radius: "xl",
  },
})

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {}

function Surface({
  className,
  variant,
  padding,
  radius,
  ...props
}: SurfaceProps) {
  return (
    <div
      data-slot="surface"
      className={cn(surfaceVariants({ variant, padding, radius }), className)}
      {...props}
    />
  )
}

export { Surface, surfaceVariants }
