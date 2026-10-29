import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils"

const metricVariants = cva(
  "flex flex-col gap-2 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xs transition-[border-color,box-shadow] duration-200 ease-out hover:border-border/80 hover:shadow-[var(--shadow-elevated)]",
  {
    variants: {
      tone: {
        default: "",
        brand: "border-brand/25 bg-brand-muted/40",
        success: "border-success/25 bg-success/5",
        warning: "border-warning/25 bg-warning/5",
        danger: "border-destructive/25 bg-destructive/5",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  }
)

const trendVariants = cva(
  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
  {
    variants: {
      direction: {
        up: "bg-success/15 text-success",
        down: "bg-destructive/15 text-destructive",
        flat: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      direction: "flat",
    },
  }
)

export interface MetricProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricVariants> {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  trend?: {
    value: string
    direction?: "up" | "down" | "flat"
  }
}

function Metric({
  className,
  tone,
  label,
  value,
  hint,
  trend,
  ...props
}: MetricProps) {
  return (
    <div
      data-slot="metric"
      className={cn(metricVariants({ tone }), className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
        {trend ? (
          <span
            className={trendVariants({
              direction: trend.direction ?? "flat",
            })}
          >
            {trend.direction === "up"
              ? "↑"
              : trend.direction === "down"
                ? "↓"
                : "→"}{" "}
            {trend.value}
          </span>
        ) : null}
      </div>
      <p className="font-calsans text-[2rem] leading-none tracking-tight tabular-nums">
        {value}
      </p>
      {hint ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export { Metric, metricVariants, trendVariants }
