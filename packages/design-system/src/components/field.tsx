import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils"
import { Label } from "./label"

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "gap-6 has-[>[data-slot=checkbox-group]]:gap-3 flex flex-col",
        className
      )}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-3 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base",
        className
      )}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "gap-7 *:data-[slot=field-group]:gap-4 group/field-group @container/field-group flex w-full flex-col",
        className
      )}
      {...props}
    />
  )
}

const fieldVariants = cva(
  "data-[invalid=true]:text-destructive gap-3 group/field flex w-full",
  {
    variants: {
      orientation: {
        vertical: "flex-col [&>*]:w-full [&>.sr-only]:w-auto",
        horizontal:
          "flex-row items-center [&>[data-slot=field-label]]:flex-auto",
        responsive:
          "flex-col [&>*]:w-full @md/field-group:flex-row @md/field-group:items-center",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
)

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "gap-1 group/field-content flex flex-1 flex-col leading-snug",
        className
      )}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn("gap-2 group/field-label", className)}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-muted-foreground text-sm [[data-variant=legend]+&]:-mt-1.5",
        className
      )}
      {...props}
    />
  )
}

function FieldError({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  if (!children) return null
  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn("text-destructive text-sm font-normal", className)}
      {...props}
    >
      {children}
    </p>
  )
}

export {
  Field,
  FieldSet,
  FieldLegend,
  FieldGroup,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldError,
  fieldVariants,
}
