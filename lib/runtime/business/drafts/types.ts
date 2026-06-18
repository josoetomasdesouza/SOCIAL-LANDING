import type {
  BusinessRuntime,
  BusinessRuntimeChannelSet,
  BusinessRuntimeVertical,
} from "../core"

export interface BusinessRuntimeDraftInput {
  name: string
  businessModel?: string | null
  description?: string | null
  website?: string | null
  logo?: string | null
  coverImage?: string | null
  primaryColor?: string | null
  industry?: string | null
  socialLinks?: {
    instagram?: string
    whatsapp?: string
  } | null
  channels?: BusinessRuntimeChannelSet
}

export interface BusinessRuntimeDraftRecord {
  draftId: string
  runtime: BusinessRuntime
  createdAt: string
  updatedAt: string
  publishedSlug?: string
  lastPublishedAt?: string
  publicationVersion?: number
}

export interface BusinessRuntimeDraftSummary {
  draftId: string
  slug: string
  name: string
  vertical: BusinessRuntimeVertical
  status: BusinessRuntime["status"]
  updatedAt: string
  publishedSlug?: string
  lastPublishedAt?: string
  publicationVersion?: number
}
