import type { ConversationContextPayload } from "@/lib/business-types"
import { normalizeSurfaceFlowText } from "@/lib/surface-flow/product-entity"
import type {
  ConversationEntity,
  ConversationHistoryMessage,
  ConversationIntent,
  ConversationMemory,
  UniversalToolName,
} from "./types"

const SERVICE_CUES = [
  "corte",
  "barba",
  "degrade",
  "degradê",
  "fade",
  "social",
  "executivo",
  "classico",
  "clássico",
]

const PREFERENCE_CUES = [
  "discreto",
  "executivo",
  "marcado",
  "baixo",
  "moderno",
  "natural",
  "nao gostei",
  "não gostei",
]

const TOOL_TOPIC_CUES: Array<{ tool: UniversalToolName; cues: string[] }> = [
  { tool: "sports", cues: ["jogo", "joga hoje", "quem joga", "futebol", "copa", "brasileirao", "brasileirão", "libertadores"] },
  { tool: "weather", cues: ["clima", "chover", "chuva", "temperatura", "previsao", "previsão"] },
  { tool: "news", cues: ["noticia", "notícia", "noticias", "notícias", "manchete"] },
  { tool: "time", cues: ["que dia", "data de hoje", "hora atual"] },
  { tool: "web_search", cues: ["netflix", "celular mais vendido", "atualmente", "ranking", "mais assistido"] },
]

const ENTITY_CUES = [
  "corte",
  "barba",
  "jogo",
  "produto",
  "profissional",
  "horário",
  "horario",
  "reserva",
  "estoque",
  "consulta",
  "mesa",
  "notebook",
  "cacheado",
]

function normalize(value: string) {
  return normalizeSurfaceFlowText(value).trim()
}

function inferIntentFromText(message: string): ConversationIntent | undefined {
  const normalized = normalize(message)
  if (!normalized) return undefined
  if (/\b(nao entendi|não entendi|como assim|explica melhor|nao fez sentido|não fez sentido|voce nao entendeu|você não entendeu|nao entendeu nada|não entendeu nada|responde direito)\b/.test(normalized) || /^(que\??|hã\??|ha\??|hein\??)$/.test(normalized)) {
    return "user_confused_by_assistant"
  }
  const hasDomainCue = /(corte|barba|barbeiro|profissional|horario|horário|agendar|visual)/.test(normalized)
  if (
    (normalized.includes("?") || /^(qual|quem|quando|onde|como|por que|porque|o que|que)\b/.test(normalized)) &&
    !hasDomainCue &&
    /(filme|netflix|serie|série|esporte|futebol|clima|previsao do tempo|previsão do tempo|noticia|notícia|curiosidade|historia|história|celebridade|ator|atriz|cantor|tecnologia|iphone|android|capital da|silvio|jogo)/.test(normalized)
  ) {
    return "off_domain"
  }
  if (/\b(oi|ola|olá|bom dia|boa tarde|boa noite)\b/.test(normalized)) return "greeting"
  if (/(preco|preço|valor|custa|quanto|qnt|qto)/.test(normalized)) return "price"
  if (/(horario|horário|hoje|hj|amanha|amanhã|mais cedo|tarde|manha|manhã|disponivel|disponível|3 da manha|3 da manhã|madrugada)/.test(normalized)) {
    return "availability"
  }
  if (/(agendar|marcar|reservar|ver horarios|ver horários)/.test(normalized)) return "booking"
  if (/(pode ser|esse mesmo|fechado|vamos nesse)/.test(normalized)) return "booking"
  if (/(tem outro|tem outra|outro profissional|nao gostei|não gostei)/.test(normalized)) return "vague_followup"
  if (/(indica|recomenda|melhor|combina|qual corte|quero cortar|cortar cabelo|cortar o cabelo|nao sei|não sei|duvida|dúvida|deixo crescer|mudar o visual|tenho medo|pareço mais velho|pareco mais velho)/.test(normalized)) return "recommendation"
  if (/(onde fica|endereco|endereço|estacionamento|aberto|funciona|chegar)/.test(normalized)) return "operational_question"
  if (/(profissional|barbeiro|quem|joao|joão|carlos|rafael)/.test(normalized)) return "professional_question"
  if (SERVICE_CUES.some((cue) => normalized.includes(normalize(cue)))) return "service_question"
  return undefined
}

function inferEntitiesFromText(message: string): ConversationEntity[] {
  const normalized = normalize(message)
  const entities: ConversationEntity[] = []

  for (const cue of SERVICE_CUES) {
    const normalizedCue = normalize(cue)
    if (normalized.includes(normalizedCue)) {
      entities.push({ type: "service", value: cue, source: "message" })
    }
  }

  if (/(hoje|amanha|amanhã|mais cedo|tarde|manha|manhã|noite)/.test(normalized)) {
    entities.push({ type: "time", value: message, source: "message" })
  }

  for (const cue of PREFERENCE_CUES) {
    const normalizedCue = normalize(cue)
    if (normalized.includes(normalizedCue)) {
      entities.push({ type: "preference", value: cue, source: "message" })
    }
  }

  return entities
}

function hasAny(normalized: string, cues: string[]) {
  return cues.some((cue) => normalized.includes(normalize(cue)))
}

function inferToolTopic(message: string): UniversalToolName | undefined {
  const normalized = normalize(message)
  return TOOL_TOPIC_CUES.find((entry) => hasAny(normalized, entry.cues))?.tool
}

function inferUsefulTopic(message: string) {
  const normalized = normalize(message)
  if (hasAny(normalized, ["jogo", "futebol", "copa"])) return "futebol"
  if (hasAny(normalized, ["clima", "chuva", "temperatura"])) return "clima"
  if (hasAny(normalized, ["noticia", "notícia", "tecnologia", "ia"])) return "noticias"
  if (hasAny(normalized, ["notebook", "celular", "produto", "estoque"])) return "produto"
  if (hasAny(normalized, ["100 mil", "investimento", "imovel", "imóvel", "financeiro"])) return "financas"
  if (hasAny(normalized, ["chefe", "relacionamento", "mensagem"])) return "relacionamento"
  if (hasAny(normalized, ["peso", "saude", "saúde", "alimentacao", "alimentação", "pele", "irritar"])) return "saude_leve"
  if (hasAny(normalized, ["corolla", "civic", "iphone", "samsung"])) return "comparacao"
  if (hasAny(normalized, ["capital", "quem foi", "historia", "história"])) return "curiosidade"
  if (hasAny(normalized, ["corte", "cortar", "barba", "visual", "profissional", "horario", "horário", "agenda"])) return "agendamento"
  return undefined
}

function inferOperationalTopic(message: string) {
  const normalized = normalize(message)
  if (hasAny(normalized, ["corte", "cortar", "barba", "profissional", "horario", "horário", "agenda", "consulta", "reserva", "mesa", "servico", "serviço"])) return "agendamento"
  if (hasAny(normalized, ["produto", "estoque", "notebook", "celular", "preço", "preco", "valor"])) return "produto"
  return undefined
}

function inferUserDecision(message: string) {
  const normalized = normalize(message)
  if (hasAny(normalized, ["pode ser", "esse mesmo", "fechado", "vamos nesse", "gostei"])) return message
  return undefined
}

function inferUserReaction(message: string) {
  const normalized = normalize(message)
  if (hasAny(normalized, ["interessante", "legal", "não gostei", "nao gostei", "gostei", "estranho", "faz sentido", "e se irritar"])) return message
  return undefined
}

function inferEntityMentioned(message: string) {
  const normalized = normalize(message)
  return ENTITY_CUES.find((cue) => normalized.includes(normalize(cue)))
}

function isAnswerableQuestion(message: string) {
  const normalized = normalize(message)
  return message.includes("?") || /^(qual|quem|quando|onde|como|por que|porque|o que|que|tem|quanto|qnt|qto|e\s+)/.test(normalized)
}

function inferOfferedNextStep(message?: string) {
  if (!message) return undefined
  const normalized = normalize(message)
  if (hasAny(normalized, ["quer", "posso", "dá para", "da para", "vamos", "prefere"])) return message
  return undefined
}

function latestDefined<T>(items: T[]) {
  return items.filter(Boolean).at(-1)
}

function entitiesFromContext(contextItems: ConversationContextPayload[]): ConversationEntity[] {
  return contextItems.map((item) => {
    if (item.id.includes("service")) {
      return { type: "service", value: item.title, source: "context" }
    }
    if (item.id.includes("barber") || item.id.includes("professional")) {
      return { type: "professional", value: item.title, source: "context" }
    }
    return { type: "topic", value: item.title, source: "context" }
  })
}

function summarize(messages: ConversationHistoryMessage[], contextItems: ConversationContextPayload[]) {
  const recentUserMessages = messages
    .filter((message) => message.role === "user")
    .slice(-3)
    .map((message) => message.content.trim())
    .filter(Boolean)

  const contextLabel = contextItems
    .map((item) => item.title.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(", ")

  if (recentUserMessages.length === 0 && !contextLabel) return ""
  if (!contextLabel) return `Usuário vem falando de: ${recentUserMessages.join(" / ")}.`
  return `Contexto selecionado: ${contextLabel}. Últimos turnos: ${recentUserMessages.join(" / ")}.`
}

export function deriveConversationMemory({
  history = [],
  contextItems = [],
}: {
  history?: ConversationHistoryMessage[]
  contextItems?: ConversationContextPayload[]
}): ConversationMemory {
  const userMessages = history.filter((message) => message.role === "user")
  const assistantMessages = history.filter((message) => message.role === "ai")
  const lastUserMessage = userMessages.at(-1)?.content
  const previousUserMessage = userMessages.at(-2)?.content
  const lastAssistantMessage = assistantMessages.at(-1)?.content
  const activeIntent = lastUserMessage ? inferIntentFromText(lastUserMessage) : undefined
  const previousIntent = previousUserMessage ? inferIntentFromText(previousUserMessage) : undefined
  const inferredEntities = [
    ...entitiesFromContext(contextItems),
    ...history.flatMap((message) => (message.role === "user" ? inferEntitiesFromText(message.content) : [])),
  ].slice(-8)
  const userPreferences = inferredEntities
    .filter((entity) => entity.type === "preference")
    .map((entity) => entity.value)
    .slice(-4)
  const lastUsefulTopic = latestDefined(userMessages.map((message) => inferUsefulTopic(message.content)))
  const lastOperationalTopic = latestDefined(userMessages.map((message) => inferOperationalTopic(message.content)))
  const lastToolTopic = latestDefined(userMessages.map((message) => inferToolTopic(message.content)))
  const lastUserDecision = latestDefined(userMessages.map((message) => inferUserDecision(message.content)))
  const lastUserReaction = latestDefined(userMessages.map((message) => inferUserReaction(message.content)))
  const lastEntityMentioned = latestDefined(userMessages.map((message) => inferEntityMentioned(message.content)))
  const lastAnswerableQuestion = latestDefined(userMessages.map((message) => isAnswerableQuestion(message.content) ? message.content : undefined))
  const lastOfferedNextStep = inferOfferedNextStep(lastAssistantMessage)

  return {
    lastUserMessage,
    lastAssistantMessage,
    activeIntent,
    previousIntent,
    lastUsefulTopic,
    lastOperationalTopic,
    lastToolTopic,
    lastUserDecision,
    lastUserReaction,
    lastEntityMentioned,
    lastAnswerableQuestion,
    lastOfferedNextStep,
    selectedContextItems: contextItems,
    inferredEntities,
    userPreferences,
    conversationSummary: summarize(history, contextItems),
    turnCount: userMessages.length,
  }
}
