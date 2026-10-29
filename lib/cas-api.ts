import { CasApiError } from "./types"
import type {
  CasAuditEntry,
  CasCluster,
  CasConfig,
  CasDeployment,
  CasHealth,
  CasInstance,
  CasJoinBundle,
  CasJoinResult,
  CasJoinToken,
  CasOverview,
} from "./types"

async function casFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/cas${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })

  const text = await response.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = { error: text }
    }
  }

  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body &&
      "error" in body &&
      typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : `Request failed (${response.status})`
    throw new CasApiError(message, response.status)
  }

  return body as T
}

function asList<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}

function asObject(value: CasConfig | null | undefined): CasConfig {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {}
}

export const casApi = {
  health: () => casFetch<CasHealth>("/health"),
  overview: () => casFetch<CasOverview>("/api/overview"),
  getCluster: () => casFetch<CasCluster>("/api/cluster"),
  listInstances: async () =>
    asList(await casFetch<CasInstance[] | null>("/api/instances")),
  updateInstance: (
    id: string,
    input: { name?: string; endpoint?: string }
  ) =>
    casFetch<CasInstance>(`/api/instances/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  listJoinTokens: async () =>
    asList(await casFetch<CasJoinToken[] | null>("/api/join-tokens")),
  mintJoinToken: (input: { name_hint: string; ttl_hours?: number }) =>
    casFetch<CasJoinBundle>("/api/join-tokens", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  revokeJoinToken: (id: string) =>
    casFetch<{ status: string; id: string }>(
      `/api/join-tokens/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    ),
  joinClaim: (input: {
    token: string
    name: string
    endpoint: string
    fingerprint: string
    node_fingerprint?: string
  }) =>
    casFetch<CasJoinResult>("/api/join", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  getConfig: async () =>
    asObject(await casFetch<CasConfig | null>("/api/config")),
  putConfig: (config: CasConfig) =>
    casFetch<CasConfig>("/api/config", {
      method: "PUT",
      body: JSON.stringify(config),
    }),
  listDeployments: async () =>
    asList(await casFetch<CasDeployment[] | null>("/api/deployments")),
  queueDeployment: (input: { instance_id: string; version: string }) =>
    casFetch<CasDeployment>("/api/deployments", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  listAudit: async () =>
    asList(await casFetch<CasAuditEntry[] | null>("/api/audit")),
}
