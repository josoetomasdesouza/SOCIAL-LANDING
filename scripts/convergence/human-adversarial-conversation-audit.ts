import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { chromium, type Page } from "playwright"

interface AuditTurn {
  user: string
  ai: string
  visualBlock: boolean
  naturalNextStep: boolean
  earlyCard: boolean
  contextLoss: boolean
  botLike: boolean
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
const OUT = join(process.cwd(), ".review", "human-adversarial-conversation-audit.json")
const VIEWPORT = { width: 390, height: 844 }

const scenarios: AuditScenario[] = [
  {
    id: "topic-switch-with-return",
    label: "Muda de assunto sem avisar e volta",
    messages: ["quero cortar o cabelo", "quem ganhou o jogo ontem?", "voltando, tem horário hoje?"],
  },
  {
    id: "criticizes-ai",
    label: "Critica a IA",
    messages: ["quero mudar o visual", "você não entendeu nada", "responde direito"],
  },
  {
    id: "bad-writing",
    label: "Escreve mal / abreviado",
    messages: ["qnt custa", "hj tem", "corta barba tbm?"],
  },
  {
    id: "mixed-domain-celebrity",
    label: "Mistura domínio e celebridade",
    messages: ["qual barbeiro parece o corte do Cristiano Ronaldo?", "tem corte igual do ator tal?"],
  },
  {
    id: "impossible-requests",
    label: "Pede algo impossível",
    messages: ["quero agendar ontem", "quero de graça", "tem horário às 3 da manhã?"],
  },
  {
    id: "free-conversation",
    label: "Quer conversa livre",
    messages: [
      "tô em dúvida se corto ou deixo crescer",
      "minha namorada falou que eu pareço mais velho",
      "quero mudar o visual, mas tenho medo",
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

function isGeneralOrEmotionalUserTurn(user: string) {
  return hasAny(user, [
    "quem ganhou",
    "jogo",
    "você não entendeu",
    "voce nao entendeu",
    "responde direito",
    "de graça",
    "de graca",
    "ontem",
    "3 da manhã",
    "3 da manha",
    "tenho medo",
    "namorada",
    "pareço mais velho",
    "pareco mais velho",
  ])
}

function scoreTurn(user: string, ai: string, visualBlock: boolean): Omit<AuditTurn, "user" | "ai" | "visualBlock"> {
  const dry = ai.length < 55 || (sentenceCount(ai) <= 1 && !ai.includes("?"))
  const naturalNextStep =
    ai.includes("?") ||
    hasAny(ai, ["quer", "posso", "próximo", "proximo", "faz sentido", "antes", "melhor", "reformulando"])
  const earlyCard =
    visualBlock &&
    (isGeneralOrEmotionalUserTurn(user) || hasAny(user, ["qnt", "hj tem", "dúvida", "duvida", "cristiano", "ator"]))
  const contextLoss =
    hasAny(ai, ["não captei", "nao captei", "me conta em uma frase", "continuação do que falamos"]) &&
    !hasAny(user, ["qnt", "hj", "voltando"])
  const botLike =
    dry ||
    hasAny(ai, ["fallback", "não captei", "nao captei"]) ||
    (hasAny(user, ["você não entendeu", "voce nao entendeu", "responde direito"]) &&
      !hasAny(ai, ["você tem razão", "voce tem razao", "não fui claro", "nao fui claro", "reformul"]))
  const inventedTransactionalData =
    /r\$\s*\d+|\b\d+\s*reais\b|\b([01]?\d|2[0-3])h([0-5]\d)?\b/i.test(ai) &&
    !hasAny(user, ["qnt", "quanto", "horário", "horario", "hoje", "hj", "3 da"])

  let score = 10
  if (dry) score -= 2
  if (!naturalNextStep) score -= 2
  if (earlyCard) score -= 3
  if (contextLoss) score -= 3
  if (botLike) score -= 2
  if (inventedTransactionalData) score -= 3

  return {
    naturalNextStep,
    earlyCard,
    contextLoss,
    botLike,
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
  const candidates = after
    .filter((text) => !beforeSet.has(text))
    .filter((text) => normalize(text) !== normalize(userMessage))
    .filter((text) => !hasAny(text, ["enviar mensagem", "usuario"]))
    .filter((text) => text.length > 20)

  return candidates.find((text) => !hasAny(text, ["ver horários", "ver horarios", "agendar"])) ??
    candidates.at(-1) ??
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

  return {
    user: message,
    ai,
    visualBlock,
    ...scored,
  }
}

function classifyIssues(turns: AuditTurn[]) {
  const issues: string[] = []

  for (const turn of turns) {
    if (!turn.ai) issues.push("P0: resposta da IA não foi capturada no app")
    if (turn.contextLoss) issues.push("P0: perda de contexto perceptível")
    if (turn.earlyCard) issues.push("P1: card/bloco visual cedo demais")
    if (turn.botLike || turn.score <= 6) issues.push("P1: resposta parece bot ou quebra condução")
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

  const hasBlockingIssue = results.some((result) =>
    result.issues.some((issue) => issue.startsWith("P0") || issue.startsWith("P1"))
  )

  console.log(`Human adversarial conversation audit saved to ${OUT}`)
  process.exit(hasBlockingIssue ? 1 : 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
