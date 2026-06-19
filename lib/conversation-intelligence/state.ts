import type { ConversationContextPayload } from "@/lib/business-types"
import { normalizeSurfaceFlowText } from "@/lib/surface-flow/product-entity"
import type {
  ConversationHistoryMessage,
  ConversationIntent,
  ConversationState,
} from "./types"

function normalize(value: string) {
  return normalizeSurfaceFlowText(value).trim()
}

function inferGoal(message: string): ConversationIntent | undefined {
  const normalized = normalize(message)
  if (/(agendar|marcar|reservar|horario|horário|hoje|amanha|amanhã|mais cedo)/.test(normalized)) {
    return "availability"
  }
  if (/(preco|preço|valor|quanto|custa)/.test(normalized)) return "price"
  if (/(recomenda|indica|melhor|combina|cortar o cabelo|qual corte|nao sei|não sei)/.test(normalized)) {
    return "recommendation"
  }
  if (/(profissional|barbeiro|carlos|rafael|joao|joão|outro profissional)/.test(normalized)) {
    return "professional_question"
  }
  if (/(corte|barba|degrade|degradê|fade|executivo|social)/.test(normalized)) return "service_question"
  return undefined
}

function serviceFromContext(contextItems: ConversationContextPayload[]) {
  return contextItems.find((item) => item.id.includes("service"))?.title
}

function professionalFromContext(contextItems: ConversationContextPayload[]) {
  return contextItems.find((item) => item.id.includes("barber") || item.id.includes("professional"))?.title
}

function inferServiceFromText(message: string) {
  const normalized = normalize(message)
  if (normalized.includes("barba")) return "Barba"
  if (normalized.includes("degrade") || normalized.includes("degradê") || normalized.includes("fade")) return "Degrade"
  if (normalized.includes("executivo") || normalized.includes("social")) return "Corte executivo"
  if (normalized.includes("corte") || normalized.includes("cortar")) return "Corte Masculino"
  return undefined
}

function inferProfessionalFromText(message: string) {
  const normalized = normalize(message)
  if (normalized.includes("carlos")) return "Carlos Silva"
  if (normalized.includes("rafael")) return "Rafael Santos"
  if (normalized.includes("joao") || normalized.includes("joão")) return "João"
  return undefined
}

function inferDatePreference(message: string) {
  const normalized = normalize(message)
  if (normalized.includes("hoje")) return "hoje"
  if (normalized.includes("amanha") || normalized.includes("amanhã")) return "amanhã"
  return undefined
}

function inferTimePreference(message: string) {
  const normalized = normalize(message)
  if (normalized.includes("mais cedo")) return "mais cedo"
  if (normalized.includes("manha") || normalized.includes("manhã")) return "manhã"
  if (normalized.includes("tarde")) return "tarde"
  if (normalized.includes("noite")) return "noite"
  return undefined
}

function lastAssistantQuestion(history: ConversationHistoryMessage[]) {
  return history
    .filter((message) => message.role === "ai" && message.content.includes("?"))
    .at(-1)?.content
}

function lastVisualBlockKind(history: ConversationHistoryMessage[]) {
  return history
    .map((message) => message.visualBlock?.kind)
    .filter(Boolean)
    .at(-1)
}

export function deriveConversationState({
  history = [],
  contextItems = [],
}: {
  history?: ConversationHistoryMessage[]
  contextItems?: ConversationContextPayload[]
}): ConversationState {
  const userMessages = history.filter((message) => message.role === "user")
  const rejectedOptions: string[] = []
  let acceptedOption: string | undefined
  let currentGoal: ConversationIntent | undefined
  let currentService = serviceFromContext(contextItems)
  let currentProfessional = professionalFromContext(contextItems)
  let currentDatePreference: string | undefined
  let currentTimePreference: string | undefined

  for (const message of userMessages) {
    const normalized = normalize(message.content)
    currentGoal = inferGoal(message.content) ?? currentGoal
    currentService = inferServiceFromText(message.content) ?? currentService
    currentProfessional = inferProfessionalFromText(message.content) ?? currentProfessional
    currentDatePreference = inferDatePreference(message.content) ?? currentDatePreference
    currentTimePreference = inferTimePreference(message.content) ?? currentTimePreference

    if (/(nao gostei|não gostei|tem outro|tem outra|outro profissional|outra opcao|outra opção)/.test(normalized)) {
      rejectedOptions.push(message.content)
    }
    if (/(pode ser|esse mesmo|fechado|vamos nesse|quero esse)/.test(normalized)) {
      acceptedOption = message.content
    }
  }

  return {
    currentGoal,
    currentService,
    currentProfessional,
    currentDatePreference,
    currentTimePreference,
    rejectedOptions: rejectedOptions.slice(-4),
    acceptedOption,
    lastShownVisualBlockKind: lastVisualBlockKind(history),
    lastAssistantQuestion: lastAssistantQuestion(history),
  }
}
