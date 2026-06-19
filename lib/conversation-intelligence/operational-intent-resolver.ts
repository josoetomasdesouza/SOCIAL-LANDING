import type {
  ConversationCatalogSummary,
  ConversationMemory,
  QuestionContract,
  UniversalToolName,
} from "./types"

export type OperationalIntentType =
  | "none"
  | "service_availability_question"
  | "professional_availability_question"
  | "product_stock_question"
  | "reservation_question"
  | "schedule_availability_question"
  | "price_question"
  | "payment_question"
  | "delivery_question"
  | "booking_question"

export interface OperationalIntentResult {
  type: OperationalIntentType
  target?: string
  vertical: string
  itemKind?: "service" | "professional" | "product" | "reservation" | "schedule" | "price" | "payment" | "delivery" | "booking"
  tool: UniversalToolName
  confirmedByCatalog: boolean
  confidence: number
  reason: string
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function compact(value: string) {
  return normalize(value)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function hasAny(value: string, cues: string[]) {
  const normalized = normalize(value)
  return cues.some((cue) => normalized.includes(normalize(cue)))
}

function inferVertical(message: string, memory?: ConversationMemory) {
  const haystack = compact(`${memory?.conversationSummary ?? ""} ${memory?.lastUserMessage ?? ""} ${message}`)

  if (hasAny(haystack, ["restaurante", "jantar", "mesa", "reserva", "prato", "cardapio", "cardápio", "vegetariano"])) return "restaurante"
  if (hasAny(haystack, ["loja", "tenis", "tênis", "produto", "estoque", "modelo", "numero", "número", "entrega", "pronta entrega"])) return "loja"
  if (hasAny(haystack, ["consulta", "consultorio", "consultório", "especialista", "convenio", "convênio", "paciente"])) return "consultório"
  if (hasAny(haystack, ["estetica", "estética", "limpeza de pele", "procedimento", "pele sensivel", "pele sensível"])) return "estética"
  if (hasAny(haystack, ["salao", "salão", "luzes", "escova", "coloracao", "coloração", "cabelo feminino"])) return "salão feminino"
  if (hasAny(haystack, ["academia", "plano mensal", "spinning", "musculacao", "musculação", "professor"])) return "academia"
  if (hasAny(haystack, ["oficina", "carro", "troca de oleo", "troca de óleo", "revisao", "revisão", "orcamento", "orçamento"])) return "oficina"
  if (hasAny(haystack, ["pet", "cachorro", "filhote", "banho e tosa", "tosa", "tosador"])) return "pet shop"
  if (hasAny(haystack, ["barba", "barbearia", "barbeiro", "corte", "degrade", "degradê"])) return "barbearia"

  return "negócio"
}

function extractTarget(message: string, type: OperationalIntentType) {
  const normalized = compact(message)
  const patterns = [
    /\b(?:voces|voce|vocês|você)\s+(?:fazem|faz|tem|atendem|atende|cortam|corta)\s+(.+)$/,
    /\btem\s+(?:profissional|especialista|professor|barbeiro|tosador)\s+(?:para|de|em)?\s*(.+)$/,
    /\b(?:quero|preciso de|procuro)\s+(.+)$/,
  ]

  for (const pattern of patterns) {
    const match = normalized.match(pattern)
    if (match?.[1]) return cleanTarget(match[1])
  }

  if (type === "payment_question") return "forma de pagamento"
  if (type === "delivery_question") return "entrega"
  if (type === "reservation_question") return "reserva"
  if (type === "schedule_availability_question") return "horário"
  if (type === "booking_question") return "agendamento"
  if (type === "price_question") return "preço"
  if (type === "product_stock_question") return "produto"
  return undefined
}

function cleanTarget(value: string) {
  return value
    .replace(/\b(hoje|amanha|amanhã|cartao|cartão|preco|preço|valor|custa|agendar)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function catalogConfirms(target: string | undefined, catalogSummary: ConversationCatalogSummary | undefined, kind: "service" | "professional" | "product") {
  if (!target) return false
  const targetWords = compact(target).split(/\s+/).filter((word) => word.length > 2)
  if (!targetWords.length) return false

  const items = kind === "service"
    ? catalogSummary?.services ?? []
    : kind === "professional"
      ? catalogSummary?.professionals ?? []
      : catalogSummary?.products ?? []

  return items.some((item) => {
    const haystack = compact(`${item.name} ${item.detail ?? ""}`)
    return targetWords.every((word) => haystack.includes(word))
  })
}

export function deriveOperationalIntent({
  userMessage,
  memory,
  catalogSummary,
}: {
  userMessage: string
  memory?: ConversationMemory
  catalogSummary?: ConversationCatalogSummary
}): OperationalIntentResult {
  const normalized = compact(userMessage)
  const vertical = inferVertical(userMessage, memory)

  if (hasAny(normalized, ["jogo", "joga hoje", "quem joga", "futebol", "copa", "noticia", "notícia", "clima", "chuva", "netflix", "filme", "temperatura"])) {
    return { type: "none", vertical, tool: "answer_from_reasoning", confirmedByCatalog: false, confidence: 0, reason: "pergunta geral não operacional" }
  }

  let type: OperationalIntentType = "none"
  let itemKind: OperationalIntentResult["itemKind"]
  let tool: UniversalToolName = "answer_from_reasoning"

  if (hasAny(normalized, ["aceita cartao", "aceita cartão", "passa cartao", "passa cartão", "pix", "forma de pagamento", "convenio", "convênio"])) {
    type = "payment_question"
    itemKind = "payment"
    tool = "catalog"
  } else if (hasAny(normalized, ["entrega hoje", "faz entrega", "entrega", "delivery"])) {
    type = "delivery_question"
    itemKind = "delivery"
    tool = "product_lookup"
  } else if (hasAny(normalized, ["tem estoque", "tem em estoque", "em estoque", "pronta entrega", "tem pronta entrega", "tem meu numero", "tem meu número", "tem esse modelo", "disponivel em estoque", "disponível em estoque"])) {
    type = "product_stock_question"
    itemKind = "product"
    tool = "product_lookup"
  } else if (hasAny(normalized, ["tem reserva", "reservar mesa", "tem mesa", "mesa externa", "outra mesa"])) {
    type = "reservation_question"
    itemKind = "reservation"
    tool = "booking"
  } else if (hasAny(normalized, ["agenda de", "tem horario", "tem horário", "tem consulta", "tem hoje", "tem amanha", "tem amanhã", "que horas", "horario amanha", "horário amanhã"])) {
    type = "schedule_availability_question"
    itemKind = "schedule"
    tool = "schedule"
  } else if (hasAny(normalized, ["quanto custa", "qual preco", "qual preço", "preco", "preço", "valor", "custa"])) {
    type = "price_question"
    itemKind = "price"
    tool = "catalog"
  } else if (hasAny(normalized, ["posso agendar", "quero agendar", "posso marcar", "quero marcar", "posso reservar"])) {
    type = "booking_question"
    itemKind = "booking"
    tool = "booking"
  } else if (hasAny(normalized, ["tem profissional", "tem especialista", "tem professor", "tem barbeiro", "tem tosador", "quem atende", "profissional para", "especialista para"])) {
    type = "professional_availability_question"
    itemKind = "professional"
    tool = "professional_lookup"
  } else if (hasAny(normalized, ["tem outra opcao", "tem outra opção", "tem outro", "voces fazem", "vocês fazem", "voce faz", "você faz", "voces atendem", "vocês atendem", "atendem crianca", "atendem criança", "se o local atende", "local atende", "vocês têm", "voces tem", "vocês tem", "tem plano", "faz limpeza", "faz troca", "banho e tosa", "cortam", "corta"])) {
    type = "service_availability_question"
    itemKind = "service"
    tool = "service_lookup"
  }

  if (type === "none") {
    return { type, vertical, tool, confirmedByCatalog: false, confidence: 0, reason: "sem pergunta operacional clara" }
  }

  const target = extractTarget(userMessage, type) || memory?.lastEntityMentioned || memory?.lastOperationalTopic
  const confirmedByCatalog =
    itemKind === "service"
      ? catalogConfirms(target, catalogSummary, "service")
      : itemKind === "professional"
        ? catalogConfirms(target, catalogSummary, "professional")
        : itemKind === "product"
          ? catalogConfirms(target, catalogSummary, "product")
          : false

  return {
    type,
    target,
    vertical,
    itemKind,
    tool,
    confirmedByCatalog,
    confidence: 0.92,
    reason: "pergunta operacional explícita",
  }
}

export function operationalQuestionType(intent: OperationalIntentResult): QuestionContract["questionType"] {
  if (intent.type === "service_availability_question") return "yes_no_service_availability"
  if (intent.type === "professional_availability_question") return "yes_no_professional_availability"
  if (intent.type === "product_stock_question") return "yes_no_product_stock"
  if (intent.type === "reservation_question") return "yes_no_reservation"
  if (intent.type === "schedule_availability_question") return "yes_no_schedule_availability"
  if (intent.type === "price_question") return "price_lookup"
  if (intent.type === "payment_question") return "payment_lookup"
  if (intent.type === "delivery_question") return "delivery_lookup"
  if (intent.type === "booking_question") return "booking_intent"
  return "none"
}

export function buildOperationalFailClosedAnswer(intent: OperationalIntentResult, brandName: string) {
  const target = intent.target ? ` sobre ${intent.target}` : ""
  const catalogNoun = intent.vertical === "negócio" ? "catálogo disponível" : `catálogo disponível para ${intent.vertical}`

  if (intent.confirmedByCatalog && intent.type === "service_availability_question") {
    return `Sim, ${brandName} tem confirmação de ${intent.target ?? "esse serviço"} no catálogo disponível.`
  }

  if (intent.confirmedByCatalog && intent.type === "professional_availability_question") {
    return `Sim, ${brandName} tem confirmação de profissional para ${intent.target ?? "esse atendimento"} no catálogo disponível.`
  }

  if (intent.type === "service_availability_question") {
    return `Não há confirmação de serviço${target} no ${catalogNoun}. Antes de dizer que sim, precisa verificar com a equipe.`
  }

  if (intent.type === "professional_availability_question") {
    return `Não há confirmação de profissional${target} no ${catalogNoun}. Antes de prometer atendimento, precisa verificar com a equipe.`
  }

  if (intent.type === "product_stock_question") {
    return `Não há confirmação de estoque${target} no ${catalogNoun}. Posso tratar isso como consulta de disponibilidade, mas não vou prometer pronta entrega sem dado confirmado.`
  }

  if (intent.type === "reservation_question") {
    return `Não há confirmação de reserva ou mesa disponível no ${catalogNoun}. O próximo passo seguro é verificar disponibilidade antes de confirmar.`
  }

  if (intent.type === "schedule_availability_question") {
    return `Não há confirmação de horário disponível no ${catalogNoun}. Precisa consultar a agenda antes de dizer que tem hoje ou amanhã.`
  }

  if (intent.type === "price_question") {
    return `Não há preço confirmado${target} no ${catalogNoun}. Antes de cravar valor, precisa consultar o catálogo ou a equipe.`
  }

  if (intent.type === "payment_question") {
    return `Não há confirmação de forma de pagamento no ${catalogNoun}. Antes de afirmar que aceita cartão, precisa verificar com a equipe.`
  }

  if (intent.type === "delivery_question") {
    return `Não há confirmação de entrega no ${catalogNoun}. Antes de prometer entrega hoje, precisa verificar disponibilidade e região.`
  }

  if (intent.type === "booking_question") {
    return `Dá para tratar isso como intenção de agendamento, mas não há confirmação de horário disponível no ${catalogNoun}. O próximo passo seguro é consultar a agenda.`
  }

  return "Não há confirmação operacional suficiente para responder sim. Precisa verificar antes de prometer."
}
