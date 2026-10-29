"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react"
import {
  Activity,
  Boxes,
  FileJson,
  LayoutDashboard,
  Menu,
  Rocket,
  ScrollText,
  X,
} from "lucide-react"
import {
  Badge,
  Button,
  StatusDot,
  ThemeToggle,
  cn,
  durations,
  easings,
} from "@netgoat/ui"
import { casApi } from "@/lib/cas-api"

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/instances", label: "Instances", icon: Boxes },
  { href: "/deployments", label: "Deployments", icon: Rocket },
  { href: "/config", label: "Config", icon: FileJson },
  { href: "/audit", label: "Audit", icon: ScrollText },
] as const

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function CasShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/"
  const reduceMotion = useReducedMotion()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [connected, setConnected] = useState<boolean | null>(null)
  const [version, setVersion] = useState<string | null>(null)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    let cancelled = false
    const ping = async () => {
      try {
        const health = await casApi.health()
        if (!cancelled) {
          setConnected(health.status === "ok")
          setVersion(health.version)
        }
      } catch {
        if (!cancelled) {
          setConnected(false)
          setVersion(null)
        }
      }
    }
    void ping()
    const id = window.setInterval(ping, 15000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  return (
    <div className="relative min-h-svh bg-surface text-foreground">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_110%_70%_at_0%_-15%,oklch(0.4_0.1_255_/_0.28),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_0%,oklch(0.3_0.05_250_/_0.2),transparent_45%)]"
      />

      <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 md:px-6">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="md:hidden"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>

          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-md bg-brand text-[11px] font-bold text-brand-foreground shadow-xs">
              CAS
            </span>
            <span className="font-calsans text-lg tracking-tight">
              NetGoat
              <span className="ml-1.5 font-sans text-sm font-medium text-muted-foreground">
                Control
              </span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <StatusDot
                status={
                  connected === null
                    ? "unknown"
                    : connected
                      ? "healthy"
                      : "down"
                }
                pulse={connected === true}
                label={
                  connected === null
                    ? "Checking"
                    : connected
                      ? "API online"
                      : "API offline"
                }
              />
              {version ? (
                <Badge variant="outline" className="font-mono">
                  v{version}
                </Badge>
              ) : null}
            </div>
            <ThemeToggle />
          </div>
        </div>

        <LayoutGroup id="cas-nav">
          <nav
            aria-label="CAS"
            className="mx-auto hidden max-w-7xl items-center gap-1 overflow-x-auto border-t border-border/60 px-4 md:flex md:px-6"
          >
            {NAV.map((item) => {
              const active = isActive(pathname, item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex h-11 shrink-0 items-center gap-2 px-3 text-sm transition-colors",
                    active
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5 opacity-80" />
                  {item.label}
                  {active ? (
                    <motion.span
                      layoutId="cas-tab"
                      className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand"
                      transition={
                        reduceMotion ? { duration: 0 } : easings.springSoft
                      }
                    />
                  ) : null}
                </Link>
              )
            })}
          </nav>
        </LayoutGroup>
      </header>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              className="fixed inset-0 z-40 bg-black/45 md:hidden"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: durations.fast }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[min(18rem,88vw)] border-r border-border bg-surface p-4 shadow-[var(--shadow-elevated)] md:hidden"
              initial={reduceMotion ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: durations.normal, ease: easings.out }
              }
            >
              <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Central Admin
              </p>
              <ul className="space-y-0.5">
                {NAV.map((item) => {
                  const active = isActive(pathname, item.href)
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
                          active
                            ? "bg-muted font-medium text-foreground"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <Icon className="size-4" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      {connected === false ? (
        <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2.5 text-center text-sm text-destructive md:px-6">
          <Activity className="mr-2 inline size-3.5" />
          Cannot reach CAS API. Start{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            services/cas-api
          </code>{" "}
          on :8088.
        </div>
      ) : null}

      <main className="relative mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
        {children}
      </main>
    </div>
  )
}
