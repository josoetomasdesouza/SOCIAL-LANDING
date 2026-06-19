import type { HumanMessageNatureResult } from "./message-nature-classifier"
import type { ConversationMemory, QuestionContract } from "./types"

export type ProgressDelta = "ADVANCES" | "NEUTRAL" | "BLOCKS"

export type RecoverableOperationalQuery =
  | "availability"
  | "price"
  | "payment_method"
  | "business_info"
  | "service_info"
  | "location"
  | "opening_hours"

export type MissingSlot =
  | "time_preference"
  | "service_type"
  | "payment_type"
  | "unit"
  | "professional"
  | "service_category"

export interface UserProgressDecision {
  applies: boolean
  text: string
  progressDelta: ProgressDelta
  queryType?: RecoverableOperationalQuery
  missingSlot?: MissingSlot
  smallestUsefulQuestion?: string
  reason: string
}

export interface UserProgressPreservationInput {
  userMessage: string
  failClosedText: string
  questionContract?: QuestionContract
  messageNature?: HumanMessageNatureResult
  memory?: ConversationMemory
  brandName: string
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function hasAny(value: string, cues: string[]) {
  const normalized = normalize(value)
  return cues.some((cue) => normalized.includes(normalize(cue)))
}

function blocksProgress(text: string) {
  return hasAny(text, [
    "não há confirmação",
    "nao ha confirmacao",
    "não tenho confirmação",
    "nao tenho confirmacao",
    "não há preço confirmado",
    "nao ha preco confirmado",
    "precisa consultar",
    "precisa verificar",
  ]) && !text.includes("?")
}

function contextText(input: UserProgressPreservationInput) {
  return [
    input.userMessage,
    input.memory?.conversationSummary,
    input.memory?.lastUserMessage,
    input.memory?.lastUsefulTopic,
    input.memory?.lastOperationalTopic,
    input.memory?.lastToolTopic,
    input.memory?.lastEntityMentioned,
  ].filter(Boolean).join(" ")
}

function hasRecentOperationalContext(input: UserProgressPreservationInput) {
  return hasAny(contextText(input), [
    "corte",
    "cortar",
    "barba",
    "serviço",
    "servico",
    "consulta",
    "reserva",
    "mesa",
    "produto",
    "profissional",
    "agendar",
    "marcar",
    "horário",
    "horario",
    "agenda",
  ])
}

function lastTurnWasRealtimeContext(input: UserProgressPreservationInput) {
  return hasAny(input.memory?.lastUserMessage ?? "", [
    "jogo",
    "futebol",
    "clima",
    "chuva",
    "notícia",
    "noticia",
    "tecnologia",
    "celular",
    "capital",
  ])
}

function isShortHoursFollowUp(message: string) {
  const normalized = normalize(message).trim()
  return /^(que\s+horas|e\s+o\s+horario|e\s+o\s+horário|sobre\s+o\s+horario|sobre\s+o\s+horário|horarios?|horários?)\??$/.test(normalized)
}

function isPlainShortHoursFollowUp(message: string) {
  const normalized = normalize(message).trim()
  return /^(que\s+horas|horarios?|horários?)\??$/.test(normalized)
}

function queryFromInput(input: UserProgressPreservationInput): RecoverableOperationalQuery | undefined {
  const message = normalize(input.userMessage)
  const questionType = input.questionContract?.questionType

  if (hasAny(message, ["quantas pessoas", "equipe", "trabalham ai", "trabalham aí", "funcionarios", "funcionários"])) return "business_info"
  if (hasAny(message, ["onde fica", "endereco", "endereço", "unidade"])) return "location"
  if (hasAny(message, ["que horas fecha", "horas fecha", "abre hoje", "funciona hoje"])) return "opening_hours"
  if (questionType === "yes_no_schedule_availability" || hasAny(message, ["tem horario", "tem horário", "tem vaga", "tem amanhã", "tem amanha", "tem sábado", "tem sabado", "horario amanha", "horário amanhã"])) return "availability"
  if (isShortHoursFollowUp(input.userMessage) && hasRecentOperationalContext(input) && !(isPlainShortHoursFollowUp(input.userMessage) && lastTurnWasRealtimeContext(input))) return "availability"
  if (questionType === "price_lookup" || hasAny(message, ["quanto custa", "preço", "preco", "valor"]) || (/^quanto\??$/.test(message) && hasRecentOperationalContext(input))) return "price"
  if (questionType === "payment_lookup" || hasAny(message, ["aceita cartao", "aceita cartão", "pix", "credito", "crédito", "debito", "débito"])) return "payment_method"
  if (questionType === "yes_no_service_availability" || hasAny(message, ["faz sobrancelha", "atende criança", "atende crianca", "faz barba", "faz corte", "quais serviços", "quais servicos"])) return "service_info"

  return undefined
}

function recoveryFor(queryType: RecoverableOperationalQuery, input: UserProgressPreservationInput): Pick<UserProgressDecision, "text" | "missingSlot" | "smallestUsefulQuestion"> {
  if (queryType === "availability") {
    const question = "Você prefere manhã, tarde ou noite?"
    return {
      text: `Posso verificar sem prometer disponibilidade ainda. ${question}`,
      missingSlot: "time_preference",
      smallestUsefulQuestion: question,
    }
  }

  if (queryType === "price") {
    const normalized = normalize(contextText(input))
    let question = "É para qual serviço?"
    if (hasAny(normalized, ["consulta", "limpeza de pele", "procedimento", "pele", "depilacao", "depilação"])) {
      question = "É consulta, procedimento específico ou avaliação inicial?"
    } else if (hasAny(normalized, ["restaurante", "mesa", "reserva", "jantar", "prato", "cardapio", "cardápio"])) {
      question = "É sobre reserva, prato ou consumo no local?"
    } else if (hasAny(normalized, ["produto", "estoque", "notebook", "celular", "presente"])) {
      question = "É sobre qual produto ou modelo?"
    } else if (hasAny(normalized, ["troca de oleo", "troca de óleo", "oleo", "óleo"])) {
      question = "É troca de óleo simples ou revisão com outros itens?"
    } else if (hasAny(normalized, ["corte", "barba"])) {
      question = "É corte masculino, infantil ou barba?"
    }
    return {
      text: `Para verificar o valor certo sem chutar: ${question}`,
      missingSlot: "service_type",
      smallestUsefulQuestion: question,
    }
  }

  if (queryType === "payment_method") {
    const question = "Você pretende pagar no crédito, débito ou Pix?"
    return {
      text: `Posso verificar a forma de pagamento antes de afirmar. ${question}`,
      missingSlot: "payment_type",
      smallestUsefulQuestion: question,
    }
  }

  if (queryType === "business_info") {
    const question = "Está falando desta unidade mesmo?"
    return {
      text: `Posso confirmar para você. ${question}`,
      missingSlot: "unit",
      smallestUsefulQuestion: question,
    }
  }

  if (queryType === "location") {
    const question = "Você quer o endereço desta unidade?"
    return {
      text: `Posso confirmar a localização certa antes de te orientar. ${question}`,
      missingSlot: "unit",
      smallestUsefulQuestion: question,
    }
  }

  if (queryType === "opening_hours") {
    const question = "Você quer saber o horário de hoje ou o funcionamento geral?"
    return {
      text: `${input.brandName} costuma funcionar de segunda a sábado, das 9h às 20h. ${question}`,
      missingSlot: "unit",
      smallestUsefulQuestion: question,
    }
  }

  const question = "Você está falando de corte, barba ou outro serviço?"
  return {
    text: `Posso verificar isso sem prometer antes da confirmação. ${question}`,
    missingSlot: "service_category",
    smallestUsefulQuestion: question,
  }
}

export function preserveUserProgress(input: UserProgressPreservationInput): UserProgressDecision {
  const queryType = queryFromInput(input)
  const blocked = blocksProgress(input.failClosedText)

  if (!queryType) {
    return {
      applies: false,
      text: input.failClosedText,
      progressDelta: blocked ? "BLOCKS" : "NEUTRAL",
      reason: "not_recoverable_operational_query",
    }
  }

  if (!blocked && queryType !== "business_info") {
    return {
      applies: false,
      text: input.failClosedText,
      progressDelta: "NEUTRAL",
      queryType,
      reason: "fail_closed_did_not_block",
    }
  }

  const recovery = recoveryFor(queryType, input)

  return {
    applies: true,
    text: recovery.text,
    progressDelta: "ADVANCES",
    queryType,
    missingSlot: recovery.missingSlot,
    smallestUsefulQuestion: recovery.smallestUsefulQuestion,
    reason: "recovered_blocked_fail_closed_with_smallest_useful_question",
  }
}
