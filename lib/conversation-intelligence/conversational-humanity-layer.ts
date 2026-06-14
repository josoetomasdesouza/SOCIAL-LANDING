import type {
  ConversationActionRequest,
  ConversationHistoryMessage,
  ConversationIntent,
  ConversationMemory,
  ConversationMode,
  ConversationState,
  ConversationalHumanityProfile,
  NextConversationMove,
  UniversalToolName,
} from "./types"

export interface ConversationalHumanityInput {
  text: string
  userMessage: string
  history: ConversationHistoryMessage[]
  memory: ConversationMemory
  state: ConversationState
  intent: ConversationIntent
  conversationMode?: ConversationMode
  nextMove?: NextConversationMove
  toolRoute?: UniversalToolName
  actionRequest?: ConversationActionRequest
  vertical: string
  brandName: string
}

export interface ConversationalHumanityResult {
  text: string
  humanity: ConversationalHumanityProfile
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

function sentenceCount(value: string) {
  return value.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length
}

function clampScore(value: number) {
  return Math.max(0, Math.min(5, value))
}

function paragraphJoin(parts: string[]) {
  return parts.map((part) => part.trim()).filter(Boolean).join("\n\n")
}

function detectEmotionalState(message: string): ConversationalHumanityProfile["emotionalState"] {
  if (hasAny(message, ["obrigado", "obrigada", "valeu", "brigado"])) return "grateful"
  if (hasAny(message, ["tchau", "fechado", "era isso", "por enquanto é isso", "por enquanto e isso", "não precisa", "nao precisa"])) return "closing"
  if (hasAny(message, ["responde direito", "não entendeu", "nao entendeu", "não fez sentido", "nao fez sentido"])) return "frustrated"
  if (hasAny(message, ["medo", "inseguro", "insegura", "ansioso", "ansiosa", "vergonha", "receio", "fiquei mal", "meio mal", "me envelhece", "pareço velho", "pareco velho", "autoestima"])) return "insecure"
  if (hasAny(message, ["não sei", "nao sei", "dúvida", "duvida", "indeciso", "indecisa", "talvez"])) return "indecisive"
  if (hasAny(message, ["por que", "porque", "como funciona", "me explica", "qual a diferença", "qual a diferenca"])) return "curious"
  return "neutral"
}

function detectPersonalityMode(message: string, emotionalState: ConversationalHumanityProfile["emotionalState"]): ConversationalHumanityProfile["personalityMode"] {
  if (emotionalState === "insecure" || emotionalState === "frustrated") return "supportive"
  if (hasAny(message, ["rápido", "rapido", "direto", "objetivo", "só me diz", "so me diz"])) return "direct"
  if (hasAny(message, ["técnico", "tecnico", "detalhe", "explica", "por quê", "por que", "como funciona"])) return "technical"
  if (emotionalState === "indecisive" || hasAny(message, ["conversar", "trocar ideia", "trocar uma ideia"])) return "exploratory"
  return "warm"
}

function wantsClosure(message: string, emotionalState: ConversationalHumanityProfile["emotionalState"]) {
  return emotionalState === "grateful" || emotionalState === "closing"
}

function isObjective(message: string, mode: ConversationalHumanityProfile["personalityMode"]) {
  return mode === "direct" || hasAny(message, ["que dia", "que horas", "quanto custa", "tem horário", "tem horario", "sim ou não", "sim ou nao"])
}

function isOnlyChat(message: string) {
  return hasAny(message, ["só conversar", "so conversar", "queria conversar", "bater papo", "trocar ideia", "sem agendar"])
}

function curiosityPrompt(input: ConversationalHumanityInput, emotionalState: ConversationalHumanityProfile["emotionalState"]) {
  const message = input.userMessage

  if (wantsClosure(message, emotionalState)) return null
  if (input.intent === "operational_question") return null
  if (input.toolRoute && ["time", "weather", "sports", "news", "web_search"].includes(input.toolRoute)) return null
  if (input.actionRequest?.type && input.actionRequest.type !== "none") return null

  if (hasAny(message, ["mudei de ideia", "na verdade", "pensando melhor"])) {
    return "O que mudou na sua cabeça: o estilo, o preço ou a vontade de fazer agora?"
  }
  if (emotionalState === "insecure") {
    return "Você quer uma mudança que quase ninguém perceba de cara ou quer algo que já dê sensação de renovação?"
  }
  if (emotionalState === "indecisive") {
    return "O que pesa mais para você agora: não errar, mudar de verdade ou manter fácil de arrumar?"
  }
  if (isOnlyChat(message)) {
    return "Você quer só desabafar um pouco ou quer que eu te ajude a organizar a ideia?"
  }

  return null
}

function applyBrevity(text: string, input: ConversationalHumanityInput, personalityMode: ConversationalHumanityProfile["personalityMode"], emotionalState: ConversationalHumanityProfile["emotionalState"]) {
  if (emotionalState === "grateful") return "Imagina. Fico por aqui se você precisar."
  if (emotionalState === "closing") return "Fechado. Sem insistir; fico por aqui se você quiser retomar depois."
  if (!isObjective(input.userMessage, personalityMode)) return text
  if (sentenceCount(text) <= 2 || text.length < 180) return text

  const firstTwo = text.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ").trim()
  return firstTwo || text
}

function recentAssistantSaid(history: ConversationHistoryMessage[], cues: string[]) {
  const recent = history
    .filter((message) => message.role === "ai")
    .slice(-2)
    .map((message) => message.content)
    .join(" ")
  return hasAny(recent, cues)
}

function adaptForEmotion(text: string, input: ConversationalHumanityInput, emotionalState: ConversationalHumanityProfile["emotionalState"]) {
  const cleaned = text.replace(/^Resposta direta,\s*sem precisar abrir mais nada\.?\s*/i, "").trim() || text
  if (emotionalState === "insecure" && !hasAny(text, ["faz sentido", "normal", "sem pressa", "controle"])) {
    return paragraphJoin([
      "Faz sentido ter esse cuidado.",
      cleaned,
    ])
  }
  if (emotionalState === "frustrated" && !hasAny(text, ["você tem razão", "voce tem razao", "não fui claro", "nao fui claro"])) {
    const opener = recentAssistantSaid(input.history, ["você tem razão", "voce tem razao", "não fui claro", "nao fui claro"])
      ? "Foi mal, vou reformular sem rodeio."
      : "Você tem razão, eu não fui claro."
    return paragraphJoin([
      opener,
      cleaned,
    ])
  }
  if (emotionalState === "indecisive" && sentenceCount(cleaned) <= 1) {
    return `${cleaned} Dá para decidir com calma, sem pular direto para uma opção.`.trim()
  }
  return cleaned
}

function applyCuriosity(text: string, prompt: string | null) {
  if (!prompt || text.includes(prompt)) return text
  if (text.includes("?")) return text
  return paragraphJoin([text, prompt])
}

function humanityScore({
  text,
  input,
  emotionalState,
  personalityMode,
  curiosityAdded,
}: {
  text: string
  input: ConversationalHumanityInput
  emotionalState: ConversationalHumanityProfile["emotionalState"]
  personalityMode: ConversationalHumanityProfile["personalityMode"]
  curiosityAdded: boolean
}): ConversationalHumanityProfile {
  const reasons: string[] = []
  const isBriefEnough = isObjective(input.userMessage, personalityMode) ? text.length < 240 : text.length < 700
  const empathetic = emotionalState === "neutral" || hasAny(text, ["faz sentido", "você tem razão", "voce tem razao", "normal", "sem pressa", "justo", "entendo"])
  const deepEnough = emotionalState === "curious" || emotionalState === "insecure" || emotionalState === "indecisive"
    ? sentenceCount(text) >= 2
    : true
  const shouldContinue = !wantsClosure(input.userMessage, emotionalState)

  if (curiosityAdded) reasons.push("curiosity_engine")
  if (isBriefEnough) reasons.push("brevity_engine")
  if (empathetic) reasons.push("emotional_detection")
  if (personalityMode !== "warm") reasons.push("personality_adaptation")
  if (!shouldContinue) reasons.push("closure_respected")

  const curiosity = shouldContinue && (curiosityAdded || text.includes("?")) ? 4.5 : shouldContinue ? 3.4 : 5
  const empathy = empathetic ? 4.4 : 3
  const depth = deepEnough ? 4.2 : 2.8
  const adaptation = personalityMode === "warm" ? 3.8 : 4.6
  const brevity = isBriefEnough ? 4.5 : 3
  const overall = [curiosity, empathy, depth, adaptation, brevity].reduce((sum, value) => sum + value, 0) / 5

  return {
    curiosity: clampScore(curiosity),
    empathy: clampScore(empathy),
    depth: clampScore(depth),
    adaptation: clampScore(adaptation),
    brevity: clampScore(brevity),
    overall: Math.round(clampScore(overall) * 10) / 10,
    emotionalState,
    personalityMode,
    shouldContinue,
    reasons,
  }
}

export function applyConversationalHumanity(input: ConversationalHumanityInput): ConversationalHumanityResult {
  const emotionalState = detectEmotionalState(input.userMessage)
  const personalityMode = detectPersonalityMode(input.userMessage, emotionalState)
  const prompt = curiosityPrompt(input, emotionalState)
  const brief = applyBrevity(input.text, input, personalityMode, emotionalState)
  const emotional = adaptForEmotion(brief, input, emotionalState)
  const text = applyCuriosity(emotional, prompt)
  const humanity = humanityScore({
    text,
    input,
    emotionalState,
    personalityMode,
    curiosityAdded: Boolean(prompt && text.includes(prompt)),
  })

  return { text, humanity }
}
