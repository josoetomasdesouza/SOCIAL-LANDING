import { normalizeSurfaceFlowText } from "@/lib/surface-flow/product-entity"
import type { ConversationHistoryMessage } from "./types"

export type HumanMessageNature =
  | "QUESTION"
  | "REQUEST"
  | "OBSERVATION"
  | "STORY"
  | "REACTION"
  | "EMOTION"
  | "GREETING"
  | "BOOKING_INTENT"
  | "OPERATIONAL_QUERY"

export interface HumanMessageNatureResult {
  nature: HumanMessageNature
  confidence: number
  reason: string
}

function normalize(value: string) {
  return normalizeSurfaceFlowText(value).trim()
}

function hasAny(value: string, cues: string[]) {
  const normalized = normalize(value)
  return cues.some((cue) => normalized.includes(normalize(cue)))
}

function isQuestion(message: string) {
  const normalized = normalize(message)
  return message.includes("?") || /^(que|qual|quem|quando|onde|como|por que|porque|o que)\b/.test(normalized)
}

function hasRecentConversation(history: ConversationHistoryMessage[] = []) {
  return history.some((entry) => entry.role === "user" || entry.role === "ai")
}

export function classifyHumanMessageNature({
  message,
  history = [],
}: {
  message: string
  history?: ConversationHistoryMessage[]
}): HumanMessageNatureResult {
  const normalized = normalize(message)

  if (!normalized) {
    return { nature: "OBSERVATION", confidence: 0.4, reason: "empty_or_blank_message" }
  }

  if (/^(oi|ola|olá|bom dia|boa tarde|boa noite|e ai|e aí)\b/.test(normalized)) {
    return { nature: "GREETING", confidence: 0.96, reason: "greeting_cue" }
  }

  if (hasAny(normalized, ["interessante", "legal", "não gostei", "nao gostei", "gostei", "faz sentido", "melhor não", "melhor nao"])) {
    return { nature: "REACTION", confidence: 0.94, reason: "short_reaction_cue" }
  }

  if (hasAny(normalized, ["estou inseguro", "estou insegura", "tenho medo", "com medo", "ansioso", "ansiosa", "vergonha", "receio"])) {
    return { nature: "EMOTION", confidence: 0.92, reason: "emotional_state_cue" }
  }

  if (/^(quero|queria|vamos|bora|preciso)\s+(agendar|marcar|reservar)\b/.test(normalized) || hasAny(normalized, ["quero agendar", "vamos marcar", "bora marcar", "preciso marcar"])) {
    return { nature: "BOOKING_INTENT", confidence: 0.95, reason: "booking_intent_without_slot_query" }
  }

  if (isQuestion(message) && hasAny(normalized, ["jogo", "futebol", "copa", "clima", "chuva", "notícia", "noticia", "netflix", "filme", "ranking"])) {
    return { nature: "QUESTION", confidence: 0.9, reason: "general_or_realtime_question_not_operational_business_query" }
  }

  if (hasAny(normalized, ["aceita cartão", "aceita cartao", "aceita pix", "tem vaga", "tem horário", "tem horario", "tem hoje", "tem sábado", "tem sabado", "quanto custa", "qual o valor", "preço", "preco", "faz entrega", "tem estoque"])) {
    return { nature: "OPERATIONAL_QUERY", confidence: 0.93, reason: "operational_data_query" }
  }

  if (hasAny(normalized, ["me mostra", "mostra os", "me envie", "me manda", "quero ver", "abre as opções", "abre as opcoes"])) {
    return { nature: "REQUEST", confidence: 0.9, reason: "request_for_display_or_options" }
  }

  if (hasAny(normalized, ["minha esposa", "meu marido", "minha namorada", "meu namorado", "minha mãe", "minha mae", "meu pai"]) &&
    !isQuestion(message)) {
    return { nature: "STORY", confidence: 0.86, reason: "personal_story_reference" }
  }

  if (!isQuestion(message) && (
    hasAny(normalized, ["faz 30 dias", "faz trinta dias", "nao corto", "não corto", "meu cabelo esta enorme", "meu cabelo está enorme", "meu cabelo anda", "cabelo enorme", "cabelo bagunçado", "cabelo baguncado", "barba esta", "barba está", "barba desajeitada", "ja esta na hora", "já está na hora", "esta na hora", "tá na hora", "ta na hora", "preciso mudar um pouco", "evento semana"]) ||
    (/^faz\s+\d+\s+dias\b/.test(normalized)) ||
    (/^acho que\b/.test(normalized) && hasRecentConversation(history))
  )) {
    return { nature: "OBSERVATION", confidence: 0.94, reason: "personal_observation_not_operational_query" }
  }

  if (isQuestion(message)) {
    return { nature: "QUESTION", confidence: 0.82, reason: "question_shape_without_operational_cue" }
  }

  return { nature: "OBSERVATION", confidence: 0.62, reason: "default_conversational_statement" }
}
