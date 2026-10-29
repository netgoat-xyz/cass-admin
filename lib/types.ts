export type CasHealth = {
  status: string
  service: string
  version: string
}

export type CasOverview = {
  instances: number
  deployments: number
  audit_entries: number
  pending_joins?: number
}

export type CasCluster = {
  id: string
  fingerprint: string
  join_url: string
}

export type CasInstance = {
  id: string
  name: string
  endpoint: string
  status: string
  agent_key_hint?: string
  node_fingerprint?: string
  joined_at?: string
  created_at: string
  updated_at: string
}

export type CasJoinToken = {
  id: string
  name_hint: string
  token_hint: string
  expires_at: string
  used_at?: string | null
  used_by?: string
  revoked: boolean
  created_at: string
  status: "pending" | "used" | "expired" | "revoked" | string
}

export type CasJoinBundle = {
  id: string
  token: string
  token_hint: string
  name_hint: string
  expires_at: string
  created_at: string
  cluster: CasCluster
  join_command: string
  warning: string
}

export type CasJoinResult = {
  instance: CasInstance
  agent_key: string
  cluster: CasCluster
  warning: string
}

export type CasDeployment = {
  id: string
  instance_id: string
  version: string
  status: string
  created_at: string
}

export type CasAuditEntry = {
  id: string
  action: string
  resource: string
  created_at: string
}

export type CasConfig = Record<string, unknown>

export class CasApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "CasApiError"
    this.status = status
  }
}
