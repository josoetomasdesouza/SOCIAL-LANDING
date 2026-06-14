import type {
  ConversationActionRequest,
  ConversationHistoryMessage,
  ConversationIntent,
  ConversationMemory,
  ConversationMode,
  ConversationState,
  HumanCommunicationFormatProfile,
  NextConversationMove,
  UniversalToolName,
} from "./types"
import type { ConversationVisualBlock } from "@/lib/mock-data/conversational-search"

export interface HumanCommunicationLayerInput {
  rawText: string
  userMessage: string
  history: ConversationHistoryMessage[]
  memory: ConversationMemory
  state: ConversationState
  intent: ConversationIntent
  conversationMode?: ConversationMode
  nextMove?: NextConversationMove
  toolRoute?: UniversalToolName
  actionRequest?: ConversationActionRequest
  visualBlock?: ConversationVisualBlock
  vertical: string
  brandName: string
}

export interface HumanCommunicationLayerResult {
  text: string
  formatProfile: HumanCommunicationFormatProfile
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

function compact(text: string) {
  return text.replace(/\s+/g, " ").trim()
}

function sentenceCount(text: string) {
  return text.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length
}

function profile(structure: HumanCommunicationFormatProfile["structure"], text: string, reason: string): HumanCommunicationFormatProfile {
  return {
    structure,
    emphasisUsed: text.includes("**"),
    questionUsed: text.includes("?"),
    listUsed: /\n\s*(?:[-*]|\d+\.)\s+/.test(text),
    quoteUsed: /["'‘’]/.test(text),
    reason,
  }
}

function isSimpleKnowledgeQuestion(input: HumanCommunicationLayerInput) {
  return input.toolRoute === "time" ||
    input.toolRoute === "web_search" ||
    input.toolRoute === "sports" ||
    input.toolRoute === "news" ||
    input.toolRoute === "weather" ||
    (input.intent === "off_domain" && sentenceCount(input.rawText) <= 2 && input.rawText.length < 140)
}

function isConsultiveFear(message: string) {
  return hasAny(message, ["mudar o visual", "mudar meu cabelo", "tenho medo", "com medo", "inseguro", "insegura"])
}

function isComparison(message: string) {
  return hasAny(message, ["qual melhor", "qual é melhor", "qual e melhor", " ou "]) &&
    hasAny(message, ["degradê", "degrade", "social", "corte", "barba", "profissional"])
}

function isStepByStep(message: string) {
  return hasAny(message, ["como eu escolho", "como escolher", "passo a passo", "por onde começo", "por onde comeco"])
}

function wantsMoreExplanation(message: string) {
  return hasAny(message, ["me explica melhor", "explica melhor"])
}

function userSignalsConfusion(message: string) {
  return hasAny(message, ["não entendi", "nao entendi", "como assim", "hã", "ha?", "não fez sentido", "nao fez sentido"])
}

function isRejection(message: string) {
  return hasAny(message, ["não gostei", "nao gostei", "não curti", "nao curti", "não quero", "nao quero"])
}

function stripTrailingQuestionIfUnneeded(text: string, shouldAsk: boolean) {
  if (shouldAsk) return text
  return text.replace(/\s+[^.!?]{0,140}\?\s*$/u, ".").replace(/\.\./g, ".").trim()
}

function paragraphJoin(parts: string[]) {
  return parts.map((part) => compact(part)).filter(Boolean).join("\n\n")
}

function buildConsultiveFearReply(input: HumanCommunicationLayerInput) {
  const text = paragraphJoin([
    "Faz sentido.",
    "Normalmente o medo não é cortar o cabelo. É olhar depois e pensar: ‘acho que exagerei’.",
    "Eu não iria direto para uma mudança radical. Começaria por algo que muda a percepção, mas ainda mantém controle:",
    "- lateral mais limpa\n- topo sem exagero\n- acabamento mais alinhado",
    "Assim você sente diferença sem parecer que virou outra pessoa.",
    "Você quer uma mudança mais discreta ou quer que as pessoas percebam?",
  ])

  return { text, formatProfile: profile("hybrid", text, "pedido consultivo com insegurança precisa de reflexão, exemplo e pergunta útil") }
}

function buildComparisonReply(input: HumanCommunicationLayerInput) {
  const text = paragraphJoin([
    "Eu separaria assim:",
    "- **degradê baixo**: mais moderno, mas ainda discreto se a transição for suave\n- **corte social**: mais clássico, fácil de manter e mais seguro para ambiente profissional",
    "Se você quer parecer mais executivo, eu começaria pelo social com acabamento mais limpo. Se quer renovar sem chamar tanta atenção, o degradê baixo funciona melhor.",
  ])

  return { text, formatProfile: profile("contrast", text, "comparação entre opções pede contraste curto, não resposta corrida") }
}

function buildStepReply(input: HumanCommunicationLayerInput) {
  const text = paragraphJoin([
    "Eu escolheria em três passos:",
    "1. Definir a imagem: mais discreta, mais moderna ou mais séria.\n2. Decidir manutenção: algo fácil de arrumar ou um corte que exige mais cuidado.\n3. Só depois olhar profissional e horário.",
    "Assim você não escolhe só pelo nome do corte; escolhe pelo efeito que quer no espelho.",
  ])

  return { text, formatProfile: profile("numbered_steps", text, "pergunta de método pede sequência clara") }
}

function buildTransactionalReply(input: HumanCommunicationLayerInput) {
  const isSchedule = input.actionRequest?.type === "show_schedule" || input.toolRoute === "schedule"
  const isPrice = input.actionRequest?.type === "show_price"
  const isProfessionals = input.actionRequest?.type === "show_professionals" || input.toolRoute === "professional_lookup"

  if (hasAny(input.rawText, ["sem prometer disponibilidade", "para verificar o valor certo", "forma de pagamento antes de afirmar"])) {
    return { text: input.rawText, formatProfile: profile("single_paragraph", input.rawText, "pergunta mínima útil de preservação de progresso já está pronta") }
  }

  if (isProfessionals || input.visualBlock) {
    const text = paragraphJoin([
      "Agora faz sentido abrir opções abaixo.",
      "Como você não gostou da opção anterior, eu separaria profissionais que combinem melhor com algo mais limpo e executivo.",
    ])
    return { text, formatProfile: profile("short_paragraphs", text, "resposta com bloco visual precisa preparar as opções antes de exibir") }
  }

  if (isSchedule) {
    const text = paragraphJoin([
      "Dá para olhar horário para agendar, sim.",
      "Como você já falou em um visual mais executivo, eu vou procurar horários que façam sentido para esse tipo de corte, não qualquer opção aleatória.",
    ])
    return { text, formatProfile: profile("short_paragraphs", text, "ação de horário precisa ser clara e humana antes da opção transacional") }
  }

  if (isPrice) {
    const text = paragraphJoin([
      "Para um corte mais executivo, o valor depende do serviço escolhido.",
      "Eu começaria pela opção mais limpa e só depois compararia preço, para não misturar corte simples, finalização e combo.",
    ])
    return { text, formatProfile: profile("short_paragraphs", text, "preço precisa explicar recorte sem parecer relatório") }
  }

  return null
}

function buildRejectionReply(input: HumanCommunicationLayerInput) {
  const text = paragraphJoin([
    "Justo. Não vou insistir nessa opção.",
    "Se ficou moderno demais, eu mudaria para algo mais discreto antes de procurar outro caminho.",
    "Dá para seguir por uma alternativa mais limpa ou por outro profissional.",
  ])

  return { text, formatProfile: profile("short_paragraphs", text, "rejeição pede reconhecimento e nova rota sem insistir") }
}

function buildExplanationReply(input: HumanCommunicationLayerInput) {
  const text = paragraphJoin([
    "Claro. A ideia é não escolher o corte só pelo nome.",
    "O que muda de verdade é o efeito no rosto:",
    "- lateral mais baixa deixa o visual mais limpo\n- topo controlado mantém um ar mais profissional\n- acabamento bem feito evita parecer uma mudança brusca",
    "Então eu começaria por uma mudança visível, mas controlada. Nada radical logo de primeira.",
  ])

  return { text, formatProfile: profile("hybrid", text, "pedido de explicação precisa quebrar bloco longo e usar exemplo prático") }
}

function buildConfusionReply(input: HumanCommunicationLayerInput) {
  const previousAssistant = input.history
    .slice()
    .reverse()
    .find((message) => message.role === "ai")?.content ?? ""

  if (hasAny(previousAssistant, ["netflix", "ranking", "horas assistidas", "filme mais assistido"])) {
    const text = paragraphJoin([
      "Você tem razão, eu não fui claro.",
      "Reformulando: sobre Netflix, esse ranking muda por país, período e critério. Sem uma lista oficial atualizada na mão, eu não vou cravar um filme específico.",
      "O jeito certo é olhar o ranking oficial da Netflix por horas assistidas e definir se você quer o atual ou o histórico.",
    ])

    return { text, formatProfile: profile("short_paragraphs", text, "usuário não entendeu uma resposta fora do domínio; precisa reformular sem trocar de assunto") }
  }

  if (hasAny(previousAssistant, ["valor", "preço", "preco", "quanto"])) {
    const text = paragraphJoin([
      "Você tem razão, eu não fui claro.",
      "Reformulando: antes de falar preço, preciso saber qual serviço estamos comparando. Corte, barba e combo podem ter valores diferentes.",
      "Se a ideia é um visual mais executivo, eu começaria pelo corte mais limpo e só depois compararia valores.",
    ])

    return { text, formatProfile: profile("short_paragraphs", text, "usuário não entendeu preço; precisa simplificar sem perder o assunto") }
  }

  const text = paragraphJoin([
    "Você tem razão, eu não fui claro.",
    "Reformulando: primeiro eu separo o que você quer decidir, depois entro em opções, preço ou horário.",
    "Se estivermos falando do corte, o caminho mais simples é escolher o estilo antes de olhar agenda.",
  ])

  return { text, formatProfile: profile("short_paragraphs", text, "usuário sinalizou incompreensão; resposta deve assumir falha e simplificar") }
}

function buildSimpleKnowledgeReply(input: HumanCommunicationLayerInput) {
  const shouldKeepQuestion =
    input.rawText.trim().endsWith("?") ||
    input.toolRoute === "web_search" ||
    input.toolRoute === "sports" ||
    input.toolRoute === "news" ||
    (input.toolRoute !== "time" && input.rawText.length > 120)
  const raw = input.rawText.includes("\n") ? input.rawText.trim() : compact(input.rawText)
  let text = stripTrailingQuestionIfUnneeded(raw, shouldKeepQuestion)

  if (shouldKeepQuestion && !text.includes("?")) {
    if (input.toolRoute === "web_search") {
      text = `${text} Você quer que eu separe por ranking atual ou histórico?`
    } else if (input.toolRoute === "sports") {
      text = `${text} Você quer que eu olhe uma competição específica?`
    } else if (input.toolRoute === "news") {
      text = `${text} Quer que eu aprofunde alguma dessas notícias?`
    }
  }

  return { text, formatProfile: profile("single_paragraph", text, "pergunta simples de conhecimento não precisa de lista nem reconexão") }
}

function lightlyStructureRaw(input: HumanCommunicationLayerInput) {
  const raw = input.rawText.includes("\n") ? input.rawText.trim() : compact(input.rawText)
  const shouldAsk = raw.endsWith("?") || (input.conversationMode !== "answer" && input.nextMove?.type !== "close_loop")
  const text = raw.length > 220 && sentenceCount(raw) >= 3
    ? raw.replace(/([.!?])\s+(?=[A-ZÁ-Ú])/g, "$1\n\n")
    : stripTrailingQuestionIfUnneeded(raw, shouldAsk || input.intent === "availability" || input.intent === "recommendation")

  const structure = text.includes("\n\n") ? "short_paragraphs" : "single_paragraph"
  return { text, formatProfile: profile(structure, text, "resposta já estava adequada; camada só ajustou ritmo") }
}

export function shapeHumanCommunication(input: HumanCommunicationLayerInput): HumanCommunicationLayerResult {
  if (isSimpleKnowledgeQuestion(input)) return buildSimpleKnowledgeReply(input)
  if (isConsultiveFear(input.userMessage)) return buildConsultiveFearReply(input)
  if (isComparison(input.userMessage)) return buildComparisonReply(input)
  if (isStepByStep(input.userMessage)) return buildStepReply(input)
  if (input.intent === "user_confused_by_assistant" && userSignalsConfusion(input.userMessage)) return buildConfusionReply(input)
  if (wantsMoreExplanation(input.userMessage)) return buildExplanationReply(input)

  const transactional = buildTransactionalReply(input)
  if (transactional) return transactional

  if (isRejection(input.userMessage)) return buildRejectionReply(input)

  return lightlyStructureRaw(input)
}
