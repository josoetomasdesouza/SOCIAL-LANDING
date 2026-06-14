import type { LabConversation, LabConversationTurn, LabTool, LabTopicFrame, ScenarioSeed } from "../types"

const GENERAL_TOOL_HINTS: Array<{ cues: string[]; tool: LabTool; topic: string }> = [
  { cues: ["clima", "chover", "temperatura"], tool: "weather", topic: "clima" },
  { cues: ["jogo", "joga hoje", "quem joga", "futebol", "copa"], tool: "sports", topic: "futebol" },
  { cues: ["notícia", "noticias", "manchete"], tool: "news", topic: "noticia" },
  { cues: ["celular mais vendido", "netflix", "atualmente", "agora"], tool: "web_search", topic: "web" },
  { cues: ["que dia", "hora atual"], tool: "time", topic: "tempo" },
  { cues: ["capital", "quem foi", "como funciona"], tool: "reasoning", topic: "curiosidade" },
]

const OPERATIONAL_TOOL_HINTS: Array<{ cues: string[]; tool: LabTool; action: LabConversationTurn["actionRequest"] }> = [
  { cues: ["tem reserva", "reservar mesa", "tem mesa", "mesa externa", "outra mesa"], tool: "booking", action: "show_schedule" },
  { cues: ["entrega hoje", "faz entrega", "entrega", "pronta entrega"], tool: "product_lookup", action: "show_options" },
  { cues: ["aceita cartão", "aceita cartao", "pix", "forma de pagamento", "convênio", "convenio"], tool: "catalog", action: "none" },
  { cues: ["horário", "horario", "agenda", "hoje", "sábado", "sabado", "mais cedo"], tool: "schedule", action: "show_schedule" },
  { cues: ["preço", "preco", "valor", "quanto"], tool: "catalog", action: "show_price" },
  { cues: ["profissional", "barbeiro", "quem atende", "especialista", "professor", "tosador"], tool: "service_lookup", action: "show_professionals" },
  { cues: ["estoque", "produto", "modelo", "tamanho", "número"], tool: "product_lookup", action: "show_options" },
  { cues: ["vocês fazem", "voces fazem", "fazem ", "corta", "cortam", "atende", "atendem", "serviço", "servico", "tem profissional", "tem especialista", "tem criança", "tem crianca"], tool: "service_lookup", action: "none" },
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

function classifyTool(message: string, activeTopic?: string): { tool: LabTool; topic: string; action: LabConversationTurn["actionRequest"] } {
  if (hasAny(message, ["que horas", "horários", "horarios"]) && activeTopic === "futebol") {
    return { tool: "sports", topic: "futebol", action: "none" }
  }

  if (hasAny(message, ["qual você escolheria", "qual voce escolheria", "qual você assistiria", "qual voce assistiria"]) && activeTopic === "futebol") {
    return { tool: "sports", topic: "futebol", action: "none" }
  }

  if (hasAny(message, ["que horas", "horários", "horarios"]) && activeTopic === "operacional") {
    return { tool: "schedule", topic: "operacional", action: "show_schedule" }
  }

  for (const hint of GENERAL_TOOL_HINTS) {
    if (hasAny(message, hint.cues)) return { tool: hint.tool, topic: hint.topic, action: "none" }
  }

  for (const hint of OPERATIONAL_TOOL_HINTS) {
    if (hasAny(message, hint.cues)) return { tool: hint.tool, topic: "operacional", action: hint.action }
  }

  if (hasAny(message, ["vale a pena", "compensa", "serve", "e ai", "e aí"])) {
    return { tool: "reasoning", topic: "ambiguidade", action: "none" }
  }

  return { tool: "reasoning", topic: "descoberta", action: "none" }
}

function pushTopic(stack: LabTopicFrame[], topic: string) {
  const current = stack.find((frame) => frame.state === "active")?.topic
  if (!current) return [{ topic, state: "active" as const }]
  if (current === topic) return stack

  return [
    ...stack
      .map((frame) => frame.state === "active" ? { ...frame, state: "paused" as const } : frame)
      .slice(-2),
    { topic, state: "active" as const },
  ]
}

function returnToBusinessTopic(stack: LabTopicFrame[], fallbackTopic: string) {
  const paused = stack
    .slice()
    .reverse()
    .find((frame) => frame.state === "paused" && ["operacional", "descoberta", fallbackTopic].includes(frame.topic))

  const topic = paused?.topic ?? fallbackTopic
  return [
    ...stack
      .filter((frame) => frame.topic !== topic)
      .map((frame) => ({ ...frame, state: "paused" as const }))
      .slice(-2),
    { topic, state: "active" as const },
  ]
}

function answerGeneral(message: string, tool: LabTool) {
  if (tool === "time") return "Hoje é sábado, 13 de junho de 2026. Se você quiser a hora exata, eu também posso te situar."
  if (tool === "weather") return "Para clima atual, eu consultaria a previsão em tempo real. Sem essa consulta, não vou cravar chuva ou temperatura."
  if (tool === "sports" && hasAny(message, ["que horas", "horários", "horarios"])) return "Você está perguntando os horários desses jogos. Nesse caso, eu responderia com a lista de partidas e horários consultados."
  if (tool === "sports" && hasAny(message, ["qual você", "qual voce"])) return "Se eu tivesse que escolher um, eu olharia o jogo com mais contexto e rivalidade, não só o mais forte tecnicamente."
  if (tool === "sports") return "Hoje aparecem jogos no calendário consultado. Se você perguntar 'que horas?', vou entender como horários desses jogos, não como relógio atual."
  if (tool === "news") return "Notícias mudam rápido, então eu trataria isso como consulta atual. Posso resumir as manchetes e depois aprofundar a que importar mais."
  if (tool === "web_search") return "Isso depende do período e da fonte. Para dado atual, eu buscaria a fonte mais recente em vez de responder de memória."
  if (hasAny(message, ["capital da australia", "capital da austrália"])) {
    return "A capital da Austrália é Canberra. Muita gente pensa em Sydney porque ela é mais conhecida internacionalmente, mas a capital oficial é Canberra."
  }
  return "Dá para responder isso como assunto geral. Primeiro eu resolveria a pergunta e só depois retomaria o que ficou pausado."
}

function answerOperational(message: string, expectedTool: LabTool, scenario: ScenarioSeed) {
  if (expectedTool === "schedule") {
    return `Dá para verificar, mas eu não vou inventar horário. Como o objetivo era ${scenario.initialGoal.toLowerCase()}, eu consultaria agenda antes de confirmar disponibilidade.`
  }
  if (expectedTool === "catalog") {
    return "Para preço, eu preciso consultar o catálogo ou a configuração da oferta. Não vou cravar valor sem dado confirmado."
  }
  if (expectedTool === "product_lookup") {
    return "Para estoque ou modelo específico, eu preciso consultar os dados da loja. Sem isso, posso ajudar nos critérios, mas não prometer disponibilidade."
  }
  if (expectedTool === "service_lookup") {
    return "A pergunta real aqui é se esse atendimento existe. Eu responderia sim ou não apenas se o catálogo confirmar; se não confirmar, eu diria que precisa verificar."
  }
  return "Essa é uma pergunta operacional. Eu responderia com dado confirmado ou deixaria explícito que precisa verificar."
}

function answerReasoning(message: string, scenario: ScenarioSeed, stack: LabTopicFrame[]) {
  if (hasAny(message, ["vale a pena", "compensa", "serve"])) {
    return "\"Vale a pena\" depende do que você está tentando decidir. Você está falando de produto, investimento, serviço ou agenda?"
  }
  if (hasAny(message, ["voltando", "retomando", "e o horario", "e o horário"])) {
    const active = stack.find((frame) => frame.state === "active")?.topic ?? "assunto"
    return `Sobre o assunto que ficou pausado: antes de avançar, eu retomaria o ponto exato em que paramos e perguntaria o próximo critério que ainda falta.`
      .replace("assunto que ficou pausado", active === "futebol" ? "jogos" : "assunto que ficou pausado")
  }
  if (hasAny(message, ["trabalho", "comprar", "notebook", "perfume", "corolla", "civic", "apartamento", "100 mil"])) {
    return "Antes de recomendar, eu entenderia uso, restrições, orçamento e objetivo. A resposta boa não escolhe cedo demais; ela reduz incerteza."
  }
  if (hasAny(message, ["chefe", "relacionamento", "não gosta", "nao gosta"])) {
    return "Eu separaria sensação de evidência. O que aconteceu exatamente: um episódio específico ou um padrão repetido?"
  }
  if (hasAny(message, ["peso", "saúde", "saude", "alimentação", "alimentacao"])) {
    return "Antes de plano, eu entenderia rotina e principal dificuldade. Balança sozinha não explica o problema inteiro."
  }

  return `Eu conduziria por ${scenario.cognitivePattern}: responder o que foi perguntado, identificar o critério faltante e só então avançar.`
}

function buildAssistantReply({
  message,
  expectedTool,
  scenario,
  stack,
}: {
  message: string
  expectedTool: LabTool
  scenario: ScenarioSeed
  stack: LabTopicFrame[]
}) {
  if (["weather", "sports", "news", "web_search", "time"].includes(expectedTool)) {
    return answerGeneral(message, expectedTool)
  }
  if (["catalog", "schedule", "service_lookup", "product_lookup"].includes(expectedTool)) {
    return answerOperational(message, expectedTool, scenario)
  }
  return answerReasoning(message, scenario, stack)
}

function injectedFailureFor(scenario: ScenarioSeed, index: number) {
  if (scenario.id === "barber-complaint" && index === 6) return "classifier_answer"
  if (scenario.id === "weather-trip" && index === 4) return "missing_weather_tool"
  if (scenario.id === "consultorio-price" && index === 5) return "invented_schedule"
  if (scenario.id === "sports-games" && index === 7) return "internal_leak"
  if (scenario.id === "mixed-free-chat" && index === 9) return "forced_business_return"
  return undefined
}

function applyInjectedFailure(reply: string, failure?: string) {
  if (failure === "classifier_answer") return "Isso é outro assunto. Vou tratar separado do contexto atual."
  if (failure === "missing_weather_tool") return "Vai chover sim hoje, pode confiar."
  if (failure === "invented_schedule") return "Tem horário hoje às 15h confirmado."
  if (failure === "internal_leak") return "Pelo topicStack e actionRequest, a tool sports deveria responder isso."
  if (failure === "forced_business_return") return "Interessante, mas voltando para serviço e agenda, posso mostrar horários."
  return reply
}

function buildUserMessages(scenario: ScenarioSeed) {
  const messages = [
    scenario.initialGoal,
    ...scenario.implicitFollowUps.slice(0, 2),
    scenario.generalQuestions[0] ?? "que dia é hoje?",
    scenario.topicShifts[0] ?? "capital da Austrália",
    "interessante",
    scenario.ambiguousQuestions[0] ?? "vale a pena?",
    scenario.operationalQuestions[0] ?? "quanto custa?",
    "me explica melhor",
    scenario.generalQuestions[1] ?? "qual jogo tem hoje?",
    "que horas?",
    "qual você escolheria?",
    "voltando ao que falávamos",
    scenario.implicitFollowUps[2] ?? "e hoje?",
    scenario.operationalQuestions[1] ?? "tem horário hoje?",
    "não gostei",
    "tem outra opção?",
    "pode ser",
  ]

  return messages.slice(0, Math.max(15, Math.min(40, messages.length)))
}

export function simulateConversation(scenario: ScenarioSeed, runId: string): LabConversation {
  return simulateConversationFromMessages(scenario, runId, buildUserMessages(scenario))
}

export function simulateConversationFromMessages(
  scenario: ScenarioSeed,
  runId: string,
  messages: string[]
): LabConversation {
  const fallbackTopic = scenario.businessVertical === "appointment" ? "operacional" : "descoberta"
  let topicStack: LabTopicFrame[] = [{ topic: "descoberta", state: "active" }]

  const turns = messages.map((message, offset): LabConversationTurn => {
    const index = offset + 1
    const topicStackBefore = topicStack.map((frame) => ({ ...frame }))
    const activeTopic = topicStackBefore.find((frame) => frame.state === "active")?.topic
    const classified = classifyTool(message, activeTopic)
    const wantsReturn = hasAny(message, ["voltando", "retomando", "e o horario", "e o horário"])

    topicStack = wantsReturn
      ? returnToBusinessTopic(topicStack, fallbackTopic)
      : pushTopic(topicStack, classified.topic)

    const injectedFailure = injectedFailureFor(scenario, index)
    const actualTool = injectedFailure === "missing_weather_tool" ? "none" : classified.tool
    const baseReply = buildAssistantReply({ message, expectedTool: classified.tool, scenario, stack: topicStackBefore })
    const assistant = applyInjectedFailure(baseReply, injectedFailure)

    return {
      index,
      user: message,
      assistant,
      expectedTool: classified.tool,
      actualTool,
      topicStackBefore,
      topicStackAfter: topicStack.map((frame) => ({ ...frame })),
      actionRequest: classified.action,
      visualBlock: classified.action !== "none" && index > 12,
      expectedBehavior: scenario.cognitivePattern,
      injectedFailure,
    }
  })

  return {
    id: `${runId}-${scenario.id}`,
    mode: "mock",
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    persona: scenario.persona,
    initialGoal: scenario.initialGoal,
    domain: scenario.domain,
    cognitivePattern: scenario.cognitivePattern,
    generatedAt: new Date().toISOString(),
    turns,
  }
}

export function simulateConversations(scenarios: ScenarioSeed[], runId = `run-${Date.now()}`) {
  return scenarios.map((scenario) => simulateConversation(scenario, runId))
}
