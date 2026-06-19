import type { ConversationContextPayload } from "@/lib/business-types"
import type { ConversationVisualBlock } from "@/lib/mock-data/conversational-search"
import type { HumanMessageNatureResult } from "./message-nature-classifier"
import type { UserProgressDecision } from "./user-progress-preservation"

export type ConversationIntent =
  | "greeting"
  | "recommendation"
  | "booking"
  | "price"
  | "availability"
  | "service_question"
  | "professional_question"
  | "operational_question"
  | "vague_followup"
  | "user_confused_by_assistant"
  | "off_domain"
  | "fallback"

export type ConversationResponseStyle = "warm" | "direct" | "advisory" | "clarifying" | "action_oriented"

export interface ConversationHistoryMessage {
  role: "ai" | "user" | "action" | "context_event"
  content: string
  contexts?: ConversationContextPayload[]
  context?: ConversationContextPayload
  visualBlock?: ConversationVisualBlock
}

export interface ConversationEntity {
  type: "service" | "professional" | "time" | "preference" | "topic" | "unknown"
  value: string
  source: "message" | "context" | "memory"
}

export interface ConversationMemory {
  lastUserMessage?: string
  lastAssistantMessage?: string
  activeIntent?: ConversationIntent
  previousIntent?: ConversationIntent
  lastUsefulTopic?: string
  lastOperationalTopic?: string
  lastToolTopic?: UniversalToolName
  lastUserDecision?: string
  lastUserReaction?: string
  lastEntityMentioned?: string
  lastAnswerableQuestion?: string
  lastOfferedNextStep?: string
  selectedContextItems: ConversationContextPayload[]
  inferredEntities: ConversationEntity[]
  userPreferences: string[]
  conversationSummary: string
  turnCount: number
}

export interface ConversationState {
  currentGoal?: ConversationIntent
  currentService?: string
  currentProfessional?: string
  currentDatePreference?: string
  currentTimePreference?: string
  rejectedOptions: string[]
  acceptedOption?: string
  lastShownVisualBlockKind?: string
  lastAssistantQuestion?: string
}

export interface ConversationInterpretation {
  intent: ConversationIntent
  confidence: number
  entities: ConversationEntity[]
  shouldShowVisualBlock: boolean
  shouldAskClarifyingQuestion: boolean
  responseStyle: ConversationResponseStyle
  groundedContext: ConversationContextPayload[]
  state: ConversationState
}

export interface ConversationIntelligenceMeta {
  intent: ConversationIntent
  confidence: number
  memoryUsed: boolean
  action: "answer_only" | "ask_clarifying" | "delegate_resolver" | "show_visual_block" | "fallback"
  nextMove?: NextConversationMove
  conversationMode?: ConversationMode
  actionRequest?: ConversationActionRequest
  topicStack?: ConversationTopicFrame[]
  toolRoute?: UniversalToolName
  messageNature?: HumanMessageNatureResult
  progressPreservation?: UserProgressDecision
  formatProfile?: HumanCommunicationFormatProfile
  humanity?: ConversationalHumanityProfile
  questionSatisfaction?: QuestionSatisfactionProfile
}

export interface ConversationIntelligenceResult {
  text: string
  visualBlock?: ConversationVisualBlock
  intelligence?: ConversationIntelligenceMeta
}

export type NextConversationMove =
  | { type: "ask_clarifying_question"; question: string; reason: string }
  | { type: "deepen_topic"; prompt: string; reason: string }
  | { type: "suggest_action"; action: string; reason: string }
  | { type: "confirm_understanding"; summary: string; reason: string }
  | { type: "offer_options"; options: string[]; reason: string }
  | { type: "close_loop"; message: string; reason: string }

export interface ConversationActionRequest {
  type: "show_options" | "show_schedule" | "show_price" | "show_professionals" | "none"
  reason: string
}

export type ConversationMode = "answer" | "reflect" | "clarify" | "recommend" | "act" | "close"

export interface HumanCommunicationFormatProfile {
  structure: "single_paragraph" | "short_paragraphs" | "bullets" | "numbered_steps" | "contrast" | "example" | "hybrid"
  emphasisUsed: boolean
  questionUsed: boolean
  listUsed: boolean
  quoteUsed: boolean
  reason: string
}

export interface ConversationalHumanityProfile {
  curiosity: number
  empathy: number
  depth: number
  adaptation: number
  brevity: number
  overall: number
  emotionalState: "neutral" | "insecure" | "indecisive" | "frustrated" | "grateful" | "closing" | "curious"
  personalityMode: "direct" | "technical" | "warm" | "exploratory" | "supportive"
  shouldContinue: boolean
  reasons: string[]
}

export interface QuestionContract {
  questionType: "none" | "yes_no_service" | "yes_no_service_availability" | "yes_no_professional_availability" | "yes_no_product_stock" | "yes_no_reservation" | "yes_no_schedule_availability" | "price_lookup" | "payment_lookup" | "delivery_lookup" | "booking_intent" | "sports_schedule_followup" | "sports_opinion_followup" | "topic_return" | "contextual_operational_followup" | "acknowledgement_followup" | "rejection_followup" | "concern_followup" | "preference_followup" | "ambiguous_short_followup" | "list_request" | "direct_answer"
  target?: string
  expectedAnswerShape: "none" | "direct_yes_no_with_uncertainty" | "operational_fail_closed" | "contextual_schedule" | "contextual_opinion" | "topic_resume" | "operational_uncertainty" | "contextual_acknowledgement" | "contextual_rejection" | "contextual_concern" | "contextual_preference" | "contextual_clarification" | "list_with_count" | "direct_explanation"
  mustAnswer: string[]
  mustNotSay: string[]
}

export interface QuestionSatisfactionProfile extends QuestionContract {
  answered: boolean
  repaired: boolean
  reason: string
}

export interface LlmBrainReply {
  text: string
  actionRequest?: ConversationActionRequest
  shouldUseLegacyResolver: boolean
  shouldShowVisualBlock: boolean
  conversationMode: ConversationMode
  nextQuestion?: string
}

export interface ConversationCatalogSummaryItem {
  id?: string
  name: string
  kind: "service" | "professional" | "product" | "post" | "unknown"
  detail?: string
}

export interface ConversationCatalogSummary {
  services?: ConversationCatalogSummaryItem[]
  professionals?: ConversationCatalogSummaryItem[]
  products?: ConversationCatalogSummaryItem[]
}

export interface LlmBrainProviderInput {
  message: string
  history: ConversationHistoryMessage[]
  memory: ConversationMemory
  state: ConversationState
  interpretedIntent: ConversationIntent
  nextMove: NextConversationMove
  contextItems: ConversationContextPayload[]
  brandName: string
  vertical: string
  catalogSummary?: ConversationCatalogSummary
  topicStack?: ConversationTopicFrame[]
  toolRoute?: UniversalToolName
  questionContract?: QuestionContract
}

export type ConversationTopicState = "active" | "paused" | "closed"

export interface ConversationTopicFrame {
  topic: string
  state: ConversationTopicState
}

export type UniversalToolName =
  | "answer_from_memory"
  | "answer_from_reasoning"
  | "web_search"
  | "weather"
  | "sports"
  | "news"
  | "time"
  | "catalog"
  | "booking"
  | "schedule"
  | "professional_lookup"
  | "service_lookup"
  | "product_lookup"

export interface UniversalToolRoutingResult {
  tool: UniversalToolName
  topic: string
  shouldAnswerImmediately: boolean
  answer?: string
  needsRealtime: boolean
  source?: string
  confidence: number
}
