"use client"

import * as React from "react"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react"

import { cn } from "../lib/utils"
import { durations, easings } from "../lib/motion"

export type Theme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggle: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  root.classList.toggle("light", theme === "light")
  root.style.colorScheme = theme
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "netgoat-ui-theme",
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)

  React.useEffect(() => {
    const stored = window.localStorage.getItem(storageKey) as Theme | null
    const next =
      stored === "light" || stored === "dark" ? stored : defaultTheme
    setThemeState(next)
    applyTheme(next)
  }, [defaultTheme, storageKey])

  const setTheme = React.useCallback(
    (next: Theme) => {
      setThemeState(next)
      applyTheme(next)
      window.localStorage.setItem(storageKey, next)
    },
    [storageKey]
  )

  const toggle = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [setTheme, theme])

  const value = React.useMemo(
    () => ({ theme, setTheme, toggle }),
    [theme, setTheme, toggle]
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2.5v2.25M12 19.25V21.5M4.5 12H2.25M21.75 12H19.5M5.64 5.64l1.6 1.6M16.76 16.76l1.6 1.6M5.64 18.36l1.6-1.6M16.76 7.24l1.6-1.6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M20.5 14.2A7.75 7.75 0 0 1 9.8 3.5 7.9 7.9 0 1 0 20.5 14.2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ThemeToggle({
  className,
  ...props
}: HTMLMotionProps<"button">) {
  const { theme, toggle } = useTheme()
  const reduceMotion = useReducedMotion()
  const next = theme === "dark" ? "light" : "dark"

  return (
    <motion.button
      type="button"
      data-slot="theme-toggle"
      aria-label={`Switch to ${next} mode`}
      onClick={toggle}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      transition={easings.springSnappy}
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm font-medium text-foreground shadow-xs outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30",
        className
      )}
      {...props}
    >
      <span className="relative size-4 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            className="absolute inset-0 flex items-center justify-center"
            initial={
              reduceMotion
                ? false
                : { opacity: 0, rotate: theme === "dark" ? -40 : 40, y: 4 }
            }
            animate={{ opacity: 1, rotate: 0, y: 0 }}
            exit={
              reduceMotion
                ? undefined
                : { opacity: 0, rotate: theme === "dark" ? 40 : -40, y: -4 }
            }
            transition={{ duration: durations.fast, ease: easings.out }}
          >
            {theme === "dark" ? (
              <SunIcon className="size-3.5" />
            ) : (
              <MoonIcon className="size-3.5" />
            )}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="capitalize">{next}</span>
    </motion.button>
  )
}

export const themeInitScript = `(function(){try{var k='netgoat-ui-theme';var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark')t='dark';var r=document.documentElement;r.classList.toggle('dark',t==='dark');r.classList.toggle('light',t==='light');r.style.colorScheme=t;}catch(e){}})();`

