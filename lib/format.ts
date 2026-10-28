export function formatWhen(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value))
  } catch {
    return value
  }
}

export function instanceStatusTone(
  status: string
): "healthy" | "degraded" | "down" | "unknown" | "idle" {
  const normalized = status.toLowerCase()
  if (["healthy", "online", "ready", "ok", "joined"].includes(normalized))
    return "healthy"
  if (["degraded", "warning", "queued"].includes(normalized)) return "degraded"
  if (["down", "offline", "error", "failed", "revoked"].includes(normalized))
    return "down"
  if (["idle", "pending", "expired"].includes(normalized)) return "idle"
  return "unknown"
}

export function actionLabel(action: string) {
  return action.replace(/\./g, " · ")
}
