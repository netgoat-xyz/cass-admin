"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils"

type TabsContextValue = {
  value: string
  setValue: (v: string) => void
  orientation: "horizontal" | "vertical"
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>")
  return ctx
}

function Tabs({
  className,
  orientation = "horizontal",
  value: controlled,
  defaultValue,
  onValueChange,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical"
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "")
  const isControlled = controlled !== undefined
  const value = isControlled ? controlled : uncontrolled
  const setValue = (v: string) => {
    if (!isControlled) setUncontrolled(v)
    onValueChange?.(v)
  }

  return (
    <TabsContext.Provider value={{ value, setValue, orientation }}>
      <div
        data-slot="tabs"
        data-orientation={orientation}
        className={cn(
          "gap-2 group/tabs flex data-[orientation=horizontal]:flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const tabsListVariants = cva(
  "rounded-lg p-[3px] group-data-horizontal/tabs:h-9 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof tabsListVariants>) {
  const { orientation } = useTabs()
  return (
    <div
      role="tablist"
      data-slot="tabs-list"
      data-variant={variant}
      data-orientation={orientation}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  value,
  ...props
}: React.ComponentProps<"button"> & { value: string }) {
  const { value: active, setValue, orientation } = useTabs()
  const isActive = active === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-slot="tabs-trigger"
      data-active={isActive ? "" : undefined}
      data-orientation={orientation}
      className={cn(
        "gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium group-data-[variant=default]/tabs-list:data-active:shadow-sm text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none disabled:pointer-events-none disabled:opacity-50",
        "data-active:bg-background dark:data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 data-active:text-foreground",
        className
      )}
      onClick={(e) => {
        props.onClick?.(e)
        setValue(value)
      }}
      {...props}
    />
  )
}

function TabsContent({
  className,
  value,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  const { value: active } = useTabs()
  if (active !== value) return null
  return (
    <div
      role="tabpanel"
      data-slot="tabs-content"
      className={cn("text-sm flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
