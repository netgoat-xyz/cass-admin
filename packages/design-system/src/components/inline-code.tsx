import * as React from "react"

import { cn } from "../lib/utils"

function InlineCode({ className, ...props }: React.ComponentProps<"code">) {
  return (
    <code
      data-slot="inline-code"
      className={cn(
        "rounded-md border border-border bg-surface-sunken px-1.5 py-0.5 font-mono text-[0.85em] text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { InlineCode }
