export interface CRMContact {
  readonly id?: string
  readonly name: string
  readonly email?: string
  readonly phone?: string
  readonly source?: string
}

export interface CRMDeal {
  readonly id?: string
  readonly title: string
  readonly stage: string
  readonly contactId?: string
}

export type CRMIntegrationErrorCode = "NOT_CONFIGURED" | "AUTH_REQUIRED" | "PROVIDER_ERROR"

export interface CRMIntegrationError {
  readonly code: CRMIntegrationErrorCode
  readonly message: string
}

export interface CRMLeadPayload {
  readonly contact: CRMContact
  readonly notes?: string
  readonly tags?: readonly string[]
}
