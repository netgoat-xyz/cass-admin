"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { RefreshCw, Rocket } from "lucide-react"
import {
  Badge,
  Button,
  Callout,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Field,
  FieldLabel,
  InlineCode,
  Input,
  PageHeader,
  Skeleton,
  StatusDot,
  Surface,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@netgoat/ui"
import { casApi } from "@/lib/cas-api"
import { formatWhen, instanceStatusTone } from "@/lib/format"
import type { CasDeployment, CasInstance } from "@/lib/types"

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<CasDeployment[]>([])
  const [instances, setInstances] = useState<CasInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [form, setForm] = useState({ instance_id: "", version: "" })

  const instanceMap = useMemo(() => {
    return Object.fromEntries(instances.map((i) => [i.id, i]))
  }, [instances])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [nextDeployments, nextInstances] = await Promise.all([
        casApi.listDeployments(),
        casApi.listInstances(),
      ])
      setDeployments([...nextDeployments].reverse())
      setInstances(nextInstances)
      setForm((f) =>
        f.instance_id || !nextInstances[0]
          ? f
          : { ...f, instance_id: nextInstances[0].id }
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deployments")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const queue = async () => {
    if (!form.instance_id || !form.version.trim()) {
      setError("Instance and version are required")
      return
    }
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await casApi.queueDeployment({
        instance_id: form.instance_id,
        version: form.version.trim(),
      })
      setForm((f) => ({ ...f, version: "" }))
      setMessage("Deployment queued")
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Queue failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Releases"
        title="Deployments"
        description="Queue version rollouts. Execution lands when CAS connects to agent transport."
        actions={
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
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
      {message ? (
        <Callout variant="success" title="Queued">
          {message}
        </Callout>
      ) : null}

      <Callout variant="note" title="Queued only">
        CAS records deployments as <InlineCode>queued</InlineCode>. Agent-driven
        apply is not wired yet.
      </Callout>

      <Surface variant="raised" className="space-y-4">
        <div>
          <h2 className="text-base font-medium">Queue deployment</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Target an instance and specify the version string to roll out.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="instance">Instance</FieldLabel>
            <select
              id="instance"
              className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={form.instance_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, instance_id: e.target.value }))
              }
            >
              <option value="">Select instance…</option>
              {instances.map((instance) => (
                <option key={instance.id} value={instance.id}>
                  {instance.name}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="version">Version</FieldLabel>
            <Input
              id="version"
              placeholder="1.4.0"
              value={form.version}
              onChange={(e) =>
                setForm((f) => ({ ...f, version: e.target.value }))
              }
            />
          </Field>
        </div>
        <Button
          variant="brand"
          size="sm"
          disabled={saving || instances.length === 0}
          onClick={() => void queue()}
        >
          <Rocket className="size-4" />
          Queue
        </Button>
      </Surface>

      <Surface variant="raised" padding="none">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-medium">Queue history</h2>
        </div>
        {loading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : deployments.length === 0 ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyTitle>No deployments</EmptyTitle>
              <EmptyDescription>
                Queue a release to see it appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deployment</TableHead>
                <TableHead>Instance</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployments.map((deployment) => {
                const instance = instanceMap[deployment.instance_id]
                return (
                  <TableRow key={deployment.id}>
                    <TableCell>
                      <InlineCode>{deployment.id}</InlineCode>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {instance?.name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {deployment.instance_id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="brand">{deployment.version}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusDot
                        status={instanceStatusTone(deployment.status)}
                        label={deployment.status}
                        pulse={deployment.status === "queued"}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatWhen(deployment.created_at)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Surface>
    </div>
  )
}
