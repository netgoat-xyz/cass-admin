"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import {
  Boxes,
  RefreshCw,
  Rocket,
  ScrollText,
  Settings2,
} from "lucide-react"
import {
  Button,
  Callout,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  InlineCode,
  Metric,
  PageHeader,
  Skeleton,
  StatusDot,
  Surface,
  buttonVariants,
  staggerContainer,
  staggerItem,
} from "@netgoat/ui"
import { casApi } from "@/lib/cas-api"
import { actionLabel, formatWhen, instanceStatusTone } from "@/lib/format"
import type { CasAuditEntry, CasInstance, CasOverview } from "@/lib/types"

export default function OverviewPage() {
  const reduceMotion = useReducedMotion()
  const [overview, setOverview] = useState<CasOverview | null>(null)
  const [instances, setInstances] = useState<CasInstance[]>([])
  const [audit, setAudit] = useState<CasAuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [nextOverview, nextInstances, nextAudit] = await Promise.all([
        casApi.overview(),
        casApi.listInstances(),
        casApi.listAudit(),
      ])
      setOverview(nextOverview)
      setInstances(nextInstances)
      setAudit([...nextAudit].reverse().slice(0, 8))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load overview")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <motion.div
      className="space-y-8"
      variants={staggerContainer}
      initial={reduceMotion ? false : "initial"}
      animate="animate"
    >
      <motion.div variants={staggerItem}>
        <PageHeader
          eyebrow="Central Administrative Service"
          title="Overview"
          description="Join NetGoat instances with one-time tokens and cluster fingerprints, then queue deployments."
          actions={
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          }
        />
      </motion.div>

      {error ? (
        <Callout variant="danger" title="Unable to load">
          {error}
        </Callout>
      ) : null}

      <motion.div
        variants={staggerItem}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {loading || !overview ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Surface key={i} variant="raised" className="space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-16" />
            </Surface>
          ))
        ) : (
          <>
            <Metric
              label="Instances"
              value={overview.instances}
              hint="Registered NetGoat edges"
              tone="brand"
            />
            <Metric
              label="Deployments"
              value={overview.deployments}
              hint="Queued release records"
              tone="warning"
            />
            <Metric
              label="Audit entries"
              value={overview.audit_entries}
              hint="Immutable CAS actions"
              tone="success"
            />
          </>
        )}
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="grid gap-4 lg:grid-cols-5"
      >
        <Surface variant="raised" padding="none" className="lg:col-span-3">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-medium">Instances</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Latest registered control targets
              </p>
            </div>
            <Link
              href="/instances"
              className={buttonVariants({ variant: "brand", size: "sm" })}
            >
              Manage
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : instances.length === 0 ? (
            <Empty className="border-0">
              <EmptyHeader>
                <EmptyTitle>No instances yet</EmptyTitle>
                <EmptyDescription>
                  Register your first node with join credentials to start queuing deployments.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="divide-y divide-border">
              {instances.slice(0, 5).map((instance) => (
                <li
                  key={instance.id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{instance.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {instance.endpoint}
                    </p>
                  </div>
                  <StatusDot
                    status={instanceStatusTone(instance.status)}
                    label={instance.status}
                  />
                </li>
              ))}
            </ul>
          )}
        </Surface>

        <Surface variant="raised" className="space-y-4 lg:col-span-2">
          <div>
            <h2 className="text-base font-medium">Quick actions</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Jump into the most common CAS workflows.
            </p>
          </div>
          <div className="space-y-2">
            {[
              {
                href: "/instances",
                label: "Mint join credentials",
                icon: Boxes,
              },
              {
                href: "/deployments",
                label: "Queue deployment",
                icon: Rocket,
              },
              {
                href: "/config",
                label: "Edit CAS config",
                icon: Settings2,
              },
              {
                href: "/audit",
                label: "Review audit log",
                icon: ScrollText,
              },
            ].map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex h-11 items-center gap-3 rounded-md border border-border bg-background px-3 text-sm transition-colors hover:bg-muted/50 dark:bg-input/30"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  {action.label}
                </Link>
              )
            })}
          </div>
          <Callout variant="tip" title="Proxy secured">
            This panel talks to CAS through a server proxy. Keep{" "}
            <InlineCode>CAS_API_KEY</InlineCode> in{" "}
            <InlineCode>.env.local</InlineCode> — never in the browser.
          </Callout>
        </Surface>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Surface variant="raised" padding="none">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-medium">Recent audit</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Latest actions recorded by the CAS API
            </p>
          </div>
          {loading ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : audit.length === 0 ? (
            <Empty className="border-0">
              <EmptyHeader>
                <EmptyTitle>Quiet so far</EmptyTitle>
                <EmptyDescription>
                  Mutations to instances, config, and deployments appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="divide-y divide-border">
              {audit.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium capitalize">
                      {actionLabel(entry.action)}
                    </p>
                    <InlineCode className="mt-1 inline-flex max-w-full truncate">
                      {entry.resource}
                    </InlineCode>
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {formatWhen(entry.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </motion.div>
    </motion.div>
  )
}
