import { strict as assert } from "node:assert"
import { createConversationIntelligenceResolver } from "@/lib/conversation-intelligence/resolver-adapter"
import type {
  ConversationHistoryMessage,
  HumanCommunicationFormatProfile,
  UniversalToolName,
} from "@/lib/conversation-intelligence/types"
import type {
  ConversationResponseResolver,
  ConversationResponseResolverResult,
} from "@/lib/mock-data/conversational-search"

const forbiddenText = [
  "tool",
  "actionRequest",
  "visualBlock",
  "intent",
  "context",
  "topicStack",
  "resolver",
  "route",
  "rota",
  "rawText",
  "formatProfile",
  "mostrar opções",
  "mostrar opcoes",
  "agenda entrar",
]

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

function assertCleanText(text: string, label: string) {
  assert(text.trim(), `${label}: resposta vazia`)
  for (const cue of forbiddenText) {
    assert(!hasAny(text, [cue]), `${label}: vazou linguagem interna "${cue}" em "${text}"`)
  }
}

function assertProfile(result: ConversationResponseResolverResult | null, label: string): HumanCommunicationFormatProfile {
  assert(result?.text, `${label}: resultado sem texto`)
  assert(result.intelligence?.formatProfile, `${label}: sem formatProfile`)
  assertCleanText(result.text, label)
  return result.intelligence.formatProfile
}

const toolProvider = (tool: UniversalToolName, input: { message: string }) => {
  const message = input.message.toLowerCase()
  if (tool === "time") return "Hoje é sábado, 13 de junho de 2026."
  if (tool === "web_search") {
    return "O ranking da Netflix muda por país e período. A lista oficial por horas assistidas é a fonte mais segura para saber o filme mais visto agora."
  }
  if (tool === "sports" && /que horas|horarios|horários/.test(message)) {
    return "Você diz os horários dos jogos? Pelo calendário consultado agora:\n\n* Suíça x Catar - 13:00\n* Marrocos x Brasil - 16:00\n* Escócia x Haiti - 19:00"
  }
  if (tool === "sports") return "Hoje aparecem estes jogos:\n\n* Suíça x Catar\n* Marrocos x Brasil\n* Escócia x Haiti\n\nQuer que eu veja os horários também?"
  if (tool === "weather") return "Agora em Ponta Grossa está por volta de 17°C, com vento fraco."
  if (tool === "answer_from_reasoning" && /cacheado|cabelo feminino/.test(message)) {
    return "Claro. Para cabelo feminino cacheado, eu citaria:\n\n* Long bob cacheado\n* Corte em camadas\n* Shaggy cacheado\n\nSe a ideia for valorizar volume, eu tenderia mais para camadas."
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
      { id: "corte", name: "Corte masculino", kind: "service", detail: "corte clássico, social e degradê" },
      { id: "barba", name: "Barba completa", kind: "service", detail: "acabamento e desenho" },
    ],
    professionals: [
      { id: "carlos", name: "Carlos Silva", kind: "professional", detail: "cortes executivos" },
    ],
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

async function runRequiredScenarios() {
  const isolated: ConversationHistoryMessage[] = []

  const simple = await turn("que dia é hoje?", isolated)
  const simpleProfile = assertProfile(simple, "A pergunta simples")
  assert.equal(simpleProfile.structure, "single_paragraph", "A: pergunta simples não deve virar lista")
  assert(!simpleProfile.listUsed, "A: pergunta simples sem lista")
  assert(!simple?.text.includes("?"), "A: pergunta simples não precisa pergunta final")

  const consultive = await turn("quero mudar o visual mas tenho medo", [])
  const consultiveProfile = assertProfile(consultive, "B pedido consultivo")
  assert.equal(consultiveProfile.structure, "hybrid", "B: esperado ritmo híbrido")
  assert(consultiveProfile.listUsed, "B: esperado exemplo/lista")
  assert(consultiveProfile.quoteUsed, "B: esperado pensamento em aspas")
  assert(consultiveProfile.questionUsed, "B: esperado pergunta útil")

  const comparison = await turn("qual melhor, degradê baixo ou corte social?", [])
  const comparisonProfile = assertProfile(comparison, "C comparação")
  assert(["contrast", "bullets", "hybrid"].includes(comparisonProfile.structure), "C: comparação pede contraste/lista")
  assert(comparisonProfile.listUsed, "C: comparação precisa lista ou bullets")

  const steps = await turn("como eu escolho um corte?", [])
  const stepsProfile = assertProfile(steps, "D passo a passo")
  assert.equal(stepsProfile.structure, "numbered_steps", "D: esperado passos numerados")
  assert(stepsProfile.listUsed, "D: passos devem ser lista numerada")

  const transactionalHistory: ConversationHistoryMessage[] = []
  await turn("beleza, quero algo executivo", transactionalHistory)
  const transactional = await turn("tem horário hoje?", transactionalHistory)
  const transactionalProfile = assertProfile(transactional, "E transacional")
  assert.equal(transactionalProfile.structure, "short_paragraphs", "E: transacional precisa preparar ação em parágrafos curtos")
  assert(!hasAny(transactional?.text ?? "", ["serviço ou profissional já estão claros", "agenda entrar"]), "E: sem tom técnico")

  const rejection = await turn("não gostei", transactionalHistory)
  const rejectionProfile = assertProfile(rejection, "F rejeição")
  assert.equal(rejectionProfile.structure, "short_paragraphs", "F: rejeição precisa reconhecer e mudar rota")
  assert(hasAny(rejection?.text ?? "", ["não vou insistir", "nao vou insistir"]), "F: precisa reconhecer rejeição")

  const netflix = await turn("qual filme mais assistido da Netflix?", [])
  const netflixProfile = assertProfile(netflix, "G fora do domínio")
  assert.equal(netflixProfile.structure, "single_paragraph", "G: Netflix deve ser natural e direta")
  assert(!hasAny(netflix?.text ?? "", ["barbearia", "corte", "horário", "horario"]), "G: não pode puxar domínio")

  const explanationHistory: ConversationHistoryMessage[] = []
  await turn("quero mudar o visual mas tenho medo", explanationHistory)
  const explanation = await turn("me explica melhor", explanationHistory)
  const explanationProfile = assertProfile(explanation, "H resposta longa")
  assert(["hybrid", "short_paragraphs", "bullets"].includes(explanationProfile.structure), "H: explicação deve ter estrutura leve")
  assert(explanationProfile.listUsed, "H: explicação precisa quebrar bloco pesado")

  const reproHistory: ConversationHistoryMessage[] = []
  const sports = await turn("qual jogo tem hoje da copa do mundo?", reproHistory)
  const sportsProfile = assertProfile(sports, "I esportes em pt-BR")
  assert(sportsProfile.listUsed, "I: jogos precisam vir em lista")
  assert(hasAny(sports?.text ?? "", ["Suíça x Catar", "Marrocos x Brasil", "Escócia x Haiti"]), "I: jogos precisam estar traduzidos")
  assert(!hasAny(sports?.text ?? "", ["Switzerland at", "Morocco at", "Scotland at"]), "I: não pode vazar inglês")

  const hours = await turn("que horas?", reproHistory)
  assertProfile(hours, "J follow-up que horas")
  assert(hasAny(hours?.text ?? "", ["horários dos jogos", "Suíça x Catar"]), "J: que horas precisa seguir tópico dos jogos")
  assert(!hasAny(hours?.text ?? "", ["hora atual", "sábado"]), "J: que horas não pode responder relógio atual quando o tópico é futebol")

  const curly = await turn("cite 3 cortes de cabelo feminino cacheado", reproHistory)
  const curlyProfile = assertProfile(curly, "K cabelo feminino cacheado")
  assert(curlyProfile.listUsed, "K: cite 3 precisa listar")
  assert(hasAny(curly?.text ?? "", ["Long bob cacheado", "Corte em camadas", "Shaggy cacheado"]), "K: precisa citar 3 cortes femininos cacheados")
  assert(!hasAny(curly?.text ?? "", ["masculino", "executivo"]), "K: não pode herdar corte masculino/executivo")

  console.log("Required scenarios: PASS")
}

async function runAntiMechanicalFormatting() {
  const history: ConversationHistoryMessage[] = []
  const messages = [
    "bom dia",
    "que dia é hoje?",
    "quero mudar o visual mas tenho medo",
    "qual melhor, degradê baixo ou corte social?",
    "como eu escolho um corte?",
    "me explica melhor",
    "beleza, quero algo executivo",
    "quanto custa?",
    "tem horário hoje?",
    "não gostei",
    "tem outro profissional?",
    "qual filme mais assistido da Netflix?",
    "e jogo hoje?",
    "voltando ao corte",
    "quero algo discreto",
    "pode ser",
    "responde direito",
    "não entendi",
    "fechado",
    "obrigado",
  ]
  const structures: string[] = []
  let listCount = 0
  let questionCount = 0
  let emphasisCount = 0

  for (const [index, message] of messages.entries()) {
    const result = await turn(message, history)
    const profile = assertProfile(result, `anti-mecânico turno ${index + 1}`)
    structures.push(profile.structure)
    if (profile.listUsed) listCount += 1
    if (profile.questionUsed) questionCount += 1
    if (profile.emphasisUsed) emphasisCount += 1
    console.log(`${String(index + 1).padStart(2, "0")} ${profile.structure} q=${profile.questionUsed ? "yes" : "no"} list=${profile.listUsed ? "yes" : "no"} text="${result?.text.slice(0, 110)}"`)
  }

  assert(new Set(structures).size >= 4, `anti-mecânico: estruturas pouco variadas (${structures.join(", ")})`)
  assert(listCount > 0, "anti-mecânico: nunca usou lista")
  assert(listCount < messages.length * 0.55, "anti-mecânico: lista usada demais")
  assert(questionCount > 0, "anti-mecânico: nunca usou pergunta")
  assert(questionCount < messages.length * 0.8, "anti-mecânico: quase sempre termina/pergunta")
  assert(emphasisCount < messages.length * 0.45, "anti-mecânico: negrito usado demais")

  console.log("Anti-mechanical formatting: PASS")
}

async function main() {
  await runRequiredScenarios()
  await runAntiMechanicalFormatting()
  console.log("Human Communication Layer Validation: PASS")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
