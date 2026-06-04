import type { ConversationContextPayload } from "@/lib/business-types"
import type { AnswerabilityClass } from "./answerability-classifier"

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
  | "social_post"
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
  | "active_topic"
  | "catalog"
  | "operational"
  | "data_gap"
  | "none"

/** Strong topic lane — overrides stale selectedContextItem (WS-19A active topic resolution). */
export type ActiveTopic =
  | "schedule"
  | "service"
  | "professional"
  | "arrival"
  | "pricing"
  | "news_editorial"

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
  /** Set when reply follows active topic lane instead of chip. */
  activeTopic?: ActiveTopic
  /** Answer-first gate classification (WS-19A). */
  answerability?: AnswerabilityClass
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

export type TopicOwner = "intent" | "session" | "chip"

/** Pending clarify from prior turn (WS-19A PR3 multi-turn). */
export type PendingClarification = "branch_unit" | "feed_scope"

export type SessionOperationalLane = "parking" | "hours" | "arrival"

export interface KernelSession {
  lastTopic?: string
  /** Strong topic lane — overrides chip when user shifts (GK active topic resolution). */
  activeTopic?: ActiveTopic
  /** Who won the last turn: intent > session > chip (PR3). */
  topicOwner?: TopicOwner
  pendingClarification?: PendingClarification
  /** Operational thread after parking/hours (PR3). */
  sessionLane?: SessionOperationalLane
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
