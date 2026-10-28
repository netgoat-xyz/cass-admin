"use client"

import { useCallback, useEffect, useState } from "react"
import { RefreshCw, Save } from "lucide-react"
import {
  Button,
  Callout,
  CopyButton,
  Field,
  FieldDescription,
  FieldLabel,
  InlineCode,
  PageHeader,
  Skeleton,
  Surface,
  Textarea,
} from "@netgoat/ui"
import { casApi } from "@/lib/cas-api"
import type { CasConfig } from "@/lib/types"

const STARTER = `{
  "deploy_window": "off-peak",
  "max_concurrent_rollouts": 2,
  "notify_on_queue": true
}`

export default function ConfigPage() {
  const [raw, setRaw] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const config = await casApi.getConfig()
      setRaw(JSON.stringify(config, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load config")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const save = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const parsed = JSON.parse(raw) as CasConfig
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        throw new Error("Config must be a JSON object")
      }
      const saved = await casApi.putConfig(parsed)
      setRaw(JSON.stringify(saved, null, 2))
      setMessage("Config saved to CAS")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const format = () => {
    setError(null)
    try {
      const parsed = JSON.parse(raw) as unknown
      setRaw(JSON.stringify(parsed, null, 2))
      setMessage("Formatted")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON")
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Control plane"
        title="Config"
        description="Edit the CAS shared configuration document. Stored as free-form JSON."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              Reload
            </Button>
            <Button
              variant="brand"
              size="sm"
              disabled={saving || loading}
              onClick={() => void save()}
            >
              <Save className="size-4" />
              Save
            </Button>
          </div>
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

      <Callout variant="tip" title="Schema-free">
        CAS accepts any JSON object. Start from the sample below if the store is
        empty — keys are application-defined.
      </Callout>

      <Surface variant="raised" className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-medium">Document</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              PUT replaces the entire <InlineCode>/api/config</InlineCode>{" "}
              payload.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => {
                setRaw(STARTER)
                setMessage("Loaded starter template")
                setError(null)
              }}
            >
              Insert starter
            </Button>
            <Button variant="outline" size="sm" type="button" onClick={format}>
              Format
            </Button>
            <CopyButton value={raw} />
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <Field>
            <FieldLabel htmlFor="config-json">JSON</FieldLabel>
            <Textarea
              id="config-json"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              spellCheck={false}
              className="min-h-[22rem] font-mono text-xs leading-relaxed md:text-sm"
            />
            <FieldDescription>
              Invalid JSON will be rejected before the request is sent.
            </FieldDescription>
          </Field>
        )}
      </Surface>
    </div>
  )
}
