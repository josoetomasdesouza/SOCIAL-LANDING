import { strict as assert } from "node:assert"
import { approximateTextSimilarity, containsRoboticLanguage } from "@/lib/conversation-intelligence/anti-repetition"
import { createConversationIntelligenceResolver } from "@/lib/conversation-intelligence/resolver-adapter"
import { deriveTopicStack } from "@/lib/conversation-intelligence/topic-manager"
import type { UniversalToolProvider } from "@/lib/conversation-intelligence/tool-router"
import type { ConversationHistoryMessage } from "@/lib/conversation-intelligence/types"
import type { ConversationResponseResolver } from "@/lib/mock-data/conversational-search"

const forbiddenBusinessCues = [
  "barba negra",
  "barbearia",
  "serviço",
  "servico",
  "agenda",
  "agendar",
  "profissional",
  "corte",
]

const forbiddenInternalCues = [
  "contexto",
  "memória",
  "memoria",
  "intenção",
  "intencao",
  "ferramenta",
  "resolver",
  "visualblock",
  "fluxo",
  "arquitetura",
]

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

function isDry(text: string) {
  const sentences = text.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean)
  return text.length < 45 || (sentences.length <= 1 && !text.includes("?"))
}

const toolProvider: UniversalToolProvider = (tool, input) => {
  const message = input.message.toLowerCase()
  if (tool === "time") return "Hoje é sábado, 13 de junho de 2026, 16:17 em São Paulo. Posso te situar por data, dia da semana ou hora atual."
  if (tool === "web_search") return "O ranking da Netflix muda por país e período; a lista oficial por horas assistidas é a fonte mais segura para saber o filme mais assistido agora. Você quer ranking histórico global ou ranking atual?"
  if (tool === "sports" && /que horas|horarios|horários/.test(message)) {
    return "Você diz os horários dos jogos? Pelo calendário consultado agora:\n\n* Suíça x Catar - 13:00\n* Marrocos x Brasil - 16:00\n* Escócia x Haiti - 19:00"
  }
  if (tool === "sports") return "Hoje aparecem estes jogos:\n\n* Suíça x Catar\n* Marrocos x Brasil\n* Escócia x Haiti\n\nQuer que eu veja os horários também?"
  if (tool === "weather") return "Agora em São Paulo está por volta de 22°C, com condição amena. Para outra cidade, me diga o local."
  if (tool === "news") return "Manchetes recentes de tecnologia: avanços em IA, novos chips para dispositivos móveis e debates sobre regulação digital. Quer que eu aprofunde alguma delas?"
  if (tool === "answer_from_reasoning" && /cacheado|cabelo feminino/.test(message)) {
    return "Claro. Para cabelo feminino cacheado, eu citaria:\n\n* Long bob cacheado\n* Corte em camadas\n* Shaggy cacheado\n\nSe a ideia for valorizar volume, eu tenderia mais para camadas."
  }
  if (tool === "answer_from_reasoning") return "Inteligência artificial é uma área que cria sistemas capazes de reconhecer padrões, gerar respostas e ajudar em decisões. Em termos simples, é software tentando fazer tarefas que antes pareciam exigir raciocínio humano."
  return null
}

const baseResolver: ConversationResponseResolver = async () => ({
  text: "Ferramenta de negócio pronta para apoiar quando o usuário pedir algo da Social Landing.",
})

async function main() {
  const resolver = createConversationIntelligenceResolver({
    brandName: "Barba Negra",
    baseResolver,
    actionResolver: baseResolver,
    toolProvider,
    catalogSummary: {
      services: [{ id: "service-1", kind: "service", name: "Corte Masculino" }],
      professionals: [{ id: "barber-1", kind: "professional", name: "Carlos Silva" }],
    },
  })
  const history: ConversationHistoryMessage[] = []
  const replies: string[] = []

  const turns = [
    { user: "Que dia é hoje?", mustInclude: ["sábado"], universal: true },
    { user: "Qual filme mais assistido da Netflix?", mustInclude: ["Netflix", "ranking"], universal: true },
    { user: "E qual jogo tem hoje da Copa do Mundo?", mustInclude: ["Suíça x Catar"], mustNotInclude: ["Switzerland at"], universal: true },
    { user: "Como está o clima em São Paulo?", mustInclude: ["São Paulo"], universal: true },
    { user: "Quais notícias de tecnologia agora?", mustInclude: ["tecnologia"], universal: true },
    { user: "Me explica inteligência artificial em uma frase", mustInclude: ["Inteligência artificial"], universal: true },
    { user: "Quero cortar o cabelo", mustInclude: ["visual"], universal: false },
    { user: "Qual filme mais assistido da Netflix?", mustInclude: ["Netflix"], universal: true, activeTopic: "netflix" },
    { user: "E qual jogo tem hoje?", mustInclude: ["Suíça x Catar"], mustNotInclude: ["Switzerland at"], universal: true, activeTopic: "futebol" },
    { user: "Voltando ao corte", mustInclude: ["corte"], universal: false, activeTopic: "agendamento" },
    { user: "Tô pensando em mudar o visual, mas com medo", mustInclude: ["medo"], universal: false },
    { user: "Pode agendar depois disso?", mustInclude: ["agendar"], universal: false },
    { user: "qual jogo tem hoje da copa do mundo?", mustInclude: ["Suíça x Catar", "Marrocos x Brasil"], mustNotInclude: ["Switzerland at", "Morocco at"], universal: true, activeTopic: "futebol" },
    { user: "que horas?", mustInclude: ["horários dos jogos", "Suíça x Catar"], mustNotInclude: ["hora atual"], universal: true, activeTopic: "futebol" },
    { user: "cite 3 cortes de cabelo feminino cacheado", mustInclude: ["Long bob cacheado", "Corte em camadas", "Shaggy cacheado"], mustNotInclude: ["masculino", "executivo"], universal: false, activeTopic: "cabelo_feminino" },
  ]

  for (const [index, turn] of turns.entries()) {
    const topicStack = deriveTopicStack({ message: turn.user, history })
    const activeTopic = topicStack.find((topic) => topic.state === "active")?.topic
    const result = await resolver({
      message: turn.user,
      brandName: "Barba Negra",
      contextItems: [],
      history,
    })
    const reply = result?.text ?? ""
    const previous = replies.at(-1)

    assert(reply, `turn ${index + 1}: empty reply`)
    assert(!isDry(reply), `turn ${index + 1}: dry reply: ${reply}`)
    assert(!containsRoboticLanguage(reply), `turn ${index + 1}: robotic phrase: ${reply}`)
    assert(!hasAny(reply, forbiddenInternalCues), `turn ${index + 1}: internal language: ${reply}`)

    for (const expectedText of turn.mustInclude) {
      assert(
        normalize(reply).includes(normalize(expectedText)),
        `turn ${index + 1}: missing "${expectedText}" in "${reply}"`
      )
    }
    for (const forbiddenText of turn.mustNotInclude ?? []) {
      assert(
        !normalize(reply).includes(normalize(forbiddenText)),
        `turn ${index + 1}: should not include "${forbiddenText}" in "${reply}"`
      )
    }

    if (turn.universal) {
      assert(!hasAny(reply, forbiddenBusinessCues), `turn ${index + 1}: forced business domain: ${reply}`)
    }

    if (turn.activeTopic) {
      assert.equal(activeTopic, turn.activeTopic, `turn ${index + 1}: active topic mismatch`)
    }

    if (previous) {
      assert(
        approximateTextSimilarity(reply, previous) < 0.78,
        `turn ${index + 1}: repeated language\nprev=${previous}\nnext=${reply}`
      )
    }

    history.push({ role: "user", content: turn.user })
    history.push({ role: "ai", content: reply })
    replies.push(reply)
    console.log(`${String(index + 1).padStart(2, "0")} topic=${activeTopic} user="${turn.user}" ai="${reply.slice(0, 120)}"`)
  }

  console.log("Universal Agent Validation: PASS")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
