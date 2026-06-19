import type { BusinessRuntime, BusinessRuntimeVertical } from "../core"

export interface BusinessRuntimePublicationRecord {
  slug: string
  draftId: string
  runtime: BusinessRuntime
  publishedAt: string
  updatedAt: string
}

export interface BusinessRuntimePublicationSummary {
  slug: string
  draftId: string
  name: string
  vertical: BusinessRuntimeVertical
  status: BusinessRuntime["status"]
  updatedAt: string
}

export interface PublishBusinessRuntimeDraftResult {
  publication: BusinessRuntimePublicationRecord
  backupKey?: string
  backupPath?: string
}
