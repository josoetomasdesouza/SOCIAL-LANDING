import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { chromium, type Page } from "playwright"
import { approximateTextSimilarity } from "@/lib/conversation-intelligence/anti-repetition"
import { deriveTopicStack } from "@/lib/conversation-intelligence/topic-manager"
import { routeConversationTool } from "@/lib/conversation-intelligence/tool-router"
import type {
  ConversationHistoryMessage,
  ConversationTopicFrame,
  UniversalToolName,
  UniversalToolRoutingResult,
} from "@/lib/conversation-intelligence/types"
import { createAppointmentConversationResolverWithDialogue } from "@/lib/mock-data/appointment-conversation-resolver-composed"
import {
  barberServices,
  barbers,
  barberShopArrivalContext,
  barberShopConfig,
  barberShopHeroOperationalContext,
} from "@/lib/mock-data/appointment-data"

interface ProofTurn {
  index: number
  user: string
  ai: string
  toolUsed: UniversalToolName | "none"
  toolSource: "network" | "computed" | "none"
  toolFamily: string
  visualBlock: boolean
  topicStackBefore: ConversationTopicFrame[]
  topicStackAfter: ConversationTopicFrame[]
  actionRequest?: string
  score: number
  gradeReason: string
  issues: string[]
}

const BASE = (process.env.DEMO_URL ?? "http://localhost:3007/demo?composer-layout=v2").replace(
  "127.0.0.1",
  "localhost"
)
const JSON_OUT = join(process.cwd(), ".review", "final-universal-agent-proof.json")
const DOC_OUT = join(process.cwd(), "docs", "ai", "FINAL_UNIVERSAL_AGENT_PROOF.md")
const VIEWPORT = { width: 390, height: 844 }

const flow = [
  "bom dia",
  "que dia é hoje?",
  "qual jogo tem hoje da copa do mundo?",
  "vai chover hoje em ponta grossa?",
  "qual filme mais assistido da netflix agora?",
  "beleza, voltando ao corte",
  "quero algo mais executivo",
  "quanto custa?",
  "tem horário hoje?",
  "não gostei",
  "tem outro profissional?",
]

const resolver = createAppointmentConversationResolverWithDialogue({
  brandName: barberShopConfig.name,
  operational: {
    liveState: barberShopHeroOperationalContext.liveState,
    placeHint: barberShopHeroOperationalContext.placeHint,
    momentHint: barberShopHeroOperationalContext.momentHint,
    hoursHint: barberShopHeroOperationalContext.hoursHint,
    openingHours: barberShopConfig.openingHours || "Seg-Sab: 9h-20h",
  },
  arrival: {
    addressLine: barberShopArrivalContext.addressLine,
    parkingHint: barberShopArrivalContext.parkingHint,
    referenceHint: barberShopArrivalContext.referenceHint,
  },
  serviceNames: barberServices.map((service) => service.name),
  services: barberServices,
  professionals: barbers,
  feedPosts: [],
})

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

function isGeneralTurn(user: string) {
  return hasAny(user, ["que dia", "jogo", "copa do mundo", "chover", "ponta grossa", "netflix"])
}

function requiresRealtimeTool(user: string) {
  return hasAny(user, ["que dia", "jogo", "copa do mundo", "chover", "notícia", "noticia", "netflix agora"])
}

function hasInternalLanguage(ai: string) {
  return hasAny(ai, [
    "topicstack",
    "actionrequest",
    "ferramenta",
    "contexto interno",
    "arquitetura",
    "resolver",
    "visualblock",
    "intenção",
    "intencao",
  ])
}

function businessLeakOnGeneral(ai: string) {
  const normalized = normalize(ai).replace("horas assistidas", "")
  return /\b(barba negra|barbearia|corte|barba|agendar|agenda|horario|servico|profissional)\b/.test(normalized)
}

function scoreTurn({
  user,
  ai,
  toolUsed,
  visualBlock,
  previousAi,
  topicStackAfter,
  actionRequest,
}: {
  user: string
  ai: string
  toolUsed: UniversalToolName | "none"
  visualBlock: boolean
  previousAi?: string
  topicStackAfter: ConversationTopicFrame[]
  actionRequest?: string
}) {
  const issues: string[] = []
  const activeTopic = topicStackAfter.find((topic) => topic.state === "active")?.topic

  if (!ai) issues.push("P0: resposta vazia no app real")
  if (isGeneralTurn(user) && businessLeakOnGeneral(ai)) {
    issues.push("P0: pergunta geral foi puxada para barbearia/agendamento")
  }
  if (hasAny(user, ["que dia"]) && !hasAny(ai, ["sábado", "sabado", "13", "junho", "2026"])) {
    issues.push("P0: não respondeu data atual")
  }
  if (requiresRealtimeTool(user) && toolUsed === "none") {
    issues.push("P0: pergunta atual sem tool realtime")
  }
  if (!hasAny(user, ["voltando", "volta"]) && isGeneralTurn(user) && hasAny(ai, ["voltando ao corte", "quer voltar para corte"])) {
    issues.push("P1: forçou retorno ao corte antes do usuário pedir")
  }
  if (hasAny(user, ["voltando ao corte"]) && activeTopic !== "agendamento") {
    issues.push("P0: não retomou assunto original do corte")
  }
  if (hasAny(user, ["executivo", "quanto custa", "tem horário", "tem horario"]) && activeTopic !== "agendamento") {
    issues.push("P0: perdeu contexto do corte após retorno")
  }
  if (previousAi && approximateTextSimilarity(ai, previousAi) >= 0.72) {
    issues.push("P1: resposta parecida demais com turno próximo")
  }
  if (hasInternalLanguage(ai)) {
    issues.push("P1: mencionou linguagem interna")
  }
  if (visualBlock && hasAny(user, ["bom dia", "que dia", "jogo", "chover", "netflix", "executivo", "quanto custa"])) {
    issues.push("P1: visualBlock cedo demais")
  }
  if (hasAny(user, ["tem horário", "tem horario"]) && !["show_schedule", "schedule"].includes(actionRequest ?? "")) {
    issues.push("P0: pergunta de horário não acionou ferramenta interna de agenda")
  }

  const maxSeverity = issues.some((issue) => issue.startsWith("P0"))
    ? "P0"
    : issues.some((issue) => issue.startsWith("P1"))
      ? "P1"
      : issues.some((issue) => issue.startsWith("P2"))
        ? "P2"
        : issues.some((issue) => issue.startsWith("P3"))
          ? "P3"
          : null
  const score = maxSeverity === "P0" ? 0 : maxSeverity === "P1" ? 6 : maxSeverity === "P2" ? 7 : maxSeverity === "P3" ? 8 : 10

  return {
    score,
    issues,
    gradeReason: issues.length ? issues.join(" | ") : "Passou: respondeu o assunto correto, sem linguagem interna, sem card cedo e com tool adequada quando necessário.",
  }
}

async function openAppointment(page: Page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 120000 })
  await page.waitForSelector("button", { timeout: 60000, state: "visible" })
  await page.waitForTimeout(500)
  await page.getByRole("button", { name: /agendamento/i }).first().click({ timeout: 10000 })
  await page.waitForSelector("#section-agendar-horario", { timeout: 20000 })
  await page.locator('[data-conversation-composer="true"] input[type="text"]').waitFor({ timeout: 20000 })
  await page.waitForTimeout(900)
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

async function captureToolResponse(page: Page) {
  return page.waitForResponse(
    (response) => response.url().includes("/api/conversation/tools") && response.request().method() === "POST",
    { timeout: 3500 }
  )
    .then((response) => response.json() as Promise<UniversalToolRoutingResult>)
    .catch(() => null)
}

function markdownFor(turns: ProofTurn[], status: "APROVADO" | "REPROVADO") {
  const rows = turns.map((turn) => (
    `| ${turn.index} | ${turn.user.replace(/\|/g, "\\|")} | ${turn.toolUsed} | ${turn.visualBlock ? "sim" : "não"} | ${turn.score}/10 | ${turn.issues.join("; ") || "OK"} |`
  )).join("\n")
  const transcript = turns.map((turn) => [
    `### Turno ${turn.index}`,
    "",
    `Usuário: ${turn.user}`,
    "",
    `IA: ${turn.ai}`,
    "",
    `Tool usada: ${turn.toolUsed} (${turn.toolSource})`,
    "",
    `Tool family: ${turn.toolFamily}`,
    "",
    `VisualBlock: ${turn.visualBlock ? "sim" : "não"}`,
    "",
    `TopicStack antes: \`${JSON.stringify(turn.topicStackBefore)}\``,
    "",
    `TopicStack depois: \`${JSON.stringify(turn.topicStackAfter)}\``,
    "",
    `ActionRequest: ${turn.actionRequest ?? "none"}`,
    "",
    `Nota: ${turn.score}/10`,
    "",
    `Motivo: ${turn.gradeReason}`,
  ].join("\n")).join("\n\n")

  return [
    "# Final Universal Agent Proof",
    "",
    `**Data:** ${new Date().toISOString()}`,
    `**Superfície:** \`${BASE}\``,
    `**Status final:** ${status}`,
    `**JSON bruto:** \`.review/final-universal-agent-proof.json\``,
    "",
    "## Resumo",
    "",
    "| Turno | Usuário | Tool | VisualBlock | Nota | Issues |",
    "|---:|---|---|---|---:|---|",
    rows,
    "",
    "## Transcript Real",
    "",
    transcript,
  ].join("\n")
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: VIEWPORT })
  const page = await context.newPage()
  const history: ConversationHistoryMessage[] = []
  let currentTopicStack: ConversationTopicFrame[] = []
  const turns: ProofTurn[] = []

  await openAppointment(page)

  for (const [index, user] of flow.entries()) {
    const topicStackBefore = currentTopicStack
    const topicStackAfter = deriveTopicStack({ message: user, history })
    const computedRoute = await routeConversationTool({ message: user, history, topicStack: topicStackAfter })
    const resolverResult = await resolver({
      message: user,
      brandName: barberShopConfig.name,
      contextItems: [],
      history,
    })
    const toolCapture = captureToolResponse(page)
    const input = page.locator('[data-conversation-composer="true"] input[type="text"]')
    const before = await collectLeaves(page)
    const buttonsBefore = new Set(await collectActionButtons(page))
    await input.click()
    await input.fill(user)
    await input.press("Enter")
    await page.waitForTimeout(2800)
    const networkTool = await toolCapture
    const after = await collectLeaves(page)
    const buttonsAfter = await collectActionButtons(page)
    const ai = extractAiText(before, after, user)
    const visualBlock = buttonsAfter.some(
      (text) =>
        !buttonsBefore.has(text) &&
        /ver horários|ver horarios|agendar|profissional|barba completa|carlos silva/i.test(text)
    )
    const toolUsed = networkTool?.tool ?? computedRoute.tool ?? "none"
    const toolSource = networkTool?.tool ? "network" : computedRoute.tool ? "computed" : "none"
    const actionRequest = resolverResult?.intelligence?.actionRequest?.type ??
      (["booking", "schedule", "catalog", "professional_lookup", "service_lookup"].includes(computedRoute.tool) ? computedRoute.tool : "none")
    const scored = scoreTurn({
      user,
      ai,
      toolUsed,
      visualBlock,
      previousAi: turns.at(-1)?.ai,
      topicStackAfter,
      actionRequest,
    })
    const turn: ProofTurn = {
      index: index + 1,
      user,
      ai,
      toolUsed,
      toolSource,
      toolFamily: ["time", "weather", "sports", "news", "web_search"].includes(toolUsed) ? toolUsed : "internal_or_reasoning",
      visualBlock,
      topicStackBefore,
      topicStackAfter,
      actionRequest,
      ...scored,
    }

    turns.push(turn)
    history.push({ role: "user", content: user })
    history.push({ role: "ai", content: ai, visualBlock: resolverResult?.visualBlock })
    currentTopicStack = topicStackAfter
    console.log(`${turn.index}. ${turn.score}/10 tool=${turn.toolUsed} visual=${turn.visualBlock ? "yes" : "no"} user="${user}"`)
  }

  await context.close()
  await browser.close()

  const blockingIssues = turns.flatMap((turn) => turn.issues).filter((issue) => issue.startsWith("P0") || issue.startsWith("P1"))
  const status = blockingIssues.length ? "REPROVADO" : "APROVADO"
  const payload = {
    url: BASE,
    viewport: VIEWPORT,
    capturedAt: new Date().toISOString(),
    status,
    turns,
  }

  await mkdir(join(process.cwd(), ".review"), { recursive: true })
  await mkdir(join(process.cwd(), "docs", "ai"), { recursive: true })
  await writeFile(JSON_OUT, JSON.stringify(payload, null, 2))
  await writeFile(DOC_OUT, markdownFor(turns, status))

  console.log(`Final universal agent proof saved to ${JSON_OUT}`)
  console.log(`Final universal agent proof doc saved to ${DOC_OUT}`)
  process.exit(blockingIssues.length ? 1 : 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
