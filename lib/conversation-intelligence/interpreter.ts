import type { ConversationContextPayload } from "@/lib/business-types"
import { normalizeSurfaceFlowText } from "@/lib/surface-flow/product-entity"
import type {
  ConversationEntity,
  ConversationIntent,
  ConversationHistoryMessage,
  ConversationInterpretation,
  ConversationMemory,
  ConversationResponseStyle,
} from "./types"
import { deriveConversationState } from "./state"

function normalize(value: string) {
  return normalizeSurfaceFlowText(value).trim()
}

function hasAny(normalized: string, cues: string[]) {
  return cues.some((cue) => normalized.includes(normalize(cue)))
}

function isGreeting(normalized: string) {
  return /\b(oi|ola|olá|bom dia|boa tarde|boa noite)\b/.test(normalized)
}

function isShortFollowUp(normalized: string) {
  const words = normalized.split(/\s+/).filter(Boolean)
  return words.length <= 4
}

function isUserConfusedByAssistant(normalized: string) {
  return (
    /\b(nao entendi|não entendi|como assim|explica melhor|nao fez sentido|não fez sentido|voce nao entendeu|você não entendeu|nao entendeu nada|não entendeu nada|responde direito)\b/.test(normalized) ||
    /^(que\??|hã\??|ha\??|hein\??)$/.test(normalized)
  )
}

function isContextDependentFollowUp(normalized: string) {
  return (
    /^(quanto\??|e hoje\??|mais cedo\??|tem outro\??|tem outra\??|esse mesmo|pode ser|fechado|vamos nesse)$/.test(normalized) ||
    hasAny(normalized, ["outro profissional", "outra opcao", "outra opção"])
  )
}

function isGeneralOffDomainQuestion(normalized: string) {
  const hasQuestionShape =
    normalized.includes("?") ||
    /^(qual|quem|quando|onde|como|por que|porque|o que|que)\b/.test(normalized)
  const hasDomainCue = hasAny(normalized, [
    "corte",
    "barba",
    "barbeiro",
    "profissional",
    "horario",
    "horário",
    "agendar",
    "visual",
  ])
  const generalCues = [
    "filme",
    "netflix",
    "serie",
    "série",
    "esporte",
    "futebol",
    "clima",
    "previsao do tempo",
    "previsão do tempo",
    "noticia",
    "notícia",
    "curiosidade",
    "historia",
    "história",
    "celebridade",
    "ator",
    "atriz",
    "cantor",
    "tecnologia",
    "iphone",
    "android",
    "inteligencia artificial",
    "inteligência artificial",
    "capital da",
    "silvio",
  ]

  return hasQuestionShape && !hasDomainCue && hasAny(normalized, generalCues)
}

function contextEntities(contextItems: ConversationContextPayload[]): ConversationEntity[] {
  return contextItems.map((item) => {
    if (item.id.includes("service")) return { type: "service", value: item.title, source: "context" }
    if (item.id.includes("barber") || item.id.includes("professional")) {
      return { type: "professional", value: item.title, source: "context" }
    }
    return { type: "topic", value: item.title, source: "context" }
  })
}

function inferEntities(message: string, contextItems: ConversationContextPayload[], memory: ConversationMemory) {
  const normalized = normalize(message)
  const entities: ConversationEntity[] = [...contextEntities(contextItems)]

  if (hasAny(normalized, ["hoje", "amanha", "amanhã", "mais cedo", "tarde", "manha", "manhã", "noite"])) {
    entities.push({ type: "time", value: message, source: "message" })
  }
  if (hasAny(normalized, ["executivo", "discreto", "marcado", "baixo", "moderno", "classico", "clássico"])) {
    entities.push({ type: "preference", value: message, source: "message" })
  }

  return [...entities, ...memory.inferredEntities.filter((entity) => entity.source !== "context").slice(-3)]
}

function resolveIntent(
  normalized: string,
  memory: ConversationMemory,
  contextItems: ConversationContextPayload[]
): ConversationIntent {
  if (isUserConfusedByAssistant(normalized)) return "user_confused_by_assistant"
  if (isGeneralOffDomainQuestion(normalized)) return "off_domain"
  if (isGreeting(normalized)) return "greeting"
  if (hasAny(normalized, ["preco", "preço", "valor", "quanto custa", "quanto fica", "quanto?", "quanto", "qnt", "qto"]) || normalized === "quanto") {
    return "price"
  }
  if (hasAny(normalized, ["horario", "horário", "hoje", "hj", "e hoje", "amanha", "amanhã", "mais cedo", "disponivel", "disponível", "3 da manha", "3 da manhã", "madrugada"])) {
    return "availability"
  }
  if (hasAny(normalized, ["agendar", "marcar", "reservar", "ver horarios", "ver horários"])) return "booking"
  if (hasAny(normalized, ["pode ser", "esse mesmo", "fechado", "vamos nesse", "quero esse"])) {
    return memory.activeIntent === "availability" ? "booking" : "vague_followup"
  }
  if (hasAny(normalized, ["outro profissional", "outra pessoa", "e se for com outro profissional", "com outro profissional"])) {
    return "professional_question"
  }
  if (isContextDependentFollowUp(normalized) || hasAny(normalized, ["nao gostei", "não gostei", "qual o melhor"])) {
    return contextItems.length > 0 || memory.activeIntent ? "vague_followup" : "recommendation"
  }
  if (hasAny(normalized, ["indica", "recomenda", "recomenda?", "qual voce recomenda", "qual você recomenda", "melhor", "combina", "qual corte", "quero cortar", "cortar cabelo", "cortar o cabelo", "nao sei", "não sei", "duvida", "dúvida", "deixo crescer", "mudar o visual", "tenho medo", "pareço mais velho", "pareco mais velho"])) {
    return "recommendation"
  }
  if (hasAny(normalized, ["servico", "serviço", "corte", "barba", "degrade", "degradê", "fade", "executivo", "tbm", "tambem", "também"])) {
    return "service_question"
  }
  if (hasAny(normalized, ["profissional", "barbeiro", "joao", "joão", "carlos", "rafael", "quem atende"])) {
    return "professional_question"
  }
  if (hasAny(normalized, ["onde fica", "endereco", "endereço", "estacionamento", "aberto", "funciona", "chegar"])) {
    return "operational_question"
  }
  if (hasAny(normalized, ["jogo", "restaurante", "manicure", "unha", "limpeza de rosto", "silvio", "capital da", "noticia", "notícia"])) {
    return "off_domain"
  }

  if (isShortFollowUp(normalized) && isContextDependentFollowUp(normalized) && (contextItems.length > 0 || memory.activeIntent)) {
    return "vague_followup"
  }

  return "fallback"
}

function resolveResponseStyle(intent: ConversationIntent): ConversationResponseStyle {
  if (intent === "recommendation" || intent === "service_question") return "advisory"
  if (intent === "booking" || intent === "availability") return "action_oriented"
  if (intent === "vague_followup" || intent === "fallback") return "clarifying"
  return "warm"
}

function shouldShowVisualBlock(intent: ConversationIntent, hasContext: boolean, confidence: number) {
  if (confidence < 0.55) return false
  if (intent === "booking" || intent === "availability") return true
  if (intent === "price") return hasContext
  if (intent === "recommendation") return hasContext
  return false
}

export function interpretConversationTurn({
  message,
  contextItems,
  conversationMemory,
  history = [],
}: {
  message: string
  contextItems: ConversationContextPayload[]
  conversationMemory: ConversationMemory
  brandName: string
  history?: ConversationHistoryMessage[]
}): ConversationInterpretation {
  const normalized = normalize(message)
  const intent = resolveIntent(normalized, conversationMemory, contextItems)
  const priorState = deriveConversationState({ history, contextItems })
  const state = deriveConversationState({
    history: [...history, { role: "user", content: message }],
    contextItems,
  })
  const hasContext =
    contextItems.length > 0 ||
    conversationMemory.selectedContextItems.length > 0 ||
    Boolean(priorState.currentService || priorState.currentProfessional)
  const memoryHelped =
    intent === "vague_followup" ||
    (isShortFollowUp(normalized) && Boolean(conversationMemory.activeIntent || state.currentGoal))
  const confidence =
    intent === "fallback" ? 0.3 : memoryHelped ? 0.68 : hasContext ? 0.82 : 0.72
  const entities = inferEntities(message, contextItems, conversationMemory)
  const shouldAskClarifyingQuestion =
    intent === "recommendation" && !hasContext && !hasAny(normalized, ["agendar", "horario", "horário"]) ||
    intent === "fallback" ||
    (intent === "vague_followup" && !hasContext && !conversationMemory.activeIntent)

  return {
    intent,
    confidence,
    entities,
    shouldShowVisualBlock: shouldShowVisualBlock(intent, hasContext, confidence),
    shouldAskClarifyingQuestion,
    responseStyle: resolveResponseStyle(intent),
    groundedContext: contextItems.length > 0 ? contextItems : conversationMemory.selectedContextItems,
    state,
  }
}
