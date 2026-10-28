"use client"

import * as React from "react"

import { cn } from "../lib/utils"
import { Button, type ButtonProps } from "./button"

export interface CopyButtonProps extends Omit<ButtonProps, "onClick"> {
  value: string
  copiedLabel?: string
  idleLabel?: React.ReactNode
  timeoutMs?: number
}

function CopyButton({
  value,
  className,
  copiedLabel = "Copied",
  idleLabel = "Copy",
  timeoutMs = 1600,
  size = "sm",
  variant = "outline",
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      data-slot="copy-button"
      className={cn("min-w-16 tabular-nums", className)}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          window.setTimeout(() => setCopied(false), timeoutMs)
        } catch {
          setCopied(false)
        }
      }}
      {...props}
    >
      {copied ? copiedLabel : idleLabel}
    </Button>
  )
}

export { CopyButton }
