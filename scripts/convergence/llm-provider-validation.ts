import { strict as assert } from "node:assert"
import type { ConversationContextPayload } from "@/lib/business-types"
import { conductConversationTurn } from "@/lib/conversation-intelligence/conductor"
import { interpretConversationTurn } from "@/lib/conversation-intelligence/interpreter"
import { deriveConversationMemory } from "@/lib/conversation-intelligence/memory"
import {
  parseStrictLlmBrainReply,
  resolveLlmBrainReply,
} from "@/lib/conversation-intelligence/llm-provider"
import type { ConversationHistoryMessage } from "@/lib/conversation-intelligence/types"

const serviceContext: ConversationContextPayload = {
  id: "appointment-service-service-1",
  title: "Corte Masculino",
  image: "",
  subtitle: "Servico",
}

function buildProviderInput({
  message,
  history = [],
  contextItems = [],
}: {
  message: string
  history?: ConversationHistoryMessage[]
  contextItems?: ConversationContextPayload[]
}) {
  const memory = deriveConversationMemory({ history, contextItems })
  const interpretation = interpretConversationTurn({
    message,
    contextItems,
    conversationMemory: memory,
    brandName: "Barba Negra",
    history,
  })
  const nextMove = conductConversationTurn({
    message,
    history,
    memory,
    state: interpretation.state,
    interpretedIntent: interpretation.intent,
    contextItems,
    lastAssistantQuestion: interpretation.state.lastAssistantQuestion,
    lastShownVisualBlockKind: interpretation.state.lastShownVisualBlockKind,
  })

  return {
    message,
    history,
    memory,
    state: interpretation.state,
    interpretedIntent: interpretation.intent,
    nextMove,
    contextItems,
    brandName: "Barba Negra",
    vertical: "appointment",
    catalogSummary: {
      services: [{ id: "service-1", name: "Corte Masculino", kind: "service" as const, detail: "Corte" }],
      professionals: [{ id: "barber-1", name: "Carlos Silva", kind: "professional" as const, detail: "Barbeiro" }],
    },
  }
}

async function main() {
  const previousProvider = process.env.CONVERSATION_LLM_PROVIDER
  const previousApiKey = process.env.OPENAI_API_KEY
  delete process.env.OPENAI_API_KEY
  process.env.CONVERSATION_LLM_PROVIDER = "auto"

  const openQuestion = await resolveLlmBrainReply(buildProviderInput({ message: "quero cortar o cabelo" }))
  assert.equal(openQuestion.shouldUseLegacyResolver, false)
  assert.equal(openQuestion.shouldShowVisualBlock, false)
  assert.equal(openQuestion.actionRequest?.type, "none")
  assert.match(openQuestion.text, /discreto|moderno|visual|lateral/i)

  const mockReply = await resolveLlmBrainReply(buildProviderInput({ message: "e hoje?", contextItems: [serviceContext] }), {
    provider: "mock",
  })
  assert(parseStrictLlmBrainReply(mockReply), "mock provider output should be valid strict JSON shape")
  assert.equal(mockReply.actionRequest?.type, "show_schedule")
  assert.equal(mockReply.shouldUseLegacyResolver, true)

  const coerced = parseStrictLlmBrainReply({
    text: "Posso te orientar, mas agenda e preço vêm da ferramenta.",
    conversationMode: "act",
    actionRequest: { type: "show_price", reason: "needs_tool" },
    shouldUseLegacyResolver: true,
    shouldShowVisualBlock: true,
    nextQuestion: null,
  })
  assert(coerced, "valid JSON should parse")
  assert.equal(coerced.shouldShowVisualBlock, false, "price actions should not force visual blocks")

  if (previousProvider === undefined) {
    delete process.env.CONVERSATION_LLM_PROVIDER
  } else {
    process.env.CONVERSATION_LLM_PROVIDER = previousProvider
  }

  if (previousApiKey === undefined) {
    delete process.env.OPENAI_API_KEY
  } else {
    process.env.OPENAI_API_KEY = previousApiKey
  }

  console.log("LLM Provider validation: PASS")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
