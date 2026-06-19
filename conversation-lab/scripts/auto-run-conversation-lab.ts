import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { runConversationLab } from "./run-conversation-lab"
import type { ConversationJudgement, LabFinding, LabSeverity, LabSummary } from "../types"
import type { GoldenRegressionCase } from "../generators/golden-regression-loader"

type RootCause =
  | "perda de contexto"
  | "retomada incorreta"
  | "isso é outro assunto indevido"
  | "pergunta real não respondida"
  | "ferramenta errada"
  | "resposta operacional prematura"
  | "invenção de preço/agenda/disponibilidade"
  | "tom robótico"
  | "repetição"
  | "vazamento interno"

interface AutoCycle {
  index: number
  selectedRootCauses: RootCause[]
  testsAdded: string[]
  filesChanged: string[]
  before: ScoreSnapshot
  after?: ScoreSnapshot
  kept: boolean
  notes: string[]
}

interface ScoreSnapshot {
  satisfaction: number
  p0: number
  p1: number
  p2: number
  p3: number
}

interface RegressionGateSnapshot extends ScoreSnapshot {
  inventedData: number
  noLeak: number
  failClosedRisk: number
}

const ROOT = process.cwd()
const REPORT_PATH = join(ROOT, "conversation-lab", "reports", "auto-runs", "latest.md")
const GOLDEN_PATH = join(ROOT, "conversation-lab", "datasets", "golden", "auto-regressions.jsonl")
const APPROVED_BASELINE_PATH = join(ROOT, "conversation-lab", "reports", "baselines", "baseline-2026-06-13.md")

function readText(path: string) {
  return readFileSync(path, "utf8")
}

function writeText(path: string, value: string) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, value, "utf8")
}

function snapshot(summary: LabSummary): ScoreSnapshot {
  return {
    satisfaction: Math.round(summary.satisfactionRate * 100),
    p0: summary.severityCounts.P0,
    p1: summary.severityCounts.P1,
    p2: summary.severityCounts.P2,
    p3: summary.severityCounts.P3,
  }
}

function regressionSnapshot(summary: LabSummary, failuresPath: string): RegressionGateSnapshot {
  return {
    ...snapshot(summary),
    inventedData: summary.categoryCounts.invented_data,
    noLeak: summary.categoryCounts.no_leak,
    failClosedRisk: failClosedRiskCount(failuresPath),
  }
}

function scoreValue(score: ScoreSnapshot) {
  return score.satisfaction * 100 - score.p0 * 12 - score.p1 * 5 - score.p2 - score.p3 * 0.25
}

function improved(before: ScoreSnapshot, after: ScoreSnapshot) {
  return scoreValue(after) >= scoreValue(before) &&
    after.p0 <= before.p0 &&
    after.p1 <= before.p1 &&
    after.satisfaction >= before.satisfaction
}

function regressionPass(before: RegressionGateSnapshot, after: RegressionGateSnapshot) {
  return after.p0 <= before.p0 &&
    after.p1 <= before.p1 &&
    after.inventedData <= before.inventedData &&
    after.noLeak <= before.noLeak &&
    after.failClosedRisk <= before.failClosedRisk
}

function readFailures(path: string): ConversationJudgement[] {
  return JSON.parse(readText(path)) as ConversationJudgement[]
}

function failClosedRiskCount(failuresPath: string) {
  return readFailures(failuresPath)
    .flatMap((judgement) => judgement.findings)
    .filter((finding) => {
      const message = finding.message.toLowerCase()
      return finding.category === "invented_data" ||
        message.includes("fail-closed") ||
        message.includes("inventou") ||
        message.includes("disponibilidade") ||
        message.includes("confirmação explícita")
    }).length
}

function assertBaselineSaved() {
  if (!existsSync(APPROVED_BASELINE_PATH)) {
    throw new Error(`Baseline aprovado não encontrado: ${APPROVED_BASELINE_PATH}. Salve o baseline antes de rodar auto-run.`)
  }
}

function assertEvaluatorChangeJustified(filesChanged: string[]) {
  const touchedEvaluator = filesChanged.some((path) => path.includes(`${join("conversation-lab", "evaluators")}`))
  if (!touchedEvaluator) return

  const justification = process.env.CONVERSATION_LAB_EVALUATOR_CHANGE_JUSTIFICATION?.trim()
  if (!justification) {
    throw new Error("Auto-run bloqueado: mudança em evaluator exige CONVERSATION_LAB_EVALUATOR_CHANGE_JUSTIFICATION.")
  }
}

function classifyRootCause(finding: LabFinding): RootCause {
  const assistant = finding.assistant.toLowerCase()
  const message = finding.message.toLowerCase()
  const user = finding.user.toLowerCase()

  if (assistant.includes("topicstack") || assistant.includes("actionrequest") || assistant.includes("visualblock") || assistant.includes("tool ")) return "vazamento interno"
  if (finding.category === "invented_data") return "invenção de preço/agenda/disponibilidade"
  if (assistant.includes("isso é outro assunto") || assistant.includes("isso e outro assunto")) return "isso é outro assunto indevido"
  if (user.includes("voltando") || user.includes("retomando")) return "retomada incorreta"
  if (message.includes("exigia") || finding.category === "tool_use") return "ferramenta errada"
  if (message.includes("operacional") || message.includes("pergunta real")) return "pergunta real não respondida"
  if (assistant.includes("abrir opções abaixo") && !user.includes("opção") && !user.includes("profissional")) return "resposta operacional prematura"
  if (finding.category === "naturalness" && message.includes("parecidas")) return "repetição"
  if (finding.category === "naturalness") return "tom robótico"
  return "perda de contexto"
}

function topRootCauses(failuresPath: string) {
  const counts = new Map<RootCause, number>()
  const judgements = readFailures(failuresPath)
  for (const finding of judgements.flatMap((judgement) => judgement.findings)) {
    if (!["P0", "P1"].includes(finding.severity)) continue
    const cause = classifyRootCause(finding)
    counts.set(cause, (counts.get(cause) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([cause]) => cause)
}

function replaceOnce(filePath: string, from: string, to: string) {
  const current = readText(filePath)
  if (!current.includes(from)) return false
  writeText(filePath, current.replace(from, to))
  return true
}

function appendGoldenCase(testCase: GoldenRegressionCase) {
  mkdirSync(dirname(GOLDEN_PATH), { recursive: true })
  const existing = existsSync(GOLDEN_PATH) ? readText(GOLDEN_PATH) : ""
  if (existing.includes(`"id":"${testCase.id}"`) || existing.includes(`"id": "${testCase.id}"`)) {
    return false
  }
  writeFileSync(GOLDEN_PATH, `${existing}${JSON.stringify(testCase)}\n`, "utf8")
  return true
}

function applySportsOpinionRecipe() {
  const filesChanged: string[] = []
  const testsAdded: string[] = []
  const topicPath = join(ROOT, "lib", "conversation-intelligence", "topic-manager.ts")
  const routerPath = join(ROOT, "lib", "conversation-intelligence", "tool-router.ts")

  const testAdded = appendGoldenCase({
    id: "sports-opinion-followup-context",
    rootCause: "ferramenta errada",
    title: "Golden: opinião sobre jogo mantém tópico futebol",
    persona: "Torcedor casual que pergunta jogos, horários e opinião.",
    initialGoal: "Saber jogos e escolher qual assistir.",
    cognitivePattern: "follow-up opinativo deve usar tópico esportivo ativo",
    messages: ["qual jogo tem hoje?", "que horas?", "qual você escolheria?"],
    createdAt: new Date().toISOString(),
  })
  if (testAdded) testsAdded.push("sports-opinion-followup-context")

  if (replaceOnce(
    topicPath,
    `["qual voce assistiria", "qual você assistiria", "qual mais interessante", "qual voce acha", "qual você acha"]`,
    `["qual voce assistiria", "qual você assistiria", "qual voce escolheria", "qual você escolheria", "qual mais interessante", "qual voce acha", "qual você acha"]`
  )) {
    filesChanged.push(topicPath)
  }

  if (replaceOnce(
    routerPath,
    `["qual voce assistiria", "qual você assistiria", "qual mais interessante"]`,
    `["qual voce assistiria", "qual você assistiria", "qual voce escolheria", "qual você escolheria", "qual mais interessante"]`
  )) {
    filesChanged.push(routerPath)
  }

  return { filesChanged, testsAdded, notes: ["Corrigido follow-up opinativo esportivo no Topic Resolver/Tool Planning."] }
}

function applyOffDomainCopyRecipe() {
  const filesChanged: string[] = []
  const testsAdded: string[] = []
  const antiPath = join(ROOT, "lib", "conversation-intelligence", "anti-repetition.ts")

  const testAdded = appendGoldenCase({
    id: "return-topic-not-other-subject",
    rootCause: "isso é outro assunto indevido",
    title: "Golden: retomada explícita não vira outro assunto",
    persona: "Cliente que pausa uma marcação para curiosidade e depois volta.",
    initialGoal: "Marcar corte e retomar horário depois de pergunta geral.",
    cognitivePattern: "retomada deve recuperar tópico pausado sem chamar de outro assunto",
    messages: ["quero marcar um corte", "sábado", "antes disso, qual é a capital da Austrália?", "interessante", "voltando ao que falávamos"],
    createdAt: new Date().toISOString(),
  })
  if (testAdded) testsAdded.push("return-topic-not-other-subject")

  if (replaceOnce(
    antiPath,
    `      "Boa pergunta. Respondo isso separado da barbearia, sem forçar conexão. Se for algo que muda com o tempo, vale confirmar numa fonte atual.",
      "Isso é outro assunto, então melhor responder curto e direto. Se você quiser, seguimos nesse tema sem misturar com a conversa anterior.",`,
    `      "Boa pergunta. Vou responder o ponto atual sem misturar com serviço, preço ou horário.",
      "Certo. Respondo direto esse ponto e, se você retomar o assunto anterior, continuo de onde parou.",`
  )) {
    filesChanged.push(antiPath)
  }

  return { filesChanged, testsAdded, notes: ["Removida cópia que chamava retomadas/assuntos gerais de outro assunto."] }
}

function applyRecipe(cause: RootCause) {
  if (cause === "ferramenta errada") return applySportsOpinionRecipe()
  if (cause === "isso é outro assunto indevido" || cause === "retomada incorreta") return applyOffDomainCopyRecipe()
  return { filesChanged: [], testsAdded: [], notes: [`Sem receita segura disponível para ${cause}.`] }
}

function backupFiles(paths: string[]) {
  return new Map(paths.map((path) => [path, existsSync(path) ? readText(path) : null]))
}

function restoreFiles(backups: Map<string, string | null>) {
  for (const [path, value] of backups) {
    if (value === null) {
      writeText(path, "")
      continue
    }
    writeText(path, value)
  }
}

function runTypecheck() {
  execFileSync("pnpm", ["typecheck"], { cwd: ROOT, stdio: "inherit" })
}

function formatScore(score: ScoreSnapshot) {
  return `satisfaction=${score.satisfaction}% | P0=${score.p0} | P1=${score.p1} | P2=${score.p2} | P3=${score.p3}`
}

function writeReport(cycles: AutoCycle[], initial: ScoreSnapshot, final: ScoreSnapshot, remaining: RootCause[]) {
  const content = [
    "# Conversation Lab Auto Run",
    "",
    `Updated at: ${new Date().toISOString()}`,
    `Cycles executed: ${cycles.length}`,
    `Initial: ${formatScore(initial)}`,
    `Final: ${formatScore(final)}`,
    "",
    "## Cycles",
    "",
    ...cycles.map((cycle) => [
      `### Cycle ${cycle.index}`,
      `- Selected root causes: ${cycle.selectedRootCauses.join(", ") || "none"}`,
      `- Before: ${formatScore(cycle.before)}`,
      `- After: ${cycle.after ? formatScore(cycle.after) : "not run"}`,
      `- Kept: ${cycle.kept ? "yes" : "no"}`,
      `- Tests added: ${cycle.testsAdded.join(", ") || "none"}`,
      `- Files changed: ${cycle.filesChanged.map((file) => file.replace(`${ROOT}/`, "")).join(", ") || "none"}`,
      `- Notes: ${cycle.notes.join(" ") || "none"}`,
    ].join("\n")),
    "",
    "## Remaining Important Causes",
    "",
    ...(remaining.length ? remaining.map((cause) => `- ${cause}`) : ["- none"]),
    "",
  ].join("\n")

  writeText(REPORT_PATH, content)
}

export async function runAutoConversationLab() {
  assertBaselineSaved()

  const maxMinutes = Number(process.env.CONVERSATION_LAB_AUTO_MINUTES ?? "60")
  const maxCycles = Number(process.env.CONVERSATION_LAB_AUTO_MAX_CYCLES ?? "20")
  const deadline = Date.now() + Math.max(1, maxMinutes) * 60_000
  const cycles: AutoCycle[] = []

  const baseline = await runConversationLab("real-agent")
  const initial = snapshot(baseline.summary)
  const initialRegression = await runConversationLab("regression")
  const regressionBaseline = regressionSnapshot(initialRegression.summary, initialRegression.failuresPath)
  let current = initial
  let latestFailuresPath = baseline.failuresPath

  while (Date.now() < deadline && cycles.length < maxCycles) {
    const selectedRootCauses = topRootCauses(latestFailuresPath)
    if (!selectedRootCauses.length) break

    const before = current
    const possibleRecipeFiles = [
      join(ROOT, "lib", "conversation-intelligence", "topic-manager.ts"),
      join(ROOT, "lib", "conversation-intelligence", "tool-router.ts"),
      join(ROOT, "lib", "conversation-intelligence", "anti-repetition.ts"),
      GOLDEN_PATH,
    ].filter((path) => path === GOLDEN_PATH || existsSync(path))
    const preRecipeBackups = backupFiles(possibleRecipeFiles)
    const recipeResults = selectedRootCauses.map(applyRecipe)
    const filesChanged = [...new Set(recipeResults.flatMap((result) => result.filesChanged))]
    const testsAdded = [...new Set(recipeResults.flatMap((result) => result.testsAdded))]
    const notes = recipeResults.flatMap((result) => result.notes)

    const cycle: AutoCycle = {
      index: cycles.length + 1,
      selectedRootCauses,
      testsAdded,
      filesChanged,
      before,
      kept: false,
      notes,
    }

    if (!filesChanged.length || !testsAdded.length) {
      cycle.notes.push("Ciclo interrompido: sem correção segura ou sem teste novo.")
      cycles.push(cycle)
      break
    }

    try {
      assertEvaluatorChangeJustified(filesChanged)
      runTypecheck()
      const regression = await runConversationLab("regression")
      const regressionAfter = regressionSnapshot(regression.summary, regression.failuresPath)
      if (!regressionPass(regressionBaseline, regressionAfter)) {
        restoreFiles(new Map([...filesChanged, GOLDEN_PATH].map((path) => [path, preRecipeBackups.get(path) ?? null])))
        cycle.notes.push(`Regression gate falhou; alteração revertida. Baseline=${formatScore(regressionBaseline)} After=${formatScore(regressionAfter)} failClosed=${regressionAfter.failClosedRisk}/${regressionBaseline.failClosedRisk}.`)
        cycles.push(cycle)
        break
      }

      const evaluated = await runConversationLab("real-agent")
      const after = snapshot(evaluated.summary)
      cycle.after = after
      latestFailuresPath = evaluated.failuresPath

      if (improved(before, after)) {
        cycle.kept = true
        current = after
      } else {
        restoreFiles(new Map([...filesChanged, GOLDEN_PATH].map((path) => [path, preRecipeBackups.get(path) ?? null])))
        runTypecheck()
        const reverted = await runConversationLab("real-agent")
        current = snapshot(reverted.summary)
        latestFailuresPath = reverted.failuresPath
        cycle.notes.push("Score piorou ou não cumpriu gates; alteração revertida.")
      }
    } catch (error) {
      restoreFiles(new Map([...filesChanged, GOLDEN_PATH].map((path) => [path, preRecipeBackups.get(path) ?? null])))
      cycle.notes.push(`Erro no ciclo; alteração revertida: ${error instanceof Error ? error.message : String(error)}`)
    }

    cycles.push(cycle)
  }

  const remaining = topRootCauses(latestFailuresPath)
  writeReport(cycles, initial, current, remaining)

  return { cycles, initial, final: current, reportPath: REPORT_PATH, remaining }
}

if (process.argv[1]?.endsWith("auto-run-conversation-lab.ts")) {
  runAutoConversationLab().then((result) => {
    console.log(`Conversation Lab auto-run completed ${result.cycles.length} cycle(s)`)
    console.log(`Initial: ${formatScore(result.initial)}`)
    console.log(`Final: ${formatScore(result.final)}`)
    console.log(`Report: ${result.reportPath}`)
  }).catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
