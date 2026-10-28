"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "../lib/utils"

const statusDotVariants = cva(
  "inline-flex shrink-0 rounded-full ring-2 ring-background",
  {
    variants: {
      status: {
        healthy: "bg-success",
        degraded: "bg-warning",
        down: "bg-destructive",
        unknown: "bg-muted-foreground/50",
        idle: "bg-info",
      },
      size: {
        sm: "size-1.5",
        md: "size-2",
        lg: "size-2.5",
      },
    },
    defaultVariants: {
      status: "unknown",
      size: "md",
    },
  }
)

export interface StatusDotProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusDotVariants> {
  pulse?: boolean
  label?: string
}

function StatusDot({
  className,
  status,
  size,
  pulse = false,
  label,
  ...props
}: StatusDotProps) {
  const reduceMotion = useReducedMotion()
  const shouldPulse = pulse && status !== "unknown" && !reduceMotion

  return (
    <span
      data-slot="status"
      className={cn("inline-flex items-center gap-2", className)}
      {...props}
    >
      <span className="relative inline-flex">
        {shouldPulse ? (
          <motion.span
            className={cn(
              statusDotVariants({ status, size }),
              "absolute inset-0 ring-0"
            )}
            aria-hidden
            animate={{ scale: [1, 2.1], opacity: [0.45, 0] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ) : null}
        <span
          className={statusDotVariants({ status, size })}
          aria-hidden={!label}
        />
      </span>
      {label ? (
        <span className="text-sm capitalize text-foreground">{label}</span>
      ) : null}
      {label ? <span className="sr-only">{status}</span> : null}
    </span>
  )
}

export { StatusDot, statusDotVariants }
