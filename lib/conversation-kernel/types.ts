import type { ConversationContextPayload } from "@/lib/business-types"

export type ModelId = "ecommerce" | "restaurant" | "health" | "appointment"

export type SelectedContextItemKind =
  | "service"
  | "professional"
  | "product"
  | "menu_item"
  | "video"
  | "news"
  | "style"
  | "review"
  | "unknown"

export interface SelectedContextItem {
  id: string
  kind: SelectedContextItemKind
  title: string
  summary?: string
  knownFacts: string[]
  belongsToCurrentHouse: boolean
  isExternalOrEditorial: boolean
  relatedEntityIds?: string[]
  sourcePrefix?: string
}

export interface ModelContextPack {
  modelId: ModelId
  brandName: string
  pilotSlug?: string
  houseVoice: {
    roleLabel: string
    locale: string
    maxReplySentences: number
    allowEmoji: boolean
  }
  operational?: {
    liveState?: string
    placeHint?: string
    momentHint?: string
    hoursHint?: string
    openingHours?: string
    addressLine?: string
    parkingHint?: string
    contactHint?: string
  }
  catalog: {
    entities: Array<{
      id: string
      kind: string
      name: string
      category?: string
      attributes?: Record<string, string | number | boolean>
    }>
    exclusions?: string[]
  }
  capabilities: {
    visualBlockKinds: string[]
    supportsContextChips: boolean
    supportsSchedulePrompt: boolean
    supportsCartOrBookingDrawer: boolean
    supportsArrivalMap: boolean
  }
  transactionalResolverId: string
  dataGaps: Array<{
    topic: string
    honestReply: string
  }>
  selectedContextItems: SelectedContextItem[]
}

export type KernelIntent =
  | "greet"
  | "small_talk"
  | "operational"
  | "discover"
  | "entity_lookup"
  | "transactional"
  | "practical_question"
  | "out_of_catalog"
  | "polite_detour"
  | "domain_blocked"
  | "meta_complaint"
  | "context_grounded"

export type KernelDomainZone = "in_domain" | "in_domain_unknown" | "off_domain_light" | "off_domain_blocked"

export type KernelGroundingSource =
  | "selected_context"
  | "catalog"
  | "operational"
  | "data_gap"
  | "none"

export type KernelAction =
  | { type: "text_only" }
  | { type: "delegate_transactional_resolver" }
  | { type: "show_catalog_cards"; entityIds: string[]; maxItems?: number }
  | { type: "show_schedule_prompt"; barberId?: string; serviceId?: string }
  | { type: "bridge_to_page"; anchor: "feed" | "hero_map" | "contact" | "cart" }
  | { type: "situated_fallback" }
  | { type: "ack_meta_complaint" }

export interface KernelResponse {
  reply: string
  intent: KernelIntent
  domainZone: KernelDomainZone
  topic: string
  topicShift: boolean
  structure: {
    acknowledged: boolean
    answered: boolean
    followUpQuestion?: string
  }
  confidence: "high" | "medium" | "low"
  action: KernelAction
  source: "rule_table" | "transactional_delegate" | "llm_bounded" | "selected_context"
  grounding: {
    source: KernelGroundingSource
    itemIds: string[]
    confidence: "high" | "medium" | "low"
  }
}

export interface KernelSession {
  lastTopic?: string
  discoveryTurns: number
  awaitingFocus: boolean
}

export function createKernelSession(): KernelSession {
  return { discoveryTurns: 0, awaitingFocus: false }
}

export interface RuleKernelInput {
  message: string
  pack: ModelContextPack
  session?: KernelSession
  /** Raw chips from Tier 1 — for pack rebuild in adapter */
  contextItems?: ConversationContextPayload[]
}

export function isKernelResponseValid(response: KernelResponse): boolean {
  if (!response.reply?.trim()) {
    if (response.action.type === "delegate_transactional_resolver") return true
    return false
  }
  if (response.reply.length > 600) return false
  const banned = [/como posso ajudar/i, /sou um assistente/i, /assistente virtual/i]
  return !banned.some((pattern) => pattern.test(response.reply))
}
