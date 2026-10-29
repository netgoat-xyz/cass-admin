/**
 * Shared motion tokens for NetGoat UI.
 * Prefer these over ad-hoc durations so interactions feel consistent.
 */
export const easings = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.45, 0, 0.55, 1] as const,
  springSoft: { type: "spring" as const, stiffness: 380, damping: 32 },
  springSnappy: { type: "spring" as const, stiffness: 520, damping: 36 },
}

export const durations = {
  fast: 0.15,
  normal: 0.28,
  slow: 0.45,
}

export const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
}

export const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.normal, ease: easings.out },
  },
}
