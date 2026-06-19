import { strict as assert } from "node:assert"
import type { ConversationContextPayload } from "@/lib/business-types"
import {
  approximateTextSimilarity,
  containsRoboticLanguage,
} from "@/lib/conversation-intelligence/anti-repetition"
import { createConversationIntelligenceResolver } from "@/lib/conversation-intelligence/resolver-adapter"
import type { ConversationHistoryMessage } from "@/lib/conversation-intelligence/types"
import type {
  ConversationResponseResolver,
  ConversationResponseResolverInput,
} from "@/lib/mock-data/conversational-search"

const messages = [
  "oi",
  "quero cortar",
  "não sei",
  "quanto?",
  "não entendi",
  "tem outro?",
  "não gostei",
  "e hoje?",
  "volta no corte",
  "qual você recomenda?",
  "algo discreto",
  "qnt custa",
  "hj tem",
  "quem ganhou o jogo ontem?",
  "voltando, tem horário hoje?",
  "você não entendeu nada",
  "responde direito",
  "quero mudar o visual, mas tenho medo",
  "tem corte igual do ator tal?",
  "fechado",
]

const serviceContext: ConversationContextPayload = {
  id: "appointment-service-service-1",
  title: "Corte Masculino",
  image: "",
  subtitle: "Servico",
}

const professionalContext: ConversationContextPayload = {
  id: "appointment-barber-barber-1",
  title: "Carlos Silva",
  image: "",
  subtitle: "Barbeiro",
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function openingKey(value: string) {
  return normalize(value).split(/\s+/).filter(Boolean).slice(0, 3).join(" ")
}

function isDry(text: string) {
  const sentences = text.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean)
  return text.length < 55 || (sentences.length <= 1 && !text.includes("?"))
}

function hasInternalLanguage(text: string) {
  const normalized = normalize(text)
  return [
    "contexto atual",
    "continuacao",
    "intencao",
    "resolver",
    "visualblock",
    "acao clara",
    "ferramenta certa",
    "sistema",
    "prompt",
  ].some((cue) => normalized.includes(cue))
}

function contextForTurn(index: number) {
  if (index >= 7) return [serviceContext, professionalContext]
  if (index >= 3) return [serviceContext]
  return []
}

const baseResolver: ConversationResponseResolver = async (input: ConversationResponseResolverInput) => {
  const hasContext = input.contextItems[0]?.title

  return {
    text: hasContext
      ? `Aqui estão dados de apoio para ${hasContext}.`
      : "Consigo te orientar, mas preciso de um pouco mais de direção.",
  }
}

async function main() {
  const resolver = createConversationIntelligenceResolver({
    brandName: "Barba Negra",
    baseResolver,
    actionResolver: baseResolver,
    brainProvider: undefined,
    catalogSummary: {
      services: [{ id: "service-1", kind: "service", name: "Corte Masculino", detail: "Corte tradicional" }],
      professionals: [{ id: "barber-1", kind: "professional", name: "Carlos Silva", detail: "Barbeiro senior" }],
    },
  })
  const history: ConversationHistoryMessage[] = []
  const replies: string[] = []

  for (const [index, message] of messages.entries()) {
    const contextItems = contextForTurn(index)
    const result = await resolver({
      message,
      brandName: "Barba Negra",
      contextItems,
      history,
      catalogSummary: {
        services: [{ id: "service-1", kind: "service", name: "Corte Masculino", detail: "Corte tradicional" }],
        professionals: [{ id: "barber-1", kind: "professional", name: "Carlos Silva", detail: "Barbeiro senior" }],
      },
    })
    const reply = result?.text.trim() ?? ""
    const previous = replies.at(-1)

    assert(reply, `turn ${index + 1}: empty reply for "${message}"`)
    assert(!isDry(reply), `turn ${index + 1}: dry reply: ${reply}`)
    assert(!containsRoboticLanguage(reply), `turn ${index + 1}: robotic phrase: ${reply}`)
    assert(!hasInternalLanguage(reply), `turn ${index + 1}: internal/system language: ${reply}`)

    if (previous) {
      assert.notEqual(
        openingKey(reply),
        openingKey(previous),
        `turn ${index + 1}: repeated opening "${openingKey(reply)}"`
      )
      assert(
        approximateTextSimilarity(reply, previous) < 0.72,
        `turn ${index + 1}: high consecutive similarity\nprev=${previous}\nnext=${reply}`
      )
    }

    for (const olderReply of replies.slice(-5, -1)) {
      assert(
        approximateTextSimilarity(reply, olderReply) < 0.82,
        `turn ${index + 1}: high recent similarity\nolder=${olderReply}\nnext=${reply}`
      )
    }

    replies.push(reply)
    history.push({ role: "user", content: message })
    history.push({ role: "ai", content: reply, visualBlock: result?.visualBlock })
    console.log(`${String(index + 1).padStart(2, "0")} user="${message}" ai="${reply.slice(0, 120)}"`)
  }

  console.log("Anti-Repetition Validation: PASS")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
