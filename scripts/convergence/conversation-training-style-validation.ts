import { strict as assert } from "node:assert"
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

function assertNoChatbotSmell(text: string, label: string) {
  assert(!hasAny(text, [
    "isso é outro assunto",
    "isso e outro assunto",
    "contexto atual",
    "actionrequest",
    "visualblock",
    "qual serviço deseja",
    "qual servico deseja",
    "posso responder isso como conversa geral",
  ]), `${label}: cheiro de chatbot/sistema: ${text}`)
}

const toolProvider = (tool: UniversalToolName, input: { message: string }) => {
  const message = normalize(input.message)

  if (tool === "sports" && /que horas|horarios|horários/.test(message)) {
    return "Você está falando dos jogos que eu citei agora, certo?\n\n* Brasil x Argentina - 16:00\n* França x Espanha - 19:00\n* Alemanha x Itália - 21:00"
  }
  if (tool === "sports") {
    return "Hoje aparecem estes jogos:\n\n* Brasil x Argentina\n* França x Espanha\n* Alemanha x Itália\n\nSe quiser, também posso mostrar os horários."
  }
  if (tool === "web_search" && hasAny(message, ["samsung", "celular"])) {
    return "Isso muda por país e período. De forma geral, a linha Galaxy A costuma liderar vendas porque ocupa uma faixa de preço muito ampla. Você está pesquisando por curiosidade ou pensando em trocar de aparelho?"
  }

  return null
}

const baseResolver: ConversationResponseResolver = async () => ({
  text: "Resposta genérica do resolver antigo.",
})

const resolver = createConversationIntelligenceResolver({
  brandName: "Barba Negra",
  baseResolver,
  actionResolver: baseResolver,
  toolProvider,
  catalogSummary: {
    services: [
      { id: "corte", name: "Corte masculino", kind: "service", detail: "Corte tradicional" },
      { id: "barba", name: "Barba completa", kind: "service", detail: "Aparar e hidratar" },
    ],
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
  const text = result?.text ?? ""
  history.push({ role: "user", content: message })
  history.push({ role: "ai", content: text, visualBlock: result?.visualBlock })
  assert(text.length > 40, `resposta curta demais para "${message}": ${text}`)
  assertNoChatbotSmell(text, message)
  return text
}

async function runHairDecisionScenario() {
  const history: ConversationHistoryMessage[] = []

  const start = await turn("Estou pensando em cortar o cabelo.", history)
  assert(hasAny(start, ["fazendo pensar", "comprimento", "mudar", "visual"]), `corte aberto não explorou motivo: ${start}`)

  const bored = await turn("Acho que enjoei.", history)
  assert(hasAny(bored, ["mesma imagem", "objetivo", "moderno", "sério", "serio", "elegante", "diferente"]), `enjoei não explorou objetivo: ${bored}`)

  const modern = await turn("Mais moderno.", history)
  assert(hasAny(modern, ["textura", "laterais", "menos tradicional", "liso", "ondulado", "cacheado"]), `moderno não abriu critérios certos: ${modern}`)

  const curly = await turn("Cacheado.", history)
  assert(hasAny(curly, ["cabelo liso", "camadas", "degradê", "degrade", "referência", "referencia"]), `cacheado não adaptou recomendação: ${curly}`)
}

async function runProductScenario() {
  const history: ConversationHistoryMessage[] = []

  const pomade = await turn("Qual pomada você recomenda?", history)
  assert(hasAny(pomade, ["resultado", "alta fixação", "fixacao", "aspecto seco", "brilho", "volume"]), `pomada recomendou sem critério: ${pomade}`)

  const matte = await turn("Aspecto seco.", history)
  assert(hasAny(matte, ["matte", "sem brilho", "cabelo é curto", "cabelo e curto", "curto ou médio", "curto ou medio"]), `aspecto seco não seguiu produto: ${matte}`)
}

async function runGeneralResearchScenario() {
  const phoneHistory: ConversationHistoryMessage[] = []
  const samsung = await turn("Qual o celular Samsung mais vendido atualmente?", phoneHistory)
  assert(hasAny(samsung, ["muda", "país", "pais", "período", "periodo", "galaxy a", "trocar de aparelho"]), `Samsung não respondeu com nuance: ${samsung}`)

  const moneyHistory: ConversationHistoryMessage[] = []
  const money = await turn("Eu tenho R$ 100 mil. O que faço?", moneyHistory)
  assert(hasAny(money, ["evitar responder imediatamente", "reserva", "imóvel", "imovel", "aposentadoria", "dois anos"]), `dinheiro aberto não pediu objetivo: ${money}`)
}

async function runImplicitFollowUpScenario() {
  const history: ConversationHistoryMessage[] = []

  const games = await turn("Quais jogos tem hoje?", history)
  assert(hasAny(games, ["Brasil x Argentina", "França x Espanha", "Alemanha x Itália"]), `jogos não listou partidas: ${games}`)

  const hours = await turn("Que horas?", history)
  assert(hasAny(hours, ["jogos que eu citei", "Brasil x Argentina", "16:00", "19:00", "21:00"]), `que horas não seguiu jogos: ${hours}`)
  assert(!hasAny(hours, ["hora atual", "hoje é sábado"]), `que horas respondeu relógio atual: ${hours}`)

  const pick = await turn("Qual você assistiria?", history)
  assert(hasAny(pick, ["Brasil x Argentina", "expectativa", "repercussão", "repercussao"]), `opinião sobre jogo não usou contexto: ${pick}`)
}

async function runNotebookScenario() {
  const history: ConversationHistoryMessage[] = []

  const start = await turn("Quero comprar um notebook.", history)
  assert(hasAny(start, ["uso", "trabalho", "estudo", "programação", "programacao", "vídeo", "video", "jogos"]), `notebook não perguntou uso: ${start}`)

  const work = await turn("Trabalho.", history)
  assert(hasAny(work, ["navegador", "planilhas", "reuniões", "reunioes", "documentos", "softwares mais pesados"]), `trabalho não refinou uso: ${work}`)

  const lightWork = await turn("Navegador e planilhas.", history)
  assert(hasAny(lightWork, ["não vale a pena", "nao vale a pena", "bateria", "16 gb", "ssd", "orçamento", "orcamento"]), `uso leve não priorizou critérios: ${lightWork}`)

  const budget = await turn("Até 5 mil.", history)
  assert(hasAny(budget, ["desempenho que nunca usa", "casa", "leva", "vários lugares", "varios lugares"]), `orçamento não perguntou mobilidade: ${budget}`)
}

async function runHealthPerfumeEmotionAndComparisonScenarios() {
  const healthHistory: ConversationHistoryMessage[] = []
  const overweight = await turn("Estou acima do peso.", healthHistory)
  assert(hasAny(overweight, ["estética", "estetica", "saúde", "saude", "ambos"]), `peso não perguntou eixo: ${overweight}`)
  const both = await turn("Ambos.", healthHistory)
  assert(hasAny(both, ["balança", "balanca", "peso", "altura"]), `ambos não pediu peso/altura: ${both}`)
  const metrics = await turn("95 kg e 1,78.", healthHistory)
  assert(hasAny(metrics, ["rotina", "alimentação", "alimentacao", "exercício", "exercicio", "sono"]), `métricas não foram para rotina: ${metrics}`)

  const perfumeHistory: ConversationHistoryMessage[] = []
  const perfume = await turn("Qual perfume você recomenda?", perfumeHistory)
  assert(hasAny(perfume, ["impressão", "impressao", "elegante", "discreto", "marcante", "trabalho"]), `perfume recomendou sem impressão desejada: ${perfume}`)
  const workPerfume = await turn("Trabalho.", perfumeHistory)
  assert(hasAny(workPerfume, ["versáteis", "versateis", "ambientes fechados", "invasivo", "amadeirados", "cítricos", "citricos"]), `perfume trabalho não refinou perfil: ${workPerfume}`)

  const bossHistory: ConversationHistoryMessage[] = []
  const boss = await turn("Acho que meu chefe não gosta de mim.", bossHistory)
  assert(hasAny(boss, ["o que te faz pensar", "episódio", "episodio", "sensação", "sensacao"]), `chefe emocional não pediu evidência: ${boss}`)
  const praise = await turn("Ele elogia os outros e quase nunca me elogia.", bossHistory)
  assert(hasAny(praise, ["frustrante", "hipóteses", "hipoteses", "feedback direto", "estilo frio"]), `chefe não separou hipóteses: ${praise}`)

  const ambiguousHistory: ConversationHistoryMessage[] = []
  const worth = await turn("Vale a pena?", ambiguousHistory)
  assert(hasAny(worth, ["contexto", "produto", "investimento", "serviço", "servico", "decisão", "decisao"]), `vale a pena não pediu contexto: ${worth}`)
  const apartment = await turn("Comprar um apartamento.", ambiguousHistory)
  assert(hasAny(apartment, ["morar", "investimento"]), `apartamento não perguntou finalidade: ${apartment}`)

  const carHistory: ConversationHistoryMessage[] = []
  const car = await turn("Corolla ou Civic?", carHistory)
  assert(hasAny(car, ["conforto", "confiabilidade", "liquidez", "condução", "conducao", "esportivo", "qual ano"]), `comparação não usou critérios: ${car}`)
}

async function main() {
  await runHairDecisionScenario()
  await runProductScenario()
  await runGeneralResearchScenario()
  await runImplicitFollowUpScenario()
  await runNotebookScenario()
  await runHealthPerfumeEmotionAndComparisonScenarios()

  console.log("Conversation Training Style Validation: PASS")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
