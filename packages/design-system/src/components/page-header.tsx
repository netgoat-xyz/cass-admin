import * as React from "react"

import { cn } from "../lib/utils"

export interface PageHeaderProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  breadcrumb?: React.ReactNode
}

function PageHeader({
  className,
  eyebrow,
  title,
  description,
  actions,
  breadcrumb,
  ...props
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
      {...props}
    >
      <div className="min-w-0 space-y-2">
        {breadcrumb}
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-calsans text-3xl tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  )
}

export { PageHeader }
