"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { RefreshCw } from "lucide-react"
import {
  Badge,
  Button,
  Callout,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  InlineCode,
  Input,
  PageHeader,
  Skeleton,
  Surface,
} from "@netgoat/ui"
import { casApi } from "@/lib/cas-api"
import { actionLabel, formatWhen } from "@/lib/format"
import type { CasAuditEntry } from "@/lib/types"

export default function AuditPage() {
  const [entries, setEntries] = useState<CasAuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await casApi.listAudit()
      setEntries([...next].reverse())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit log")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries
    return entries.filter(
      (entry) =>
        entry.action.toLowerCase().includes(q) ||
        entry.resource.toLowerCase().includes(q) ||
        entry.id.toLowerCase().includes(q)
    )
  }, [entries, query])

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Compliance"
        title="Audit"
        description="Immutable trail of CAS mutations — instances, config, and deployments."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {error ? (
        <Callout variant="danger" title="Error">
          {error}
        </Callout>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Filter by action, resource, or id…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
        <Badge variant="outline">
          {filtered.length}
          {filtered.length !== entries.length ? ` / ${entries.length}` : ""}{" "}
          entries
        </Badge>
      </div>

      <Surface variant="raised" padding="none">
        {loading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyTitle>
                {entries.length === 0 ? "No audit entries" : "No matches"}
              </EmptyTitle>
              <EmptyDescription>
                {entries.length === 0
                  ? "Create an instance, save config, or queue a deployment to populate this log."
                  : "Try a different filter."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ol className="relative divide-y divide-border">
            {filtered.map((entry, index) => (
              <li
                key={entry.id}
                className="relative flex gap-4 px-5 py-4 sm:gap-5"
              >
                <div className="relative flex w-3 shrink-0 justify-center pt-1.5">
                  <span
                    className={`size-2.5 rounded-full ring-4 ring-surface-raised ${
                      index === 0 ? "bg-brand" : "bg-muted-foreground/40"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium capitalize">
                      {actionLabel(entry.action)}
                    </p>
                    <Badge variant="secondary" className="font-mono">
                      {entry.action}
                    </Badge>
                  </div>
                  <InlineCode className="inline-flex max-w-full truncate">
                    {entry.resource}
                  </InlineCode>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{formatWhen(entry.created_at)}</span>
                    <span className="font-mono">{entry.id}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Surface>
    </div>
  )
}
