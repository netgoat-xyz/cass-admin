import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils"

const calloutVariants = cva(
  "relative grid gap-1 rounded-xl border px-4 py-3 text-sm has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3 *:[svg]:mt-0.5 *:[svg]:size-4",
  {
    variants: {
      variant: {
        note: "border-border bg-surface-sunken text-foreground",
        tip: "border-brand/30 bg-brand-muted text-foreground",
        success: "border-success/30 bg-success/10 text-foreground",
        warning: "border-warning/35 bg-warning/10 text-foreground",
        danger: "border-destructive/30 bg-destructive/10 text-foreground",
      },
    },
    defaultVariants: {
      variant: "note",
    },
  }
)

export interface CalloutProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof calloutVariants> {
  title?: React.ReactNode
}

function Callout({
  className,
  variant,
  title,
  children,
  ...props
}: CalloutProps) {
  return (
    <div
      data-slot="callout"
      className={cn(calloutVariants({ variant }), className)}
      {...props}
    >
      {title ? (
        <p className="font-medium col-start-2 row-start-1 [[svg]~&]:col-start-2">
          {title}
        </p>
      ) : null}
      <div
        className={cn(
          "text-muted-foreground leading-relaxed",
          title ? "col-start-2" : ""
        )}
      >
        {children}
      </div>
    </div>
  )
}

export { Callout, calloutVariants }
