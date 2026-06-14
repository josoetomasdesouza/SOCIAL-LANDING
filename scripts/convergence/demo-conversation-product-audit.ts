import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { chromium, type Page } from "playwright"

interface AuditTurn {
  user: string
  ai: string
  visualBlock: boolean
  structureUsed?: string
  emphasisUsed?: boolean
  listUsed?: boolean
  questionUsed?: boolean
  formatAdequate?: boolean
  formatReason?: string
  naturalNextStep: boolean
  earlyCard: boolean
  contextLoss: boolean
  repeatedOpening: boolean
  highSimilarity: boolean
  internalLanguage: boolean
  score: number
}

interface AuditScenario {
  id: string
  label: string
  messages: string[]
}

interface AuditScenarioResult extends AuditScenario {
  turns: AuditTurn[]
  issues: string[]
  overallScore: number
}

const BASE = (process.env.DEMO_URL ?? "http://localhost:3007/demo?composer-layout=v2").replace(
  "127.0.0.1",
  "localhost"
)
const OUT = join(process.cwd(), ".review", "conversation-product-audit.json")
const VIEWPORT = { width: 390, height: 844 }

const scenarios: AuditScenario[] = [
  {
    id: "indecisive",
    label: "Usuário indeciso",
    messages: ["quero cortar o cabelo", "algo discreto"],
  },
  {
    id: "direct",
    label: "Usuário direto",
    messages: ["barba completa"],
  },
  {
    id: "confused",
    label: "Usuário confuso",
    messages: ["não sei direito, só quero ficar mais arrumado"],
  },
  {
    id: "topic-change",
    label: "Usuário muda de assunto",
    messages: ["quero cortar o cabelo", "na verdade queria saber se tem estacionamento"],
  },
  {
    id: "off-domain",
    label: "Usuário fora do domínio",
    messages: ["quem foi silvio santos?"],
  },
  {
    id: "off-domain-confusion",
    label: "Fora do domínio + incompreensão",
    messages: ["bom dia", "qual o filme mais assistido na netflix?", "nao entendi"],
  },
  {
    id: "fast-booking",
    label: "Usuário quer agendar rápido",
    messages: ["quero horário hoje com Carlos"],
  },
  {
    id: "rejecting-options",
    label: "Usuário rejeita opções",
    messages: ["barba completa", "não gostei"],
  },
  {
    id: "anti-repetition-natural-language",
    label: "Anti-repetition natural language",
    messages: [
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
    ],
  },
  {
    id: "human-communication-natural-formatting",
    label: "Human communication natural formatting",
    messages: [
      "bom dia",
      "que dia é hoje?",
      "quero mudar meu cabelo mas tenho medo",
      "qual melhor, degradê baixo ou social?",
      "me explica melhor",
      "beleza, quero algo executivo",
      "quanto custa?",
      "tem horário hoje?",
    ],
  },
  {
    id: "stage14-repro-sports-hours-curly-hair",
    label: "Repro Etapa 14: esporte, horários e cabelo feminino",
    messages: [
      "qual jogo tem hoje da copa do mundo?",
      "que horas?",
      "cite 3 cortes de cabelo feminino cacheado",
    ],
  },
  {
    id: "question-satisfaction-female-hair-service",
    label: "Question Satisfaction: cabelo feminino operacional",
    messages: [
      "cite 3 cortes de cabelo feminino cacheado",
      "vocês cortam cabelo feminino?",
      "eu perguntei se corta cabelo de mulher?",
    ],
  },
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

function sentenceCount(text: string) {
  return text.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length
}

function normalizedWords(text: string) {
  return normalize(text)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 2)
}

function approximateSimilarity(left: string, right: string) {
  const leftWords = normalizedWords(left)
  const rightWords = normalizedWords(right)
  if (!leftWords.length || !rightWords.length) return 0
  const rightSet = new Set(rightWords)
  const overlap = leftWords.filter((word) => rightSet.has(word)).length
  return (2 * overlap) / (leftWords.length + rightWords.length)
}

function openingKey(text: string) {
  return normalizedWords(text).slice(0, 3).join(" ")
}

function inferStructure(text: string) {
  if (/(^|\s)\d+\.\s+/.test(text)) return "numbered_steps"
  if (/(^|\s)[-*]\s+/.test(text)) return "bullets"
  if (text.includes("\n\n")) return "short_paragraphs"
  if (hasAny(text, ["por outro lado", "eu separaria assim", "melhor", "se você quer"])) return "contrast"
  return "single_paragraph"
}

function scoreFormat(user: string, ai: string) {
  const structureUsed = inferStructure(ai)
  const emphasisUsed = ai.includes("**")
  const listUsed = /(^|\s)(?:[-*]|\d+\.)\s+/.test(ai)
  const questionUsed = ai.includes("?")
  const simple = hasAny(user, ["que dia é hoje"])
  const consultive = hasAny(user, ["medo", "mudar meu cabelo", "mudar o visual"])
  const comparison = hasAny(user, ["qual melhor", "degradê", "degrade", "social"])
  const explain = hasAny(user, ["explica melhor"])
  const transactional = hasAny(user, ["quanto custa", "tem horário", "tem horario"])
  const sports = hasAny(user, ["jogo", "copa do mundo"])
  const sportsHoursFollowUp = normalize(user).trim() === "que horas?"
  const curlyHair = hasAny(user, ["cabelo feminino cacheado", "feminino cacheado", "cacheado"])
  const femaleHairServiceQuestion = hasAny(user, ["vocês cortam cabelo feminino", "voces cortam cabelo feminino", "corta cabelo de mulher", "cortam cabelo de mulher"])

  let formatAdequate = true
  const reasons: string[] = []
  if (simple && (listUsed || questionUsed)) {
    formatAdequate = false
    reasons.push("pergunta simples recebeu estrutura ou pergunta desnecessária")
  }
  if (consultive && !questionUsed) {
    formatAdequate = false
    reasons.push("pedido consultivo sem pergunta útil")
  }
  if ((comparison || explain) && !listUsed) {
    formatAdequate = false
    reasons.push("comparação/explicação sem lista ou passos")
  }
  if (transactional && hasAny(ai, ["agenda entrar", "serviço ou profissional já estão claros", "servico ou profissional ja estao claros"])) {
    formatAdequate = false
    reasons.push("transacional com linguagem técnica")
  }
  if (sports && hasAny(ai, ["Switzerland at", "Morocco at", "Scotland at"])) {
    formatAdequate = false
    reasons.push("esportes em inglês")
  }
  if (sports && !listUsed) {
    formatAdequate = false
    reasons.push("jogos sem lista")
  }
  const mentionsSportsSchedule = hasAny(ai, ["horários dos jogos", "Suíça x Catar", "Marrocos x Brasil", "Escócia x Haiti"])
  if (sportsHoursFollowUp && hasAny(ai, ["hora atual", "hoje é sábado"]) && !mentionsSportsSchedule) {
    formatAdequate = false
    reasons.push("follow-up de horários respondeu relógio atual")
  }
  if (sportsHoursFollowUp && !mentionsSportsSchedule) {
    formatAdequate = false
    reasons.push("follow-up de horários não seguiu tópico de jogos")
  }
  if (curlyHair && hasAny(ai, ["masculino", "executivo"])) {
    formatAdequate = false
    reasons.push("cabelo feminino herdou contexto masculino/executivo")
  }
  if (curlyHair && (!listUsed || !hasAny(ai, ["Long bob cacheado", "Corte em camadas", "Shaggy cacheado"]))) {
    formatAdequate = false
    reasons.push("pedido cite 3 não listou cortes femininos cacheados")
  }
  if (femaleHairServiceQuestion && hasAny(ai, ["outro assunto", "separado da barbearia", "conversa geral"])) {
    formatAdequate = false
    reasons.push("pergunta operacional foi tratada como outro assunto")
  }
  if (femaleHairServiceQuestion && !hasAny(ai, ["sim", "não", "nao", "não aparece confirmado", "nao aparece confirmado", "não vou te dizer que sim"])) {
    formatAdequate = false
    reasons.push("pergunta sim/não sobre cabelo feminino não foi respondida")
  }

  return {
    structureUsed,
    emphasisUsed,
    listUsed,
    questionUsed,
    formatAdequate,
    formatReason: reasons.join(" | ") || "estrutura adequada para o turno",
  }
}

function hasInternalLanguage(text: string) {
  return hasAny(text, [
    "contexto atual",
    "continuação",
    "continuacao",
    "intenção",
    "intencao",
    "resolver",
    "visualblock",
    "ação clara",
    "acao clara",
  ])
}

function scoreTurn(user: string, ai: string, visualBlock: boolean): Omit<AuditTurn, "user" | "ai" | "visualBlock"> {
  const text = normalize(ai)
  const naturalNextStep =
    ai.includes("?") ||
    hasAny(ai, ["próximo passo", "proximo passo", "faz sentido", "antes", "posso", "quer"])
  const earlyCard =
    visualBlock &&
    hasAny(user, ["quero cortar", "não sei", "nao sei", "arrumado", "quem foi", "filme", "netflix", "não gostei", "nao gostei", "nao entendi", "não entendi"])
  const contextLoss = hasAny(ai, ["não captei", "nao captei", "me conta em uma frase"]) ||
    (hasAny(user, ["estacionamento"]) && !hasAny(ai, ["estacionamento", "vaga", "carro", "chegar"])) ||
    (hasAny(user, ["netflix", "filme"]) && hasAny(ai, ["continuação do que falamos", "contexto atual", "recomeçar a busca"])) ||
    (hasAny(user, ["nao entendi", "não entendi"]) && !hasAny(ai, ["respondi mal", "não fui claro", "nao fui claro", "reformulando", "você tem razão", "voce tem razao"]))
  const dry = ai.length < 55 || (sentenceCount(ai) <= 1 && !ai.includes("?"))
  const internalLanguage = hasInternalLanguage(ai)
  const inventedData = /r\$\s*\d+|\b\d+\s*reais\b|\b([01]?\d|2[0-3])h([0-5]\d)?\b/i.test(ai) &&
    !hasAny(user, ["preço", "preco", "quanto", "horário", "horario", "hoje"])

  let score = 10
  if (dry) score -= 2
  if (!naturalNextStep) score -= 2
  if (earlyCard) score -= 3
  if (contextLoss) score -= 3
  if (internalLanguage) score -= 3
  if (inventedData) score -= 3
  if (text.includes("fallback")) score -= 2

  return {
    naturalNextStep,
    earlyCard,
    contextLoss,
    repeatedOpening: false,
    highSimilarity: false,
    internalLanguage,
    score: Math.max(0, score),
  }
}

async function openAppointment(page: Page) {
  let lastError: unknown

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 120000 })
      await page.waitForSelector("button", { timeout: 60000, state: "visible" })
      await page.waitForTimeout(500)
      await page.getByRole("button", { name: /agendamento/i }).first().click({ timeout: 10000 })
      await page.waitForSelector("#section-agendar-horario", { timeout: 20000 })
      await page.locator('[data-conversation-composer="true"] input[type="text"]').waitFor({ timeout: 20000 })
      await page.waitForTimeout(900)
      return
    } catch (error) {
      lastError = error
      await page.waitForTimeout(800)
    }
  }

  throw lastError
}

async function collectLeaves(page: Page) {
  return page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT)
    const values: string[] = []
    let node = walker.nextNode() as HTMLElement | null

    while (node) {
      const element = node
      const text = element.textContent?.replace(/\s+/g, " ").trim() ?? ""
      const childElementCount = Array.from(element.children).filter((child) =>
        child.textContent?.trim()
      ).length
      const isVisible = Boolean(element.offsetParent || element.getClientRects().length)

      const ignored = /events \(\d+\)|toggle passive|agendamento|produtos|restaurante|saúde|saude|criar|demo/i.test(text)

      if (text && text.length > 8 && childElementCount === 0 && isVisible && !ignored) {
        values.push(text)
      }

      node = walker.nextNode() as HTMLElement | null
    }

    return values
  })
}

function extractAiText(before: string[], after: string[], userMessage: string) {
  const beforeSet = new Set(before)
  const isButtonishActionText = (text: string) =>
    text.length <= 28 && hasAny(text, ["ver horários", "ver horarios", "agendar"])
  const candidates = after
    .filter((text) => !beforeSet.has(text))
    .filter((text) => normalize(text) !== normalize(userMessage))
    .filter((text) => !hasAny(text, ["enviar mensagem", "usuario"]))
    .filter((text) => text.length > 20)

  const afterUserIndex = candidates.findIndex((text) => normalize(text) === normalize(userMessage))
  const postUserCandidates = afterUserIndex >= 0 ? candidates.slice(afterUserIndex + 1) : candidates

  return postUserCandidates.find((text) => !isButtonishActionText(text)) ??
    candidates.find((text) => !isButtonishActionText(text)) ??
    ""
}

async function collectActionButtons(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('button, [role="button"]'))
      .map((node) => node.textContent?.replace(/\s+/g, " ").trim() ?? "")
      .filter(Boolean)
  )
}

async function sendTurn(page: Page, message: string): Promise<AuditTurn> {
  const input = page.locator('[data-conversation-composer="true"] input[type="text"]')
  const before = await collectLeaves(page)
  const buttonsBefore = new Set(await collectActionButtons(page))
  await input.click()
  await input.fill(message)
  await input.press("Enter")
  await page.waitForTimeout(2600)
  const after = await collectLeaves(page)
  const ai = extractAiText(before, after, message)
  const buttonsAfter = await collectActionButtons(page)
  const visualBlock = buttonsAfter.some(
    (text) =>
      !buttonsBefore.has(text) &&
      /ver horários|ver horarios|agendar|profissional|barba completa|carlos silva/i.test(text)
  )
  const scored = scoreTurn(message, ai, visualBlock)
  const format = scoreFormat(message, ai)

  return {
    user: message,
    ai,
    visualBlock,
    ...format,
    ...scored,
  }
}

function classifyIssues(turns: AuditTurn[]) {
  const issues: string[] = []

  for (const [index, turn] of turns.entries()) {
    const previous = turns[index - 1]
    if (!turn.ai) issues.push("P0: resposta da IA não foi capturada no app")
    if (turn.contextLoss) issues.push("P0: perda de contexto perceptível")
    if (turn.earlyCard) issues.push("P1: card/bloco visual cedo demais")
    if (turn.internalLanguage) issues.push("P1: linguagem interna/sistêmica apareceu")
    if (turn.formatAdequate === false) issues.push("P1: estrutura de resposta inadequada")
    if (previous?.ai && openingKey(previous.ai) === openingKey(turn.ai)) issues.push("P1: abertura repetida")
    if (previous?.ai && approximateSimilarity(previous.ai, turn.ai) >= 0.72) issues.push("P1: respostas consecutivas parecidas demais")
    if (turn.score <= 6) issues.push("P1: resposta parece bot ou quebra condução")
    if (turn.score === 7) issues.push("P2: resposta correta, mas pouco natural")
    if (turn.score === 8) issues.push("P3: ajuste fino de tom")
  }

  return [...new Set(issues)]
}

async function runScenario(page: Page, scenario: AuditScenario): Promise<AuditScenarioResult> {
  await openAppointment(page)
  const turns: AuditTurn[] = []

  for (const message of scenario.messages) {
    turns.push(await sendTurn(page, message))
    const previous = turns.at(-2)
    const current = turns.at(-1)
    if (previous && current) {
      current.repeatedOpening = openingKey(previous.ai) === openingKey(current.ai)
      current.highSimilarity = approximateSimilarity(previous.ai, current.ai) >= 0.72
      if (current.repeatedOpening || current.highSimilarity) {
        current.score = Math.max(0, current.score - 3)
      }
    }
  }

  const overallScore = Math.round(turns.reduce((sum, turn) => sum + turn.score, 0) / turns.length)
  return {
    ...scenario,
    turns,
    issues: classifyIssues(turns),
    overallScore,
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const results: AuditScenarioResult[] = []

  for (const scenario of scenarios) {
    const context = await browser.newContext({ viewport: VIEWPORT })
    const page = await context.newPage()
    const result = await runScenario(page, scenario).catch((error) => ({
      ...scenario,
      turns: [],
      issues: [`P0: audit runner failed: ${error instanceof Error ? error.message : String(error)}`],
      overallScore: 0,
    }))
    await context.close()
    results.push(result)
    console.log(`${scenario.id}: ${result.overallScore}/10 ${result.issues.join(" | ") || "OK"}`)
  }

  await browser.close()
  await mkdir(join(process.cwd(), ".review"), { recursive: true })
  await writeFile(
    OUT,
    JSON.stringify(
      {
        url: BASE,
        viewport: VIEWPORT,
        capturedAt: new Date().toISOString(),
        results,
      },
      null,
      2
    )
  )

  console.log(`Conversation product audit saved to ${OUT}`)
  const hasBlockingIssue = results.some((result) =>
    result.issues.some((issue) => issue.startsWith("P0") || issue.startsWith("P1"))
  )
  process.exit(hasBlockingIssue ? 1 : 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
