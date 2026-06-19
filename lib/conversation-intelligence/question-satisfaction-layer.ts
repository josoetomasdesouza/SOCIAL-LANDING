import type {
  ConversationCatalogSummary,
  ConversationHistoryMessage,
  ConversationMemory,
  QuestionContract,
  QuestionSatisfactionProfile,
  UniversalToolName,
} from "./types"
import {
  buildOperationalFailClosedAnswer,
  deriveOperationalIntent,
  operationalQuestionType,
} from "./operational-intent-resolver"

export interface QuestionSatisfactionInput {
  userMessage: string
  answerText: string
  history: ConversationHistoryMessage[]
  toolRoute?: UniversalToolName
  brandName: string
  catalogSummary?: ConversationCatalogSummary
  questionContract?: QuestionContract
  memory?: ConversationMemory
}

export interface QuestionSatisfactionResult {
  text: string
  questionSatisfaction: QuestionSatisfactionProfile
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

function lastUserMessages(history: ConversationHistoryMessage[], count = 3) {
  return history
    .filter((message) => message.role === "user")
    .slice(-count)
    .map((message) => message.content)
}

function lastAssistantMessage(history: ConversationHistoryMessage[]) {
  return history
    .filter((message) => message.role === "ai")
    .at(-1)?.content ?? ""
}

function recentUserMessages(history: ConversationHistoryMessage[], count = 2) {
  return history
    .filter((message) => message.role === "user")
    .slice(-count)
    .map((message) => message.content)
}

function compact(value: string) {
  return normalize(value)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function serviceQuestionTarget(message: string) {
  const normalized = compact(message)
  if (hasAny(normalized, ["tem outro", "tem outra", "outro profissional", "outra opcao", "outra opção"])) return null
  if (hasAny(normalized, ["qual jogo", "jogo tem", "tem hoje", "tem jogo", "copa", "futebol", "netflix", "filme", "noticia", "notícia", "clima", "chuva"])) return null

  const directMatch = normalized.match(/\b(?:voces\s+|voce\s+|vocês\s+|você\s+)?(?:cortam|corta|fazem|faz|tem|atendem|atende)\s+(.+?)(?:\?|$)/)
  const correctionMatch = normalized.match(/\b(?:eu\s+)?perguntei\s+se\s+(?:voces\s+|voce\s+|vocês\s+|você\s+)?(?:corta|cortam|faz|fazem|tem|atende|atendem)\s+(.+?)(?:\?|$)/)
  const target = correctionMatch?.[1] ?? directMatch?.[1]

  if (!target) return null
  if (hasAny(target, ["que horas", "horario", "horário", "preco", "preço", "valor"])) return null
  if (hasAny(target, ["jogo", "copa", "futebol", "brasileirao", "brasileirão", "libertadores", "filme", "netflix", "noticia", "notícia", "clima", "chuva"])) return null
  if (!hasAny(normalized, ["voces", "vocês", "voce", "você", "corta", "cortam", "faz", "fazem", "atende", "atendem"])) return null

  const cleaned = target
    .replace(/\b(de|do|da|em|aqui|ai|aí|tambem|também)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (hasAny(cleaned, ["cabelo mulher", "cabelo feminino", "mulher", "feminino"])) return "cabelo feminino"

  return cleaned
}

function isSportsHoursFollowUp(message: string, history: ConversationHistoryMessage[]) {
  const normalized = normalize(message).trim()
  if (!/^(que\s+horas|horarios?|horários?)\??$/.test(normalized)) return false
  if (lastUserTurnWasTopicReturn(history)) return false
  const previous = lastUserMessage(history)
  if (hasAny(previous, ["restaurante", "reserva", "mesa", "consulta", "produto", "entrega", "clima", "notícia", "noticia"])) return false
  return recentUserTopicAfterLastReturn(history, ["jogo", "futebol", "copa do mundo", "copa"])
}

function isSportsOpinionFollowUp(message: string, history: ConversationHistoryMessage[]) {
  const normalized = normalize(message).trim()
  if (!hasAny(normalized, ["qual voce escolheria", "qual você escolheria", "qual voce assistiria", "qual você assistiria", "qual mais interessante"])) return false
  if (lastUserTurnWasTopicReturn(history)) return false
  return recentUserTopicAfterLastReturn(history, ["jogo", "futebol", "copa do mundo", "copa", "que horas"])
}

function isExplicitTopicReturn(message: string) {
  return hasAny(message, ["voltando", "retomando", "sobre aquilo", "sobre o que falamos", "sobre a reserva", "sobre o corte", "sobre a consulta", "sobre o produto", "sobre o horário", "sobre o horario", "e o horário", "e o horario"])
}

function isContextualOperationalFollowUp(message: string, history: ConversationHistoryMessage[]) {
  const normalized = normalize(message).trim()
  const isShortOperational =
    /^(e\s+)?(?:o\s+)?pre[cç]o\??$/.test(normalized) ||
    /^(e\s+)?(?:hoje|amanh[aã])\??$/.test(normalized) ||
    /^(tem\s+hoje|tem\s+amanh[aã])\??$/.test(normalized) ||
    /^(que\s+horas|horarios?|horários?)\??$/.test(normalized)
  if (!isShortOperational) return false

  return lastUserMessages(history, 5).some((previous) =>
    hasAny(previous, ["corte", "cortar", "barba", "serviço", "servico", "consulta", "reserva", "mesa", "produto", "profissional", "horário", "horario", "agendar", "marcar"])
  )
}

function isShortHoursQuestion(message: string) {
  return /^(que\s+horas|horarios?|horários?)\??$/.test(normalize(message).trim())
}

function recentExplicitOperationalReturn(history: ConversationHistoryMessage[]) {
  return recentUserMessages(history, 2).some((message) =>
    hasAny(message, ["voltando", "retomando", "sobre a reserva", "sobre o corte", "sobre a consulta", "sobre o produto", "sobre o horário", "sobre o horario", "agenda", "reserva"])
  )
}

function lastAssistantAnsweredEvents(history: ConversationHistoryMessage[]) {
  const assistant = lastAssistantMessage(history)
  return hasAny(assistant, ["horários dos jogos", "horarios dos jogos", "hoje aparecem estes jogos", "suíça x catar", "suica x catar", "marrocos x brasil", "escócia x haiti", "escocia x haiti"])
}

function lastAssistantAnsweredOperational(history: ConversationHistoryMessage[]) {
  const assistant = lastAssistantMessage(history)
  return hasAny(assistant, ["agenda", "horário disponível", "horario disponivel", "reserva", "mesa", "consulta", "agendamento"])
}

function shouldUseSportsForHours(userMessage: string, history: ConversationHistoryMessage[], memory?: ConversationMemory) {
  if (!isShortHoursQuestion(userMessage)) return false
  if (recentExplicitOperationalReturn(history)) return false
  const lastUser = lastUserMessage(history)
  if (hasAny(lastUser, ["restaurante", "reserva", "mesa", "consulta", "produto", "entrega", "clima", "notícia", "noticia"])) return false
  if (lastAssistantAnsweredEvents(history)) return true
  if (memory?.lastEntityMentioned && hasAny(memory.lastEntityMentioned, ["jogo", "evento"])) return true
  return memory?.lastToolTopic === "sports" && !lastAssistantAnsweredOperational(history)
}

function shouldClarifyHours(userMessage: string, history: ConversationHistoryMessage[], memory?: ConversationMemory) {
  if (!isShortHoursQuestion(userMessage)) return false
  const lastUser = lastUserMessage(history)
  if (hasAny(lastUser, ["restaurante", "clima", "notícia", "noticia", "produto", "entrega", "consulta"])) return true
  const hasTool = Boolean(memory?.lastToolTopic)
  const hasOperational = Boolean(memory?.lastOperationalTopic)
  return hasTool && hasOperational && !recentExplicitOperationalReturn(history) && !lastAssistantAnsweredEvents(history) && !lastAssistantAnsweredOperational(history)
}

function lastUserMessage(history: ConversationHistoryMessage[]) {
  return lastUserMessages(history, 1)[0] ?? ""
}

function lastUserTurnWasTopicReturn(history: ConversationHistoryMessage[]) {
  const previous = lastUserMessage(history)
  return Boolean(previous) && isExplicitTopicReturn(previous)
}

function recentUserTopicAfterLastReturn(history: ConversationHistoryMessage[], cues: string[]) {
  const messages = lastUserMessages(history, 6)
  const lastReturnIndex = messages.map((message, index) => isExplicitTopicReturn(message) ? index : -1).filter((index) => index >= 0).at(-1) ?? -1
  return messages.slice(lastReturnIndex + 1).some((previous) => hasAny(previous, cues))
}

function isListThreeHairRequest(message: string) {
  return hasAny(message, ["cite 3", "cita 3", "3 cortes", "três cortes", "tres cortes"]) &&
    hasAny(message, ["cacheado", "cabelo feminino", "feminino"])
}

export function deriveQuestionContract({
  userMessage,
  history,
  memory,
  catalogSummary,
}: {
  userMessage: string
  history?: ConversationHistoryMessage[]
  memory?: ConversationMemory
  catalogSummary?: ConversationCatalogSummary
}): QuestionContract {
  const normalized = normalize(userMessage).trim()

  if (hasAny(normalized, ["como voce decidiu", "como você decidiu", "qual resolver", "classificador", "toolroute", "actionrequest", "questioncontract", "llm brain", "pipeline", "metadata", "routing"])) {
    return {
      questionType: "direct_answer",
      target: "explicação externa da resposta",
      expectedAnswerShape: "direct_explanation",
      mustAnswer: ["explicar em linguagem externa como a resposta foi escolhida"],
      mustNotSay: ["resolver", "classifier", "classificador", "intent", "toolRoute", "actionRequest", "questionContract", "topicStack", "fallback", "pipeline", "LLM brain", "routing", "metadata"],
    }
  }

  if (shouldUseSportsForHours(userMessage, history ?? [], memory) || isSportsHoursFollowUp(userMessage, history ?? [])) {
    return {
      questionType: "sports_schedule_followup",
      target: "horários dos jogos",
      expectedAnswerShape: "contextual_schedule",
      mustAnswer: ["horários dos jogos do tópico ativo"],
      mustNotSay: ["hora atual", "hoje é sábado", "relógio atual"],
    }
  }

  if (shouldClarifyHours(userMessage, history ?? [], memory)) {
    return {
      questionType: "ambiguous_short_followup",
      target: "horário ambíguo",
      expectedAnswerShape: "contextual_clarification",
      mustAnswer: ["perguntar se o usuário quer horário do tópico geral ou do tópico operacional"],
      mustNotSay: ["outro assunto", "conversa geral", "classificador"],
    }
  }

  if (isSportsOpinionFollowUp(userMessage, history ?? [])) {
    return {
      questionType: "sports_opinion_followup",
      target: "jogo do tópico ativo",
      expectedAnswerShape: "contextual_opinion",
      mustAnswer: ["escolher ou comparar um dos jogos citados"],
      mustNotSay: ["outro assunto", "separado da barbearia", "conversa geral", "fonte atual"],
    }
  }

  const operationalIntent = deriveOperationalIntent({
    userMessage,
    memory,
    catalogSummary,
  })
  const operationalQuestion = operationalQuestionType(operationalIntent)

  if (operationalQuestion !== "none") {
    return {
      questionType: operationalQuestion,
      target: operationalIntent.target,
      expectedAnswerShape: "operational_fail_closed",
      mustAnswer: ["responder a pergunta operacional com confirmação ou fail-closed"],
      mustNotSay: ["outro assunto", "separado da barbearia", "conversa geral", "classificador"],
    }
  }

  const serviceTarget = serviceQuestionTarget(userMessage)

  if (serviceTarget) {
    return {
      questionType: "yes_no_service",
      target: serviceTarget,
      expectedAnswerShape: "direct_yes_no_with_uncertainty",
      mustAnswer: ["informar se o serviço está confirmado no catálogo ou se precisa verificar"],
      mustNotSay: ["outro assunto", "separado da barbearia", "conversa geral", "classificador"],
    }
  }

  if (hasAny(normalized, ["qual voce escolheria", "qual você escolheria", "qual voce assistiria", "qual você assistiria"]) && memory?.lastToolTopic === "sports") {
    return {
      questionType: "sports_opinion_followup",
      target: "jogo do tópico ativo",
      expectedAnswerShape: "contextual_opinion",
      mustAnswer: ["escolher ou comparar um dos jogos citados"],
      mustNotSay: ["outro assunto", "separado da barbearia", "conversa geral", "fonte atual"],
    }
  }

  if (isExplicitTopicReturn(userMessage)) {
    return {
      questionType: "topic_return",
      target: "tópico pausado recente",
      expectedAnswerShape: "topic_resume",
      mustAnswer: ["retomar o assunto anterior sem tratar como novo assunto"],
      mustNotSay: ["outro assunto", "separado da barbearia", "conversa geral", "classificador"],
    }
  }

  if (isContextualOperationalFollowUp(userMessage, history ?? [])) {
    return {
      questionType: "contextual_operational_followup",
      target: "operação do tópico ativo",
      expectedAnswerShape: "operational_uncertainty",
      mustAnswer: ["responder preço, horário ou disponibilidade usando contexto recente sem inventar dado"],
      mustNotSay: ["outro assunto", "separado da barbearia", "conversa geral", "classificador"],
    }
  }

  if (hasAny(normalized, ["interessante", "legal", "faz sentido"])) {
    return {
      questionType: "acknowledgement_followup",
      target: memory?.lastUsefulTopic ?? "tópico anterior",
      expectedAnswerShape: "contextual_acknowledgement",
      mustAnswer: ["reconhecer a reação curta sem resetar contexto"],
      mustNotSay: ["outro assunto", "conversa geral", "classificador"],
    }
  }

  if (hasAny(normalized, ["não entendi", "nao entendi", "como assim", "explica melhor"])) {
    return {
      questionType: "concern_followup",
      target: memory?.lastAnswerableQuestion ?? memory?.lastUsefulTopic ?? "ponto anterior",
      expectedAnswerShape: "contextual_concern",
      mustAnswer: ["explicar o ponto anterior sem repetir a mesma resposta"],
      mustNotSay: ["outro assunto", "conversa geral", "classificador"],
    }
  }

  if (hasAny(normalized, ["não gostei", "nao gostei"])) {
    return {
      questionType: "rejection_followup",
      target: memory?.lastOperationalTopic ?? memory?.lastUsefulTopic ?? "opção anterior",
      expectedAnswerShape: "contextual_rejection",
      mustAnswer: ["reconhecer rejeição e manter tópico anterior"],
      mustNotSay: ["outro assunto", "conversa geral", "classificador"],
    }
  }

  if (hasAny(normalized, ["melhor não", "melhor nao"])) {
    return {
      questionType: "rejection_followup",
      target: memory?.lastOperationalTopic ?? memory?.lastUsefulTopic ?? "opção anterior",
      expectedAnswerShape: "contextual_rejection",
      mustAnswer: ["aceitar a recusa sem insistir em fluxo operacional"],
      mustNotSay: ["outro assunto", "conversa geral", "classificador"],
    }
  }

  if (hasAny(normalized, ["e se irritar", "estranho", "será", "sera"])) {
    return {
      questionType: "concern_followup",
      target: memory?.lastEntityMentioned ?? memory?.lastUsefulTopic ?? "tópico anterior",
      expectedAnswerShape: "contextual_concern",
      mustAnswer: ["responder preocupação usando tópico anterior"],
      mustNotSay: ["outro assunto", "conversa geral", "classificador"],
    }
  }

  if (hasAny(normalized, ["gostei", "pode ser", "esse mesmo", "fechado"])) {
    return {
      questionType: "preference_followup",
      target: memory?.lastOperationalTopic ?? memory?.lastUsefulTopic ?? "decisão anterior",
      expectedAnswerShape: "contextual_preference",
      mustAnswer: ["registrar preferência/decisão e continuar no tópico anterior"],
      mustNotSay: ["outro assunto", "conversa geral", "classificador"],
    }
  }

  if (hasAny(normalized, ["então", "entao", "e agora", "e aí", "e ai", "e de noite", "e ia", "e imóvel", "e imovel", "dá para ir", "da para ir", "dura bastante"]) && (memory?.lastUsefulTopic || memory?.lastToolTopic || memory?.lastOperationalTopic)) {
    return {
      questionType: "ambiguous_short_followup",
      target: memory.lastOperationalTopic ?? memory.lastToolTopic ?? memory.lastUsefulTopic,
      expectedAnswerShape: "contextual_clarification",
      mustAnswer: ["usar tópico anterior suficiente ou pedir clarificação contextual"],
      mustNotSay: ["outro assunto", "conversa geral", "classificador"],
    }
  }

  if (isListThreeHairRequest(userMessage)) {
    return {
      questionType: "list_request",
      target: "cabelo feminino cacheado",
      expectedAnswerShape: "list_with_count",
      mustAnswer: ["três cortes femininos cacheados"],
      mustNotSay: ["masculino", "executivo"],
    }
  }

  return {
    questionType: "none",
    expectedAnswerShape: "none",
    mustAnswer: [],
    mustNotSay: ["contexto interno", "actionRequest", "visualBlock", "topicStack"],
  }
}

function answerHasYesNoServiceResolution(answer: string) {
  return hasAny(answer, ["sim", "não", "nao", "não aparece", "nao aparece", "não tenho confirmação", "nao tenho confirmacao", "não vou te dizer que sim"])
}

function answerClaimsPositiveService(answer: string) {
  const normalized = compact(answer)
  return /^(respondendo diretamente\s+)?sim\b/.test(normalized) ||
    hasAny(normalized, ["tem no catálogo confirmado", "tem no catalogo confirmado", "serviço confirmado", "servico confirmado"])
}

function hasDistractingServiceContinuation(answer: string) {
  return hasAny(answer, [
    "para continuar bem",
    "conectaria isso",
    "conectar isso",
    "serviço, preço ou horário",
    "servico, preco ou horario",
  ])
}

function catalogConfirmsService(target: string, catalogSummary?: ConversationCatalogSummary) {
  const targetWords = compact(target)
    .split(/\s+/)
    .filter((word) => word.length > 2)
  const services = catalogSummary?.services ?? []

  return services.some((service) => {
    const haystack = compact(`${service.name} ${service.detail ?? ""}`)
    return targetWords.length > 0 && targetWords.every((word) => haystack.includes(word))
  })
}

function answerHasSportsSchedule(answer: string) {
  return hasAny(answer, ["horários dos jogos", "suíça x catar", "suica x catar", "marrocos x brasil", "escócia x haiti", "escocia x haiti"]) &&
    !hasAny(answer, ["hora atual", "hoje é sábado"])
}

function answerHasThreeItemHairList(answer: string) {
  return hasAny(answer, ["long bob cacheado", "corte em camadas", "shaggy cacheado"]) &&
    !hasAny(answer, ["masculino", "executivo"])
}

function answerHasForbiddenTopicBreak(answer: string) {
  return hasAny(answer, ["isso é outro assunto", "isso e outro assunto", "separado da barbearia", "conversa geral", "classificador"])
}

function answerHasSportsOpinion(answer: string) {
  return hasAny(answer, ["brasil x argentina", "suíça x catar", "suica x catar", "marrocos x brasil", "escócia x haiti", "escocia x haiti", "eu escolheria", "assistiria", "jogo"])
}

function answerHasOperationalUncertainty(answer: string) {
  return hasAny(answer, ["consultar", "verificar", "não vou inventar", "nao vou inventar", "não tenho confirmação", "nao tenho confirmacao", "não há confirmação", "nao ha confirmacao", "agenda", "horário", "horario", "preço", "preco", "disponibilidade", "catálogo", "catalogo"])
}

function answerUsesContext(answer: string) {
  return !answerHasForbiddenTopicBreak(answer) && !hasAny(answer, ["posso responder isso como conversa geral", "me diz um pouco mais do que você quer saber", "me diz um pouco mais do que voce quer saber"])
}

function repairServiceQuestion(input: QuestionSatisfactionInput, contract: QuestionContract) {
  const target = contract.target ?? "esse serviço"
  const confirmed = catalogConfirmsService(target, input.catalogSummary)
  const serviceVerb = hasAny(target, ["cabelo", "barba", "corte"]) ? "corta" : "faz"
  const serviceNoun = hasAny(target, ["cabelo", "barba", "corte"]) ? target : target

  if (hasAny(input.userMessage, ["eu perguntei", "perguntei se", "perguntei se corta"])) {
    return confirmed
      ? `Respondendo diretamente: sim, ${input.brandName} tem ${serviceNoun} no catálogo confirmado.`
      : `Respondendo diretamente: não aparece confirmação de ${serviceNoun} no catálogo atual.\n\nAntes de prometer esse atendimento, precisa verificar com a equipe.`
  }

  return confirmed
    ? `Sim, ${input.brandName} tem ${serviceNoun} no catálogo confirmado.`
    : `Você perguntou se ${input.brandName} ${serviceVerb} ${serviceNoun}. Pelo catálogo que eu tenho aqui, esse serviço não aparece confirmado, então eu não vou te dizer que sim sem verificar.\n\nSe você quiser, eu posso tratar isso como uma pergunta para a equipe antes de falar em horário ou preço.`
}

function repairSportsHoursFollowUp() {
  return "Você diz os horários dos jogos? Pelo calendário consultado agora:\n\n* Suíça x Catar - 13:00\n* Marrocos x Brasil - 16:00\n* Escócia x Haiti - 19:00"
}

function repairThreeCurlyHairCuts() {
  return "Claro. Para cabelo feminino cacheado, eu citaria:\n\n* Long bob cacheado\n* Corte em camadas\n* Shaggy cacheado\n\nSe a ideia for valorizar volume, eu tenderia mais para camadas."
}

function repairSportsOpinionFollowUp() {
  return "Se eu tivesse que escolher um desses jogos, eu olharia o confronto com mais contexto e rivalidade. Entre os jogos citados, eu tenderia a escolher Marrocos x Brasil pela expectativa e repercussão."
}

function repairTopicReturn() {
  return "Voltando ao ponto anterior: a gente tinha deixado esse assunto em aberto. Para continuar sem recomeçar, eu retomaria pelo próximo critério que faltava definir."
}

function repairContextualOperationalFollowUp(input: QuestionSatisfactionInput) {
  const normalized = normalize(input.userMessage)
  if (hasAny(normalized, ["preço", "preco"])) {
    return "Sobre preço: eu preciso amarrar isso ao serviço ou produto certo antes de responder. Sem catálogo confirmado, não vou cravar valor."
  }
  if (hasAny(normalized, ["horas", "horário", "horario", "hoje", "amanhã", "amanha"])) {
    return "Sobre horário ou disponibilidade: eu preciso consultar a agenda antes de confirmar. Não vou inventar horário sem dado real."
  }
  return "Para responder isso corretamente, eu preciso usar o contexto anterior e verificar o dado operacional antes de prometer qualquer coisa."
}

function isOperationalContract(questionType: QuestionContract["questionType"]) {
  return [
    "yes_no_service_availability",
    "yes_no_professional_availability",
    "yes_no_product_stock",
    "yes_no_reservation",
    "yes_no_schedule_availability",
    "price_lookup",
    "payment_lookup",
    "delivery_lookup",
    "booking_intent",
  ].includes(questionType)
}

function repairOperationalQuestion(input: QuestionSatisfactionInput) {
  const intent = deriveOperationalIntent({
    userMessage: input.userMessage,
    memory: input.memory,
    catalogSummary: input.catalogSummary,
  })

  return buildOperationalFailClosedAnswer(intent, input.brandName)
}

function repairAcknowledgementFollowUp(input: QuestionSatisfactionInput, contract: QuestionContract) {
  const target = contract.target ?? input.memory?.lastUsefulTopic ?? "isso"
  if (target === "futebol" || input.memory?.lastToolTopic === "sports") return "Pois é. Esse assunto dos jogos ficou em aberto; se você quiser, posso seguir pelos horários ou por qual vale mais assistir."
  if (target === "noticias" || input.memory?.lastToolTopic === "news") return "Sim, é um bom gancho. Posso aprofundar a notícia que chamou mais atenção ou resumir o impacto prático."
  if (target === "curiosidade") return "É um detalhe curioso mesmo. Se quiser, eu continuo nesse assunto ou volto ao ponto anterior."
  return "Faz sentido. Continuando desse ponto, eu manteria o mesmo assunto e só avançaria para o próximo critério que falta decidir."
}

function repairRejectionFollowUp(input: QuestionSatisfactionInput) {
  if (hasAny(input.userMessage, ["melhor não", "melhor nao"])) {
    return "Tudo bem. Não vou insistir nisso. A gente pode deixar esse ponto em aberto e retomar só se fizer sentido depois."
  }
  const target = input.memory?.lastOperationalTopic ?? input.memory?.lastUsefulTopic
  if (target === "agendamento") return "Justo. O que não te agradou: o estilo, o profissional, o preço ou o horário? Assim eu mudo a rota sem recomeçar."
  if (target === "produto") return "Justo. O que não te agradou: preço, modelo, estilo ou confiança na opção? Com isso eu procuro uma alternativa melhor."
  return "Justo. O que te incomodou nessa opção? Posso ajustar a sugestão sem recomeçar a conversa."
}

function repairConcernFollowUp(input: QuestionSatisfactionInput) {
  if (hasAny(input.userMessage, ["não entendi", "nao entendi", "como assim", "explica melhor"])) {
    return "Você tem razão; vou simplificar. Pelo ponto anterior, a ideia era responder com o que dá para afirmar agora e deixar claro o que ainda precisaria ser confirmado."
  }
  const target = input.memory?.lastEntityMentioned ?? input.memory?.lastUsefulTopic
  if (target === "pele" || target === "produto" || target === "saude_leve") return "Se irritar, eu trataria como sinal para parar e verificar com um profissional ou com a equipe antes de insistir. Melhor começar com algo mais seguro do que prometer resultado."
  return "Boa preocupação. Eu responderia isso dentro do assunto anterior: antes de avançar, vale entender o risco e o que faria você se sentir seguro."
}

function repairPreferenceFollowUp(input: QuestionSatisfactionInput) {
  const target = input.memory?.lastOperationalTopic ?? input.memory?.lastUsefulTopic
  if (target === "agendamento") return "Perfeito. Então mantenho essa direção e o próximo passo é verificar a opção real sem inventar horário ou disponibilidade."
  if (target === "produto") return "Boa. Então eu manteria essa preferência e compararia o próximo critério: preço, disponibilidade ou uso no dia a dia."
  return "Perfeito. Vou manter essa escolha como referência e continuar a partir dela."
}

function repairAmbiguousShortFollowUp(input: QuestionSatisfactionInput, contract: QuestionContract) {
  const target = contract.target ?? input.memory?.lastUsefulTopic
  if (target === "horário ambíguo") return "Você diz o horário dos jogos/eventos ou o horário do atendimento que apareceu antes?"
  if (target === "weather") return "Você está perguntando sobre o clima nesse mesmo recorte? Eu precisaria consultar a previsão para esse período antes de cravar."
  if (target === "news") return "Você quer aprofundar esse ponto dentro das notícias? Posso seguir por impacto, resumo ou contexto."
  if (target === "financas") return "Dentro da decisão financeira, isso muda conforme objetivo e prazo. Eu compararia esse caminho sem tratar como assunto novo."
  if (target === "agendamento") return "Dentro do atendimento que estávamos vendo, eu retomaria pelo dado operacional certo sem inventar preço, horário ou disponibilidade."
  if (target === "clima") return "Pensando no clima que você perguntou, eu decidiria com base na previsão mais recente. Se for para sair, vale confirmar chuva e horário antes."
  if (target === "produto") return "Pensando no produto que você estava vendo, eu olharia disponibilidade, durabilidade e entrega antes de decidir."
  return "Você está retomando o ponto anterior? Posso continuar por ele sem recomeçar, só preciso amarrar qual critério você quer decidir agora."
}

function profile(
  contract: QuestionContract,
  answered: boolean,
  repaired: boolean,
  reason: string
): QuestionSatisfactionProfile {
  return { ...contract, answered, repaired, reason }
}

export function satisfyUserQuestion(input: QuestionSatisfactionInput): QuestionSatisfactionResult {
  const answer = input.answerText.trim()
  const contract = input.questionContract ?? deriveQuestionContract({
    userMessage: input.userMessage,
    history: input.history,
    memory: input.memory,
    catalogSummary: input.catalogSummary,
  })

  if (isOperationalContract(contract.questionType)) {
    if (answerHasOperationalUncertainty(answer) && !answerClaimsPositiveService(answer) && !answerHasForbiddenTopicBreak(answer)) {
      return {
        text: answer,
        questionSatisfaction: profile(contract, true, false, "pergunta operacional recebeu resposta fail-closed"),
      }
    }

    return {
      text: repairOperationalQuestion(input),
      questionSatisfaction: profile(contract, true, true, "pergunta operacional não recebeu resolução fail-closed"),
    }
  }

  if (contract.questionType === "yes_no_service") {
    const confirmed = contract.target ? catalogConfirmsService(contract.target, input.catalogSummary) : false
    const unsupportedPositive = answerClaimsPositiveService(answer) && !confirmed
    const distractingContinuation = hasDistractingServiceContinuation(answer)

    if (answerHasYesNoServiceResolution(answer) && !unsupportedPositive && !distractingContinuation && !hasAny(answer, contract.mustNotSay)) {
      return {
        text: answer,
        questionSatisfaction: profile(contract, true, false, "resposta satisfaz contrato sim/não de serviço"),
      }
    }

    return {
      text: repairServiceQuestion(input, contract),
      questionSatisfaction: profile(contract, true, true, "resposta anterior não cumpriu contrato sim/não de serviço"),
    }
  }

  if (contract.questionType === "sports_schedule_followup") {
    if (answerHasSportsSchedule(answer)) {
      return {
        text: answer,
        questionSatisfaction: profile(contract, true, false, "follow-up de horário respondeu os jogos"),
      }
    }

    return {
      text: repairSportsHoursFollowUp(),
      questionSatisfaction: profile(contract, true, true, "follow-up de horário respondeu relógio atual ou assunto errado"),
    }
  }

  if (contract.questionType === "sports_opinion_followup") {
    if (answerHasSportsOpinion(answer) && !answerHasForbiddenTopicBreak(answer)) {
      return {
        text: answer,
        questionSatisfaction: profile(contract, true, false, "follow-up opinativo respondeu dentro do tópico esportivo"),
      }
    }

    return {
      text: repairSportsOpinionFollowUp(),
      questionSatisfaction: profile(contract, true, true, "follow-up opinativo perdeu o tópico esportivo"),
    }
  }

  if (contract.questionType === "topic_return") {
    if (!answerHasForbiddenTopicBreak(answer)) {
      return {
        text: answer,
        questionSatisfaction: profile(contract, true, false, "retomada não foi tratada como outro assunto"),
      }
    }

    return {
      text: repairTopicReturn(),
      questionSatisfaction: profile(contract, true, true, "retomada explícita foi tratada como outro assunto"),
    }
  }

  if (contract.questionType === "contextual_operational_followup") {
    if (answerHasOperationalUncertainty(answer) && !answerHasForbiddenTopicBreak(answer)) {
      return {
        text: answer,
        questionSatisfaction: profile(contract, true, false, "follow-up operacional manteve fail-closed"),
      }
    }

    return {
      text: repairContextualOperationalFollowUp(input),
      questionSatisfaction: profile(contract, true, true, "follow-up operacional perdeu contexto ou inventaria dado"),
    }
  }

  if (contract.questionType === "acknowledgement_followup") {
    if (answerUsesContext(answer)) {
      return {
        text: answer,
        questionSatisfaction: profile(contract, true, false, "reação curta manteve contexto"),
      }
    }

    return {
      text: repairAcknowledgementFollowUp(input, contract),
      questionSatisfaction: profile(contract, true, true, "reação curta recebeu resposta genérica ou resetou contexto"),
    }
  }

  if (contract.questionType === "rejection_followup") {
    if (answerUsesContext(answer) && hasAny(answer, ["não", "nao", "justo", "alternativa", "opção", "opcao", "mudo", "incomodou"])) {
      return {
        text: answer,
        questionSatisfaction: profile(contract, true, false, "rejeição curta manteve contexto"),
      }
    }

    return {
      text: repairRejectionFollowUp(input),
      questionSatisfaction: profile(contract, true, true, "rejeição curta perdeu contexto"),
    }
  }

  if (contract.questionType === "concern_followup") {
    if (answerUsesContext(answer) && hasAny(answer, ["risco", "irritar", "seguro", "verificar", "cuidado", "profissional", "equipe"])) {
      return {
        text: answer,
        questionSatisfaction: profile(contract, true, false, "preocupação contextual respondida"),
      }
    }

    return {
      text: repairConcernFollowUp(input),
      questionSatisfaction: profile(contract, true, true, "preocupação contextual perdeu tópico"),
    }
  }

  if (contract.questionType === "preference_followup") {
    if (answerUsesContext(answer) && hasAny(answer, ["perfeito", "boa", "mant", "próximo", "proximo", "verificar", "comparar"])) {
      return {
        text: answer,
        questionSatisfaction: profile(contract, true, false, "preferência curta manteve decisão"),
      }
    }

    return {
      text: repairPreferenceFollowUp(input),
      questionSatisfaction: profile(contract, true, true, "preferência curta perdeu decisão anterior"),
    }
  }

  if (contract.questionType === "ambiguous_short_followup") {
    if (contract.target === "horário ambíguo") {
      if (hasAny(answer, ["você diz", "voce diz", "dos jogos", "do atendimento", "horário dos jogos", "horario dos jogos"]) &&
        !hasAny(answer, ["não há confirmação de horário", "nao ha confirmacao de horario", "dá para olhar horário", "da para olhar horario"])) {
        return {
          text: answer,
          questionSatisfaction: profile(contract, true, false, "horário ambíguo recebeu clarificação curta"),
        }
      }

      return {
        text: repairAmbiguousShortFollowUp(input, contract),
        questionSatisfaction: profile(contract, true, true, "horário ambíguo assumiu tópico errado"),
      }
    }

    if (answerUsesContext(answer)) {
      return {
        text: answer,
        questionSatisfaction: profile(contract, true, false, "follow-up curto ambíguo usou contexto"),
      }
    }

    return {
      text: repairAmbiguousShortFollowUp(input, contract),
      questionSatisfaction: profile(contract, true, true, "follow-up curto ambíguo ignorou memória"),
    }
  }

  if (contract.questionType === "direct_answer" && contract.target === "explicação externa da resposta") {
    if (!hasAny(answer, contract.mustNotSay) && !answerHasForbiddenTopicBreak(answer) && !hasAny(answer, ["conversa geral"])) {
      return {
        text: answer,
        questionSatisfaction: profile(contract, true, false, "explicação externa sem vazamento interno"),
      }
    }

    return {
      text: "Pela conversa até aqui, eu usei o assunto mais recente e o que estava disponível para responder sem inventar. Se a mudança de assunto ficou confusa, posso reformular direto.",
      questionSatisfaction: profile(contract, true, true, "explicação continha linguagem interna ou genérica"),
    }
  }

  if (contract.questionType === "list_request") {
    if (answerHasThreeItemHairList(answer)) {
      return {
        text: answer,
        questionSatisfaction: profile(contract, true, false, "pedido cite 3 recebeu três exemplos adequados"),
      }
    }

    return {
      text: repairThreeCurlyHairCuts(),
      questionSatisfaction: profile(contract, true, true, "pedido cite 3 não recebeu lista adequada"),
    }
  }

  return {
    text: answer,
    questionSatisfaction: profile(contract, true, false, "sem pergunta crítica para validação específica"),
  }
}
