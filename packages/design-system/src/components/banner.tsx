import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils"
import { BANNER_VARIANTS, type BannerVariant } from "../lib/banner-variants"

const bannerShell = cva(
  "relative flex w-full items-start gap-3 rounded-xl px-4 py-3 text-sm",
  {
    variants: {
      layout: {
        soft: "border",
        solid: "border-transparent font-medium",
        strip: "rounded-none border-x-0 border-t-0 border-b px-0 py-2.5",
      },
    },
    defaultVariants: {
      layout: "soft",
    },
  }
)

export interface BannerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof bannerShell> {
  variant?: BannerVariant
  title?: React.ReactNode
  action?: React.ReactNode
  onDismiss?: () => void
}

function Banner({
  className,
  variant = "info",
  layout,
  title,
  action,
  onDismiss,
  children,
  ...props
}: BannerProps) {
  const tone = BANNER_VARIANTS[variant] ?? BANNER_VARIANTS.info

  return (
    <div
      data-slot="banner"
      role="status"
      className={cn(bannerShell({ layout }), tone.classes, className)}
      {...props}
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        {title ? <p className="font-medium text-current">{title}</p> : null}
        {children ? (
          <div className="text-current/90 leading-relaxed">{children}</div>
        ) : null}
      </div>
      {action ? <div className="shrink-0 self-center">{action}</div> : null}
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 self-start rounded-md px-1.5 py-0.5 text-current/70 hover:bg-black/5 hover:text-current dark:hover:bg-white/10"
          aria-label="Dismiss"
        >
          ×
        </button>
      ) : null}
    </div>
  )
}

export { Banner, bannerShell }
