import * as React from "react"

import { cn } from "../lib/utils"

function Progress({
  className,
  value = 0,
  max = 100,
  ...props
}: React.ComponentProps<"div"> & {
  value?: number
  max?: number
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("flex flex-wrap gap-3 w-full", className)}
      {...props}
    >
      <div
        data-slot="progress-track"
        className="bg-muted h-1.5 rounded-full relative flex w-full items-center overflow-x-hidden"
      >
        <div
          data-slot="progress-indicator"
          className="bg-primary h-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export { Progress }
