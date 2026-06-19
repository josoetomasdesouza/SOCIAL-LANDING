import type { BrandDNA } from "@/lib/brand-dna"

export const BUSINESS_RUNTIME_VERSION = 1 as const

export type BusinessRuntimeStatus = "draft" | "published" | "archived"

export type BusinessRuntimeVertical =
  | "appointment"
  | "beauty"
  | "restaurant"
  | "clinic"
  | "barber"
  | "gym"
  | "generic"

export type BusinessRuntimeSourceMappingDecision =
  | "map-now"
  | "preserve-in-meta"
  | "intentionally-out"

export interface BusinessRuntimeSourceMappingNote {
  sourcePath: string
  decision: BusinessRuntimeSourceMappingDecision
  reason: string
}

export interface BusinessRuntimeChannelSet {
  whatsapp?: string
  instagram?: string
  email?: string
  phone?: string
  website?: string
}

export interface BusinessRuntimeBusiness {
  id: string
  name: string
  description?: string
  category?: string
  currentState?: string
}

export interface BusinessRuntimeBrand {
  name: string
  description: string
  logo?: string
  coverImage?: string
  primaryColor: string
  positioning?: string
  toneOfVoice?: string
  personality?: string
  suggestedColors?: {
    primary: string
    secondary?: string
    accent?: string
  }
  visualIdentity?: {
    style?: string
    accent?: string
  }
  keywords?: string[]
  targetAudience?: string
  valueProposition?: string
  dna?: BrandDNA
}

export interface BusinessRuntimeService {
  id: string
  name: string
  description?: string
  category?: string
  price?: number
  durationMinutes?: number
  image?: string
  tags?: string[]
}

export interface BusinessRuntimeTeamMember {
  id: string
  name: string
  role: string
  avatar?: string
  bio?: string
  specialties?: string[]
  rating?: number
  reviewCount?: number
  availabilitySummary?: string
}

export interface BusinessRuntimeHours {
  summary?: string
  timezone?: string
  weekly?: Array<{
    day: string
    intervals: Array<{ opens: string; closes: string }>
  }>
}

export interface BusinessRuntimeLocation {
  label?: string
  address?: string
  placeHint?: string
  mapsQuery?: string
  referenceHint?: string
  routeHint?: string
  parkingHint?: string
  arrivalMood?: string
}

export interface BusinessRuntimePolicies {
  booking?: string
  cancellation?: string
  payment?: string
  delivery?: string
  privacy?: string
  custom?: Array<{ id: string; title: string; body: string }>
}

export interface BusinessRuntimeKnowledge {
  summary?: string
  highlights: Array<{
    id: string
    title: string
    body?: string
    image?: string
    kind?: "story" | "post" | "faq" | "proof" | "news" | "gallery"
    metadata?: Record<string, string | number | boolean | undefined>
  }>
  faq?: Array<{ id: string; question: string; answer: string }>
  sourceNotes?: string[]
}

export interface BusinessRuntime {
  version: typeof BUSINESS_RUNTIME_VERSION
  vertical: BusinessRuntimeVertical
  slug: string
  status: BusinessRuntimeStatus
  business: BusinessRuntimeBusiness
  brand: BusinessRuntimeBrand
  services: BusinessRuntimeService[]
  team: BusinessRuntimeTeamMember[]
  hours: BusinessRuntimeHours
  location: BusinessRuntimeLocation
  channels: BusinessRuntimeChannelSet
  policies: BusinessRuntimePolicies
  knowledge: BusinessRuntimeKnowledge
  meta: {
    source: "adapter" | "fixture" | "manual"
    updatedAt: string
    mappingNotes?: BusinessRuntimeSourceMappingNote[]
    preservedSourceData?: Record<string, unknown>
  }
}
