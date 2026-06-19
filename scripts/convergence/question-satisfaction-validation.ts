import { strict as assert } from "node:assert"
import { satisfyUserQuestion } from "@/lib/conversation-intelligence/question-satisfaction-layer"
import { createConversationIntelligenceResolver } from "@/lib/conversation-intelligence/resolver-adapter"
import type { ConversationHistoryMessage, UniversalToolName } from "@/lib/conversation-intelligence/types"
import type { ConversationResponseResolver } from "@/lib/mock-data/conversational-search"

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function hasAny(text: string, cues: string[]) {
  const normalized = normalize(text)
  return cues.some((cue) => normalized.includes(normalize(cue)))
}

function assertNotClassificationAnswer(text: string, label: string) {
  assert(!hasAny(text, ["outro assunto", "separado da barbearia", "conversa geral", "contexto", "classificador"]), `${label}: respondeu ao classificador: ${text}`)
}

const toolProvider = (tool: UniversalToolName, input: { message: string }) => {
  const message = normalize(input.message)
  if (tool === "sports" && /que horas|horarios|horários/.test(message)) {
    return "Você diz os horários dos jogos? Pelo calendário consultado agora:\n\n* Suíça x Catar - 13:00\n* Marrocos x Brasil - 16:00\n* Escócia x Haiti - 19:00"
  }
  if (tool === "sports") {
    return "Hoje aparecem estes jogos:\n\n* Suíça x Catar\n* Marrocos x Brasil\n* Escócia x Haiti\n\nQuer que eu veja os horários também?"
  }
  if (tool === "answer_from_reasoning" && hasAny(message, ["cacheado", "cabelo feminino"])) {
    return "Claro. Para cabelo feminino cacheado, eu citaria:\n\n* Long bob cacheado\n* Corte em camadas\n* Shaggy cacheado\n\nSe a ideia for valorizar volume, eu tenderia mais para camadas."
  }
  if (tool === "time") return "Hoje é sábado, 13 de junho de 2026."
  return null
}

const baseResolver: ConversationResponseResolver = async () => ({
  text: "Isso é outro assunto, então melhor responder curto e direto.",
})

const resolver = createConversationIntelligenceResolver({
  brandName: "Barba Negra",
  baseResolver,
  actionResolver: baseResolver,
  toolProvider,
  catalogSummary: {
    services: [{ id: "corte", name: "Corte masculino", kind: "service" }],
    professionals: [{ id: "carlos", name: "Carlos Silva", kind: "professional" }],
  },
})

async function turn(message: string, history: ConversationHistoryMessage[]) {
  const result = await resolver({
    message,
    brandName: "Barba Negra",
    contextItems: [],
    history,
  })
  history.push({ role: "user", content: message })
  history.push({ role: "ai", content: result?.text ?? "", visualBlock: result?.visualBlock })
  return result
}

async function main() {
  const directFemaleRepair = satisfyUserQuestion({
    userMessage: "Vocês cortam cabelo feminino?",
    answerText: "Isso é outro assunto.",
    history: [{ role: "user", content: "cite 3 cortes de cabelo feminino cacheado" }],
    brandName: "Barba Negra",
  })
  assert(directFemaleRepair.questionSatisfaction.repaired, "direct: deveria reparar pergunta sim/não")
  assert.equal(directFemaleRepair.questionSatisfaction.expectedAnswerShape, "direct_yes_no_with_uncertainty")
  assert.equal(directFemaleRepair.questionSatisfaction.target, "cabelo feminino")
  assert(hasAny(directFemaleRepair.text, ["não aparece confirmado", "não vou te dizer que sim"]), `direct: não respondeu sim/não: ${directFemaleRepair.text}`)

  const unsupportedPositiveRepair = satisfyUserQuestion({
    userMessage: "vocês fazem barba?",
    answerText: "Sim, fazemos barba.",
    history: [],
    brandName: "Barba Negra",
    catalogSummary: {
      services: [{ id: "corte", name: "Corte masculino", kind: "service" }],
    },
  })
  assert(unsupportedPositiveRepair.questionSatisfaction.repaired, "direct: resposta positiva sem catálogo deveria ser bloqueada")
  assert(hasAny(unsupportedPositiveRepair.text, ["não tenho confirmação", "não vou te dizer que sim", "não aparece confirmado"]), `direct: não bloqueou positivo sem catálogo: ${unsupportedPositiveRepair.text}`)

  const confirmedService = satisfyUserQuestion({
    userMessage: "vocês fazem barba?",
    answerText: "Isso é outro assunto.",
    history: [],
    brandName: "Barba Negra",
    catalogSummary: {
      services: [{ id: "barba", name: "Barba", kind: "service" }],
    },
  })
  assert(confirmedService.questionSatisfaction.repaired, "direct: deveria reparar serviço confirmado")
  assert(hasAny(confirmedService.text, ["sim", "barba", "catálogo confirmado"]), `direct: não confirmou serviço existente: ${confirmedService.text}`)

  const alternativeFollowUp = satisfyUserQuestion({
    userMessage: "tem outro profissional?",
    answerText: "Posso procurar outro profissional para você.",
    history: [{ role: "user", content: "não gostei" }],
    brandName: "Barba Negra",
  })
  assert.equal(alternativeFollowUp.questionSatisfaction.questionType, "none", "direct: follow-up de alternativa não deve virar pergunta sim/não de serviço")

  const directSportsRepair = satisfyUserQuestion({
    userMessage: "que horas?",
    answerText: "São 17h02.",
    history: [{ role: "user", content: "qual jogo tem hoje da copa do mundo?" }],
    brandName: "Barba Negra",
  })
  assert(directSportsRepair.questionSatisfaction.repaired, "direct: deveria reparar horários de jogos")
  assert.equal(directSportsRepair.questionSatisfaction.expectedAnswerShape, "contextual_schedule")
  assert(hasAny(directSportsRepair.text, ["horários dos jogos", "Suíça x Catar"]), `direct: não respondeu horário dos jogos: ${directSportsRepair.text}`)

  const history: ConversationHistoryMessage[] = []
  const styles = await turn("cite 3 cortes de cabelo feminino cacheado", history)
  assert(styles?.text && hasAny(styles.text, ["Long bob cacheado", "Corte em camadas", "Shaggy cacheado"]), `resolver: cite 3 falhou: ${styles?.text}`)

  const serviceQuestion = await turn("vocês cortam cabelo feminino?", history)
  assert(serviceQuestion?.intelligence?.questionSatisfaction?.answered, "resolver: satisfaction ausente para cabelo feminino")
  assert.equal(serviceQuestion?.intelligence?.questionSatisfaction?.repaired, false, "resolver: contrato deveria orientar fallback antes do reparo final")
  assert(hasAny(serviceQuestion?.text ?? "", ["não aparece confirmado", "não vou te dizer que sim", "não tenho confirmação"]), `resolver: não respondeu se corta feminino: ${serviceQuestion?.text}`)
  assertNotClassificationAnswer(serviceQuestion?.text ?? "", "resolver feminino")

  const correction = await turn("eu perguntei se corta cabelo de mulher?", history)
  assert(correction?.intelligence?.questionSatisfaction?.answered, "resolver: satisfaction ausente para correção")
  assert(hasAny(correction?.text ?? "", ["respondendo diretamente", "não tenho confirmação", "nao tenho confirmacao"]), `resolver: não respondeu correção diretamente: ${correction?.text}`)
  assertNotClassificationAnswer(correction?.text ?? "", "resolver correção")

  const sportsHistory: ConversationHistoryMessage[] = []
  const games = await turn("qual jogo tem hoje da copa do mundo?", sportsHistory)
  assert(games?.text && hasAny(games.text, ["Suíça x Catar", "Marrocos x Brasil"]), `resolver: jogos em pt-BR falhou: ${games?.text}`)
  assert(!hasAny(games?.text ?? "", ["Switzerland at", "Morocco at"]), `resolver: vazou inglês: ${games?.text}`)

  const hours = await turn("que horas?", sportsHistory)
  assert(hours?.text && hasAny(hours.text, ["horários dos jogos", "Suíça x Catar"]), `resolver: que horas não seguiu jogos: ${hours?.text}`)
  assert(!hasAny(hours?.text ?? "", ["hora atual", "hoje é sábado"]), `resolver: que horas respondeu relógio: ${hours?.text}`)

  const bounceHistory: ConversationHistoryMessage[] = []
  const bookingStart = await turn("quero marcar horário", bounceHistory)
  assert(bookingStart?.text, "resolver: início de agendamento não respondeu")
  const netflix = await turn("aliás, qual o maior filme da netflix?", bounceHistory)
  assert(netflix?.text && hasAny(netflix.text, ["Netflix", "ranking", "horas assistidas"]), `resolver: mudança para Netflix falhou: ${netflix?.text}`)
  const backToSchedule = await turn("voltando ao horário", bounceHistory)
  assert(backToSchedule?.text && hasAny(backToSchedule.text, ["horário", "agenda", "agendar"]), `resolver: retorno ao horário falhou: ${backToSchedule?.text}`)

  console.log("Question Satisfaction Validation: PASS")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
