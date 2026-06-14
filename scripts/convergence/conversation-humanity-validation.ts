import { strict as assert } from "node:assert"
import { createConversationIntelligenceResolver } from "@/lib/conversation-intelligence/resolver-adapter"
import type {
  ConversationHistoryMessage,
  ConversationalHumanityProfile,
  UniversalToolName,
} from "@/lib/conversation-intelligence/types"
import type {
  ConversationResponseResolver,
  ConversationResponseResolverResult,
} from "@/lib/mock-data/conversational-search"

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

function assertHumanity(result: ConversationResponseResolverResult | null, label: string): ConversationalHumanityProfile {
  assert(result?.text, `${label}: resposta vazia`)
  assert(result.intelligence?.humanity, `${label}: humanity ausente`)
  assert(result.intelligence.humanity.overall >= 3.7, `${label}: humanity baixo ${result.intelligence.humanity.overall}`)
  assert(!hasAny(result.text, ["tool", "actionRequest", "visualBlock", "topicStack", "resolver"]), `${label}: vazou linguagem interna`)
  return result.intelligence.humanity
}

const toolProvider = (tool: UniversalToolName, input: { message: string }) => {
  const message = normalize(input.message)
  if (tool === "time") return "Hoje é sábado, 13 de junho de 2026."
  if (tool === "sports") return "Hoje aparecem estes jogos:\n\n* Suíça x Catar\n* Marrocos x Brasil\n* Escócia x Haiti\n\nQuer que eu veja os horários também?"
  if (tool === "web_search") return "O ranking muda por país e período. A fonte oficial é a lista atualizada por horas assistidas. Você quer ranking atual ou histórico?"
  if (tool === "answer_from_reasoning" && hasAny(message, ["conversar", "bater papo"])) {
    return "Claro. Dá para conversar sem transformar isso em decisão agora."
  }
  if (tool === "answer_from_reasoning") return "Resposta direta, sem precisar abrir mais nada."
  return null
}

const baseResolver: ConversationResponseResolver = async (): Promise<ConversationResponseResolverResult> => ({
  text: "Tenho algumas opções abaixo que podem ajudar nessa escolha.",
})

const resolver = createConversationIntelligenceResolver({
  brandName: "Barba Negra",
  baseResolver,
  actionResolver: baseResolver,
  toolProvider,
  catalogSummary: {
    services: [
      { id: "corte", name: "Corte masculino", kind: "service", detail: "social, degradê e executivo" },
      { id: "barba", name: "Barba completa", kind: "service", detail: "acabamento e desenho" },
    ],
    professionals: [
      { id: "carlos", name: "Carlos Silva", kind: "professional", detail: "cortes executivos" },
    ],
  },
})

async function resolve(message: string, history: ConversationHistoryMessage[] = []) {
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
  const cases = [
    {
      id: "usuario-inseguro",
      message: "quero mudar o visual mas tenho medo",
      expect: (text: string, h: ConversationalHumanityProfile) => {
        assert.equal(h.emotionalState, "insecure")
        assert.equal(h.personalityMode, "supportive")
        assert(hasAny(text, ["medo", "mudança", "controle", "percepção"]), "inseguro: precisa acolher insegurança")
        assert(text.includes("?"), "inseguro: precisa curiosidade útil")
      },
    },
    {
      id: "usuario-indeciso",
      message: "não sei se corto ou deixo crescer",
      expect: (text: string, h: ConversationalHumanityProfile) => {
        assert.equal(h.emotionalState, "indecisive")
        assert(hasAny(text, ["pesa mais", "não errar", "mudar de verdade", "calma"]), "indeciso: precisa ajudar a organizar decisão")
      },
    },
    {
      id: "usuario-tecnico",
      message: "me explica tecnicamente como escolher um corte",
      expect: (text: string, h: ConversationalHumanityProfile) => {
        assert.equal(h.personalityMode, "technical")
        assert(h.depth >= 4, "técnico: precisa profundidade")
        assert(text.length > 80, "técnico: resposta não pode ser rasa")
      },
    },
    {
      id: "usuario-objetivo",
      message: "direto: que dia é hoje?",
      expect: (text: string, h: ConversationalHumanityProfile) => {
        assert.equal(h.personalityMode, "direct")
        assert(text.length < 180, "objetivo: precisa ser curto")
      },
    },
    {
      id: "usuario-emocional",
      message: "minha namorada falou que meu cabelo me envelhece, fiquei meio mal",
      expect: (text: string, h: ConversationalHumanityProfile) => {
        assert(h.empathy >= 4, "emocional: precisa empatia")
        assert(hasAny(text, ["faz sentido", "cuidado", "sem pressa", "visual", "rosto"]), "emocional: precisa responder ao sentimento")
      },
    },
    {
      id: "usuario-agradece",
      message: "obrigado, ajudou",
      expect: (text: string, h: ConversationalHumanityProfile) => {
        assert.equal(h.emotionalState, "grateful")
        assert.equal(h.shouldContinue, false)
        assert(!text.includes("?"), "agradecimento: não deve puxar pergunta")
        assert(text.length < 80, "agradecimento: precisa encerrar curto")
      },
    },
    {
      id: "usuario-encerra",
      message: "era isso, valeu",
      expect: (text: string, h: ConversationalHumanityProfile) => {
        assert.equal(h.shouldContinue, false)
        assert(!text.includes("?"), "encerramento: não insistir")
      },
    },
    {
      id: "usuario-muda-ideia",
      message: "na verdade mudei de ideia, talvez eu queira algo discreto",
      expect: (text: string, h: ConversationalHumanityProfile) => {
        assert(h.curiosity >= 3.4, "mudança de ideia: precisa explorar motivo")
        assert(hasAny(text, ["mudou", "discreto", "estilo", "preço", "horário", "vontade"]), "mudança de ideia: precisa adaptar rota")
      },
    },
    {
      id: "usuario-so-conversa",
      message: "não quero agendar, só queria conversar sobre mudar o visual",
      expect: (text: string, h: ConversationalHumanityProfile) => {
        assert.equal(h.personalityMode, "exploratory")
        assert(!hasAny(text, ["agendar agora", "horário agora"]), "conversa livre: não pode transformar tudo em fluxo")
        assert(text.includes("?"), "conversa livre: deve abrir espaço humano")
      },
    },
  ]

  for (const testCase of cases) {
    const result = await resolve(testCase.message, [])
    const humanity = assertHumanity(result, testCase.id)
    testCase.expect(result?.text ?? "", humanity)
    console.log(`${testCase.id}: score=${humanity.overall} emotion=${humanity.emotionalState} mode=${humanity.personalityMode} text="${result?.text.slice(0, 130)}"`)
  }

  console.log("Conversation Humanity Validation: PASS")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
