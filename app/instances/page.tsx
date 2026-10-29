"use client"

import { useCallback, useEffect, useState } from "react"
import {
  KeyRound,
  RefreshCw,
  Save,
  ShieldCheck,
  Terminal,
} from "lucide-react"
import {
  Badge,
  Button,
  Callout,
  CopyButton,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Field,
  FieldDescription,
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
import type {
  CasCluster,
  CasInstance,
  CasJoinBundle,
  CasJoinToken,
} from "@/lib/types"

export default function InstancesPage() {
  const [instances, setInstances] = useState<CasInstance[]>([])
  const [tokens, setTokens] = useState<CasJoinToken[]>([])
  const [cluster, setCluster] = useState<CasCluster | null>(null)
  const [bundle, setBundle] = useState<CasJoinBundle | null>(null)
  const [agentKey, setAgentKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [nameHint, setNameHint] = useState("")
  const [ttlHours, setTtlHours] = useState("24")
  const [claimEndpoint, setClaimEndpoint] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", endpoint: "" })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [nextInstances, nextTokens, nextCluster] = await Promise.all([
        casApi.listInstances(),
        casApi.listJoinTokens(),
        casApi.getCluster(),
      ])
      setInstances(nextInstances)
      setTokens([...nextTokens].reverse())
      setCluster(nextCluster)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load instances")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const mint = async () => {
    if (!nameHint.trim()) {
      setError("Node name is required to mint join credentials")
      return
    }
    setSaving(true)
    setError(null)
    setMessage(null)
    setAgentKey(null)
    try {
      const next = await casApi.mintJoinToken({
        name_hint: nameHint.trim(),
        ttl_hours: Number(ttlHours) || 24,
      })
      setBundle(next)
      setClaimEndpoint("")
      setMessage("Join credentials minted — copy them before leaving this page")
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mint join token")
    } finally {
      setSaving(false)
    }
  }

  const completeJoin = async () => {
    if (!bundle) return
    if (!claimEndpoint.trim()) {
      setError("Endpoint is required to complete the join")
      return
    }
    setClaiming(true)
    setError(null)
    setMessage(null)
    try {
      const result = await casApi.joinClaim({
        token: bundle.token,
        name: bundle.name_hint,
        endpoint: claimEndpoint.trim(),
        fingerprint: bundle.cluster.fingerprint,
      })
      setAgentKey(result.agent_key)
      setBundle(null)
      setNameHint("")
      setMessage(`Node “${result.instance.name}” joined the cluster`)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Join failed")
    } finally {
      setClaiming(false)
    }
  }

  const revoke = async (id: string) => {
    setError(null)
    try {
      await casApi.revokeJoinToken(id)
      if (bundle?.id === id) setBundle(null)
      setMessage("Join token revoked")
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Revoke failed")
    }
  }

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await casApi.updateInstance(editingId, {
        name: editForm.name.trim() || undefined,
        endpoint: editForm.endpoint.trim() || undefined,
      })
      setEditingId(null)
      setMessage("Instance updated")
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed")
    } finally {
      setSaving(false)
    }
  }

  const pendingTokens = tokens.filter((t) => t.status === "pending")

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Fleet"
        title="Instances"
        description="Join NetGoat nodes the Proxmox way — mint a one-time token, verify the cluster fingerprint, then claim with an agent key."
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
      {message ? (
        <Callout variant="success" title="OK">
          {message}
        </Callout>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-5">
        <Surface variant="raised" className="space-y-4 lg:col-span-2">
          <div className="flex items-start gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-brand/15 text-brand">
              <KeyRound className="size-4" />
            </span>
            <div>
              <h2 className="text-base font-medium">Mint join credentials</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Like adding a Proxmox node: create a join token bound to a node
                name, then run the join on the node (or complete it here).
              </p>
            </div>
          </div>

          <Field>
            <FieldLabel htmlFor="node-name">Node name</FieldLabel>
            <Input
              id="node-name"
              placeholder="edge-eu-1"
              value={nameHint}
              onChange={(e) => setNameHint(e.target.value)}
            />
            <FieldDescription>
              Becomes the instance name after a successful join.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="ttl">Token TTL (hours)</FieldLabel>
            <Input
              id="ttl"
              type="number"
              min={1}
              max={168}
              value={ttlHours}
              onChange={(e) => setTtlHours(e.target.value)}
            />
          </Field>

          <Button
            variant="brand"
            size="sm"
            disabled={saving}
            onClick={() => void mint()}
          >
            <ShieldCheck className="size-4" />
            Generate join info
          </Button>

          {cluster ? (
            <div className="rounded-lg border border-border bg-surface-sunken p-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Cluster
              </p>
              <dl className="mt-2 space-y-2">
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">ID</dt>
                  <dd>
                    <InlineCode>{cluster.id}</InlineCode>
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Fingerprint</dt>
                  <dd className="flex flex-wrap items-center gap-2">
                    <InlineCode className="break-all">
                      {cluster.fingerprint}
                    </InlineCode>
                    <CopyButton value={cluster.fingerprint} idleLabel="Copy" />
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
        </Surface>

        <Surface variant="raised" className="space-y-4 lg:col-span-3">
          {!bundle && !agentKey ? (
            <Empty className="border-0 py-10">
              <EmptyHeader>
                <EmptyTitle>No active join session</EmptyTitle>
                <EmptyDescription>
                  Generate join info to reveal the CAS URL, fingerprint, and
                  one-time token — the same triad Proxmox shows when adding a
                  node.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : null}

          {bundle ? (
            <div className="space-y-4">
              <Callout variant="warning" title="Shown once">
                {bundle.warning}
              </Callout>

              <div className="grid gap-3 sm:grid-cols-2">
                <SecretField
                  label="CAS join URL"
                  value={bundle.cluster.join_url}
                />
                <SecretField
                  label="Cluster fingerprint"
                  value={bundle.cluster.fingerprint}
                />
                <SecretField
                  label="Join token"
                  value={bundle.token}
                  mono
                  className="sm:col-span-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Terminal className="size-4 text-muted-foreground" />
                  Join command
                </div>
                <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-sunken p-3 sm:flex-row sm:items-start">
                  <code className="flex-1 break-all font-mono text-xs leading-relaxed">
                    {bundle.join_command}
                  </code>
                  <CopyButton value={bundle.join_command} idleLabel="Copy" />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium">Complete join from admin</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No agent yet? Claim the token here with the node&apos;s
                  reachable endpoint. This still issues a one-time agent key.
                </p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <Field className="flex-1">
                    <FieldLabel htmlFor="claim-endpoint">
                      Node endpoint
                    </FieldLabel>
                    <Input
                      id="claim-endpoint"
                      placeholder="https://edge-eu-1.example.com"
                      value={claimEndpoint}
                      onChange={(e) => setClaimEndpoint(e.target.value)}
                    />
                  </Field>
                  <Button
                    variant="brand"
                    size="sm"
                    disabled={claiming}
                    onClick={() => void completeJoin()}
                  >
                    Complete join
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Token expires {formatWhen(bundle.expires_at)} · hint{" "}
                <InlineCode>{bundle.token_hint}</InlineCode>
              </p>
            </div>
          ) : null}

          {agentKey ? (
            <div className="space-y-3">
              <Callout variant="success" title="Node joined">
                Store the agent key now. CAS only keeps a hash afterwards.
              </Callout>
              <SecretField label="Agent key" value={agentKey} mono />
            </div>
          ) : null}
        </Surface>
      </div>

      <Surface variant="raised" padding="none">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-medium">Pending join tokens</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Unused invitations waiting for a node claim
            </p>
          </div>
          <Badge variant="outline">{pendingTokens.length} pending</Badge>
        </div>
        {loading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-10 w-full" />
          </div>
        ) : tokens.length === 0 ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyTitle>No join tokens yet</EmptyTitle>
              <EmptyDescription>
                Mint credentials above to invite a node.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Node</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell>
                    <p className="font-medium">{token.name_hint}</p>
                    <InlineCode className="mt-1">{token.id}</InlineCode>
                  </TableCell>
                  <TableCell>
                    <InlineCode>{token.token_hint}</InlineCode>
                  </TableCell>
                  <TableCell>
                    <StatusDot
                      status={instanceStatusTone(token.status)}
                      label={token.status}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatWhen(token.expires_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    {token.status === "pending" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void revoke(token.id)}
                      >
                        Revoke
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Surface>

      <Surface variant="raised" padding="none">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-medium">Joined nodes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Instances that completed join and received an agent key
          </p>
        </div>
        {loading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : instances.length === 0 ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyTitle>No joined nodes</EmptyTitle>
              <EmptyDescription>
                Complete a join to populate the fleet directory.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Agent key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instances.map((instance) => {
                const editing = editingId === instance.id
                return (
                  <TableRow key={instance.id}>
                    <TableCell>
                      {editing ? (
                        <Input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              name: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <div>
                          <p className="font-medium">{instance.name}</p>
                          <InlineCode className="mt-1">{instance.id}</InlineCode>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      {editing ? (
                        <Input
                          value={editForm.endpoint}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              endpoint: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <span className="truncate text-sm text-muted-foreground">
                          {instance.endpoint}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {instance.agent_key_hint ? (
                        <InlineCode>{instance.agent_key_hint}</InlineCode>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusDot
                        status={instanceStatusTone(instance.status)}
                        label={instance.status}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {instance.joined_at
                        ? formatWhen(instance.joined_at)
                        : formatWhen(instance.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {editing ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant="brand"
                            disabled={saving}
                            onClick={() => void saveEdit()}
                          >
                            <Save className="size-4" />
                            Save
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(instance.id)
                            setEditForm({
                              name: instance.name,
                              endpoint: instance.endpoint,
                            })
                          }}
                        >
                          Edit
                        </Button>
                      )}
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

function SecretField({
  label,
  value,
  mono,
  className,
}: {
  label: string
  value: string
  mono?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-start gap-2 rounded-md border border-border bg-background px-3 py-2 dark:bg-input/30">
        <code
          className={`min-w-0 flex-1 break-all text-xs leading-relaxed ${mono ? "font-mono" : ""}`}
        >
          {value}
        </code>
        <CopyButton value={value} idleLabel="Copy" />
      </div>
    </div>
  )
}
