import { strict as assert } from "node:assert"
import type { ConversationContextPayload } from "@/lib/business-types"
import { conductConversationTurn } from "@/lib/conversation-intelligence/conductor"
import { interpretConversationTurn } from "@/lib/conversation-intelligence/interpreter"
import { generateConversationalBrainReply } from "@/lib/conversation-intelligence/llm-brain"
import { resolveLlmBrainReply } from "@/lib/conversation-intelligence/llm-provider"
import { deriveConversationMemory } from "@/lib/conversation-intelligence/memory"
import type {
  ConversationCatalogSummary,
  ConversationHistoryMessage,
  LlmBrainProviderInput,
  LlmBrainReply,
} from "@/lib/conversation-intelligence/types"

interface QualityScore {
  continuity: number
  naturalness: number
  reasoning: number
  nextStep: number
  memoryUse: number
  toolDiscipline: number
}

interface QualityFixture {
  id: string
  label: string
  vertical: string
  brandName: string
  message: string
  history?: ConversationHistoryMessage[]
  contextItems?: ConversationContextPayload[]
  catalogSummary?: ConversationCatalogSummary
  expected: LlmBrainReply
  expectNoEarlyTool?: boolean
  expectMemoryUse?: boolean
  expectClose?: boolean
  expectIndependentQuestion?: boolean
  requiredText?: string[]
  forbiddenText?: string[]
}

const serviceContext: ConversationContextPayload = {
  id: "appointment-service-service-1",
  title: "Corte Masculino",
  image: "",
  subtitle: "Servico",
}

const barberContext: ConversationContextPayload = {
  id: "appointment-barber-barber-1",
  title: "Carlos Silva",
  image: "",
  subtitle: "Barbeiro",
}

const productContext: ConversationContextPayload = {
  id: "ecommerce-product-hydrating-gel",
  title: "Gel Hidratante Oil-Free",
  image: "",
  subtitle: "Produto",
}

const commonCatalog: ConversationCatalogSummary = {
  services: [
    { id: "service-1", name: "Corte Masculino", kind: "service", detail: "Corte tradicional" },
    { id: "service-3", name: "Barba Completa", kind: "service", detail: "Aparar e hidratar" },
  ],
  professionals: [
    { id: "barber-1", name: "Carlos Silva", kind: "professional", detail: "Barbeiro senior" },
  ],
}

function expectedReply(text: string, overrides: Partial<LlmBrainReply> = {}): LlmBrainReply {
  return {
    text,
    conversationMode: "reflect",
    actionRequest: { type: "none", reason: "expected_chatgpt_style" },
    shouldUseLegacyResolver: false,
    shouldShowVisualBlock: false,
    nextQuestion: undefined,
    ...overrides,
  }
}

const fixtures: QualityFixture[] = [
  {
    id: "barber-open-request",
    label: "barbearia · pedido aberto",
    vertical: "appointment",
    brandName: "Barba Negra",
    message: "quero cortar o cabelo",
    catalogSummary: commonCatalog,
    expectNoEarlyTool: true,
    expected: expectedReply(
      "Boa. Antes de abrir opções, eu entenderia o visual que você quer passar. Você busca algo mais discreto para o dia a dia ou algo mais moderno, com lateral marcada?",
      { conversationMode: "clarify", nextQuestion: "Você busca algo discreto ou moderno?" }
    ),
  },
  {
    id: "restaurant-indecisive",
    label: "restaurante · usuário indeciso",
    vertical: "restaurant",
    brandName: "Casa do Sabor",
    message: "tô com fome mas não sei o que pedir",
    expectNoEarlyTool: true,
    expected: expectedReply(
      "Boa. Eu não começaria jogando o cardápio inteiro em você. Primeiro eu entenderia se você quer algo leve, confortável ou mais marcante; daí eu te conduzo para poucas opções.",
      { conversationMode: "clarify", nextQuestion: "Você quer algo leve, confortável ou mais marcante?" }
    ),
  },
  {
    id: "health-care",
    label: "saúde · cuidado sem diagnóstico",
    vertical: "health",
    brandName: "Clínica Serena",
    message: "estou com dor nas costas, qual profissional faz sentido?",
    expectNoEarlyTool: true,
    expected: expectedReply(
      "Entendi. Sem tentar diagnosticar por aqui, eu usaria isso para direcionar a conversa: vale entender se é algo recente, recorrente ou ligado a movimento. Com isso, o próximo passo é escolher a especialidade certa antes de mostrar agenda.",
      { conversationMode: "clarify", nextQuestion: "É algo recente, recorrente ou ligado a movimento?" }
    ),
  },
  {
    id: "ecommerce-product",
    label: "ecommerce · escolha consultiva",
    vertical: "ecommerce",
    brandName: "Glow Shop",
    message: "preciso de um hidratante para pele oleosa",
    expectNoEarlyTool: true,
    expected: expectedReply(
      "Boa. Eu começaria filtrando por textura leve e acabamento sem brilho, em vez de abrir todos os produtos. Se sua pele é oleosa, faz sentido comparar opções oil-free antes de decidir.",
      { conversationMode: "recommend", nextQuestion: "Você prefere textura gel ou loção leve?" }
    ),
  },
  {
    id: "off-domain",
    label: "fora do domínio",
    vertical: "appointment",
    brandName: "Barba Negra",
    message: "quem foi silvio santos?",
    expectNoEarlyTool: true,
    expected: expectedReply(
      "Silvio Santos foi um dos grandes nomes da TV brasileira. Faz sentido responder isso de forma breve aqui; para voltar ao contexto da Barba Negra, posso te ajudar com corte, barba ou horário sem misturar assuntos.",
      { conversationMode: "answer", nextQuestion: "Quer voltar para corte, barba ou horário?" }
    ),
  },
  {
    id: "undecided-memory",
    label: "usuário indeciso · usa memória",
    vertical: "appointment",
    brandName: "Barba Negra",
    message: "não sei, algo discreto",
    history: [
      { role: "user", content: "quero cortar o cabelo" },
      {
        role: "ai",
        content: "Boa. Você está buscando algo mais discreto para o dia a dia ou algo mais moderno?",
      },
    ],
    expectNoEarlyTool: true,
    expectMemoryUse: true,
    expected: expectedReply(
      "Boa, vou considerar isso como continuação do corte. Se a ideia é algo discreto, eu evitaria contraste forte e seguiria por uma linha limpa. O próximo passo é decidir se você quer manutenção fácil ou acabamento mais alinhado.",
      { conversationMode: "reflect", nextQuestion: "Você prioriza manutenção fácil ou acabamento mais alinhado?" }
    ),
  },
  {
    id: "objective-schedule",
    label: "usuário objetivo · ação clara",
    vertical: "appointment",
    brandName: "Barba Negra",
    message: "e hoje?",
    contextItems: [barberContext],
    history: [
      { role: "user", content: "quero com o Carlos" },
      { role: "ai", content: "Carlos combina com esse perfil. O próximo passo natural é olhar horários." },
    ],
    catalogSummary: commonCatalog,
    expectMemoryUse: true,
    expected: expectedReply(
      "Boa. Como já estamos falando do Carlos, agora faz sentido usar a agenda como ferramenta. Vou manter o texto curto e deixar os horários aparecerem como apoio.",
      {
        conversationMode: "act",
        actionRequest: { type: "show_schedule", reason: "clear_schedule_request_with_professional_context" },
        shouldUseLegacyResolver: true,
        shouldShowVisualBlock: true,
      }
    ),
  },
  {
    id: "irritated-user",
    label: "usuário irritado",
    vertical: "appointment",
    brandName: "Barba Negra",
    message: "não gostei disso",
    contextItems: [serviceContext],
    history: [
      { role: "user", content: "quero algo executivo" },
      { role: "ai", content: "Eu olharia uma opção limpa antes de mostrar horários." },
    ],
    expectNoEarlyTool: true,
    expectMemoryUse: true,
    expected: expectedReply(
      "Justo. Então eu não insistiria nessa opção. Pelo que você vinha buscando, talvez ela tenha ficado marcada demais; posso ajustar para uma alternativa mais discreta antes de mostrar outro card.",
      { conversationMode: "reflect", nextQuestion: "Quer uma alternativa mais discreta?" }
    ),
  },
  {
    id: "topic-change",
    label: "mudança de assunto",
    vertical: "ecommerce",
    brandName: "Glow Shop",
    message: "na verdade quero um presente de skincare",
    contextItems: [productContext],
    history: [
      { role: "user", content: "estava olhando um hidratante para mim" },
      { role: "ai", content: "Boa. Para pele oleosa, eu olharia textura gel primeiro." },
    ],
    expectMemoryUse: true,
    expected: expectedReply(
      "Entendi a virada: saímos da sua pele e agora estamos falando de presente. Eu manteria skincare como território, mas mudaria a pergunta para perfil da pessoa, sensibilidade e faixa de cuidado antes de mostrar produtos.",
      { conversationMode: "clarify", nextQuestion: "A pessoa prefere algo básico, premium ou sensorial?" }
    ),
  },
  {
    id: "netflix-off-domain-after-greeting",
    label: "fora do domínio real depois de saudação",
    vertical: "appointment",
    brandName: "Barba Negra",
    message: "qual o filme mais assistido na netflix?",
    history: [
      { role: "user", content: "bom dia" },
      { role: "ai", content: "Oi. Me conta se você quer escolher um serviço, entender preço ou já olhar horário." },
    ],
    expectNoEarlyTool: true,
    expectIndependentQuestion: true,
    requiredText: ["netflix", "muda", "ranking"],
    forbiddenText: ["continuação do que falamos", "contexto atual", "recomeçar a busca"],
    expected: expectedReply(
      "Boa pergunta. Isso muda bastante conforme o período e o país porque a Netflix separa rankings por recorte, idioma e horas assistidas. Se você está falando de ranking histórico global, normalmente a própria Netflix divulga listas atualizadas.",
      { conversationMode: "answer", nextQuestion: "Você quer ranking histórico global ou ranking atual?" }
    ),
  },
  {
    id: "confused-after-netflix",
    label: "usuário não entendeu resposta off-domain",
    vertical: "appointment",
    brandName: "Barba Negra",
    message: "nao entendi",
    history: [
      { role: "user", content: "bom dia" },
      { role: "ai", content: "Oi. Me conta se você quer escolher um serviço, entender preço ou já olhar horário." },
      { role: "user", content: "qual o filme mais assistido na netflix?" },
      {
        role: "ai",
        content:
          "Boa pergunta. Isso muda bastante conforme o período e o país. Se você está falando de ranking histórico global da Netflix, normalmente a própria Netflix divulga listas atualizadas por horas assistidas.",
      },
    ],
    expectNoEarlyTool: true,
    expectIndependentQuestion: true,
    requiredText: ["respondi mal", "netflix", "reformulando"],
    forbiddenText: ["continuação do que falamos", "contexto atual", "recomeçar a busca"],
    expected: expectedReply(
      "Você tem razão, eu respondi mal. Você perguntou sobre Netflix, e eu tratei como se fosse continuação da conversa da barbearia. Reformulando: esse ranking muda com o tempo porque depende do recorte usado.",
      { conversationMode: "answer", nextQuestion: "Você quer considerar ranking histórico global?" }
    ),
  },
]

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function sentenceCount(text: string) {
  return text.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length
}

function clampScore(score: number) {
  return Math.max(0, Math.min(5, score))
}

function mentionsAny(normalized: string, cues: string[]) {
  return cues.some((cue) => normalized.includes(normalizeText(cue)))
}

function hasInventedTransactionalData(reply: LlmBrainReply) {
  const normalized = normalizeText(reply.text)
  const mentionsConcretePrice = /r\$\s*\d+|\b\d+\s*reais\b/i.test(reply.text)
  const mentionsConcreteSlot = /\b([01]?\d|2[0-3])h([0-5]\d)?\b/.test(reply.text)
  const confirmsBooking = mentionsAny(normalized, ["agendado", "confirmado para", "reserva feita", "pedido confirmado"])

  return mentionsConcretePrice || mentionsConcreteSlot || confirmsBooking
}

function buildProviderInput(fixture: QualityFixture): LlmBrainProviderInput {
  const history = fixture.history ?? []
  const contextItems = fixture.contextItems ?? []
  const memory = deriveConversationMemory({ history, contextItems })
  const interpretation = interpretConversationTurn({
    message: fixture.message,
    contextItems,
    conversationMemory: memory,
    brandName: fixture.brandName,
    history,
  })
  const nextMove = conductConversationTurn({
    message: fixture.message,
    history,
    memory,
    state: interpretation.state,
    interpretedIntent: interpretation.intent,
    contextItems,
    lastAssistantQuestion: interpretation.state.lastAssistantQuestion,
    lastShownVisualBlockKind: interpretation.state.lastShownVisualBlockKind,
  })

  return {
    message: fixture.message,
    history,
    memory,
    state: interpretation.state,
    interpretedIntent: interpretation.intent,
    nextMove,
    contextItems,
    brandName: fixture.brandName,
    vertical: fixture.vertical,
    catalogSummary: fixture.catalogSummary,
  }
}

function scoreReply(reply: LlmBrainReply, fixture: QualityFixture): QualityScore {
  const normalized = normalizeText(reply.text)
  const sentences = sentenceCount(reply.text)
  const hasQuestion = reply.text.includes("?") || Boolean(reply.nextQuestion)
  const dry = reply.text.length < 55 || (sentences <= 1 && !hasQuestion)
  const hasContext = !fixture.expectIndependentQuestion && ((fixture.history?.length ?? 0) > 0 || (fixture.contextItems?.length ?? 0) > 0)
  const actionType = reply.actionRequest?.type ?? "none"
  const isToolAction = actionType !== "none"
  const inventedTransactionalData = hasInventedTransactionalData(reply)

  const continuity = clampScore(
    2 +
      (sentences >= 2 ? 1 : 0) +
      (mentionsAny(normalized, ["continua", "já", "ja", "como", "considerando", "pelo que", "agora"]) ? 1 : 0) +
      (!mentionsAny(normalized, ["nao captei", "não captei", "me conta em uma frase"]) ? 1 : 0)
  )

  const naturalness = clampScore(
    1 +
      (!dry ? 2 : 0) +
      (mentionsAny(normalized, ["boa", "entendi", "faz sentido", "justo", "perfeito", "posso"]) ? 1 : 0) +
      (!mentionsAny(normalized, ["opcao 1", "opção 1", "erro", "fallback"]) ? 1 : 0)
  )

  const reasoning = clampScore(
    1 +
      (mentionsAny(normalized, ["porque", "considerando", "pelo que", "se a ideia", "antes", "para não", "faz sentido"]) ? 2 : 0) +
      (reply.conversationMode === "reflect" || reply.conversationMode === "recommend" || reply.conversationMode === "clarify" ? 1 : 0) +
      (reply.text.length > 90 ? 1 : 0)
  )

  const nextStep = fixture.expectClose
    ? clampScore(reply.conversationMode === "close" ? 5 : 1)
    : clampScore(1 + (hasQuestion ? 2 : 0) + (isToolAction ? 1 : 0) + (reply.conversationMode !== "answer" ? 1 : 0))

  const memoryUse = clampScore(
    !hasContext
      ? 4
      : 1 +
          (mentionsAny(normalized, ["continuação", "continuacao", "já", "ja", "estamos", "vinha", "contexto"]) ? 2 : 0) +
          ((fixture.contextItems ?? []).some((item) => normalized.includes(normalizeText(item.title))) ? 1 : 0) +
          (reply.actionRequest?.reason.includes("context") || reply.actionRequest?.reason.includes("professional") ? 1 : 0)
  )

  const toolDiscipline = clampScore(
    5 -
      (inventedTransactionalData ? 3 : 0) -
      (fixture.expectNoEarlyTool && isToolAction ? 2 : 0) -
      (fixture.expectNoEarlyTool && reply.shouldShowVisualBlock ? 2 : 0) -
      (reply.shouldShowVisualBlock && !reply.shouldUseLegacyResolver ? 2 : 0)
  )

  return {
    continuity,
    naturalness,
    reasoning,
    nextStep,
    memoryUse,
    toolDiscipline,
  }
}

function totalScore(score: QualityScore) {
  return Object.values(score).reduce((sum, value) => sum + value, 0)
}

function assertQuality(label: string, reply: LlmBrainReply, score: QualityScore, fixture: QualityFixture) {
  const total = totalScore(score)
  const dry = reply.text.length < 55 || (sentenceCount(reply.text) <= 1 && !reply.text.includes("?"))

  assert(!dry, `${label}: dry response: ${reply.text}`)
  assert(score.continuity >= 3, `${label}: weak continuity`)
  assert(score.naturalness >= 3, `${label}: weak naturalness`)
  assert(score.reasoning >= 3, `${label}: weak reflection/reasoning`)
  assert(score.nextStep >= 3, `${label}: missing next-step conduct`)
  assert(score.toolDiscipline >= 4, `${label}: tool discipline regression`)
  assert(total >= 23, `${label}: total quality score too low (${total}/30)`)

  if (fixture.expectMemoryUse) {
    assert(score.memoryUse >= 3, `${label}: lost context or memory`)
  }

  if (fixture.expectNoEarlyTool) {
    assert.equal(reply.actionRequest?.type ?? "none", "none", `${label}: tool/card requested too early`)
    assert.equal(reply.shouldShowVisualBlock, false, `${label}: visual block appeared too early`)
  }

  for (const requiredText of fixture.requiredText ?? []) {
    assert(
      normalizeText(reply.text).includes(normalizeText(requiredText)),
      `${label}: missing required text "${requiredText}"`
    )
  }

  for (const forbiddenText of fixture.forbiddenText ?? []) {
    assert(
      !normalizeText(reply.text).includes(normalizeText(forbiddenText)),
      `${label}: included forbidden text "${forbiddenText}"`
    )
  }

  assert.equal(hasInventedTransactionalData(reply), false, `${label}: invented transactional data`)
}

async function resolveRealLlmIfAvailable(input: LlmBrainProviderInput) {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }

  return resolveLlmBrainReply(input, { provider: "openai" }).catch(() => null)
}

function reportLine(source: string, fixture: QualityFixture, reply: LlmBrainReply, score: QualityScore) {
  const total = totalScore(score)
  const action = reply.actionRequest?.type ?? "none"
  const preview = reply.text.replace(/\s+/g, " ").slice(0, 110)
  console.log(
    `${source.padEnd(10)} ${fixture.id.padEnd(24)} total=${String(total).padStart(2)}/30 mode=${reply.conversationMode.padEnd(9)} action=${action.padEnd(18)} text="${preview}"`
  )
}

async function main() {
  console.log("Conversation Quality Evaluation")
  console.log("criteria=continuity,naturalness,reasoning,nextStep,memoryUse,toolDiscipline")
  console.log("llm-real=" + (process.env.OPENAI_API_KEY ? "enabled" : "unavailable_without_OPENAI_API_KEY"))

  for (const fixture of fixtures) {
    const input = buildProviderInput(fixture)
    const localReply = generateConversationalBrainReply(input)
    const localScore = scoreReply(localReply, fixture)
    assertQuality(`fallback-local:${fixture.id}`, localReply, localScore, fixture)
    reportLine("fallback", fixture, localReply, localScore)

    const expectedScore = scoreReply(fixture.expected, fixture)
    assertQuality(`expected:${fixture.id}`, fixture.expected, expectedScore, fixture)
    reportLine("expected", fixture, fixture.expected, expectedScore)

    const realReply = await resolveRealLlmIfAvailable(input)
    if (realReply) {
      const realScore = scoreReply(realReply, fixture)
      assertQuality(`llm-real:${fixture.id}`, realReply, realScore, fixture)
      reportLine("llm-real", fixture, realReply, realScore)
    } else {
      console.log(`llm-real   ${fixture.id.padEnd(24)} skipped=missing_env_or_provider_unavailable`)
    }
  }

  console.log("Conversation Quality Evaluation: PASS")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
