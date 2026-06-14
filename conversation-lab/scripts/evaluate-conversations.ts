import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { basename, dirname, join } from "node:path"
import { judgeConversations, summarizeJudgements } from "../judges/conversation-judge"
import type { ConversationJudgement, LabConversation, LabFinding, LabSeverity, LabSummary } from "../types"

function readJsonl(filePath: string): LabConversation[] {
  if (!existsSync(filePath)) {
    throw new Error(`Conversation dataset not found: ${filePath}`)
  }

  return readFileSync(filePath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as LabConversation)
}

function writeJson(filePath: string, value: unknown) {
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

function severityLine(summary: LabSummary) {
  return (["P0", "P1", "P2", "P3"] as LabSeverity[])
    .map((severity) => `${severity}: ${summary.severityCounts[severity]}`)
    .join(" | ")
}

function categoryLine(summary: LabSummary) {
  return Object.entries(summary.categoryCounts)
    .map(([category, count]) => `${category}: ${count}`)
    .join(" | ")
}

function progressMetricsLine(summary: LabSummary) {
  const metrics = summary.progressMetrics
  if (!metrics) return "unavailable"

  return [
    `blocked_response_rate: ${metrics.blocked_response_rate}`,
    `slot_recovery_rate: ${metrics.slot_recovery_rate}`,
    `progress_delta_distribution: ADVANCES ${metrics.progress_delta_distribution.ADVANCES} | NEUTRAL ${metrics.progress_delta_distribution.NEUTRAL} | BLOCKS ${metrics.progress_delta_distribution.BLOCKS}`,
    `invented_data_count: ${metrics.invented_data_count}`,
  ].join(" | ")
}

function formatFinding(finding: LabFinding) {
  return [
    `- ${finding.severity} / ${finding.category} / turno ${finding.turnIndex}: ${finding.message}`,
    `  - usuário: ${finding.user}`,
    `  - assistente: ${finding.assistant}`,
  ].join("\n")
}

function formatMarkdown(summary: LabSummary, judgements: ConversationJudgement[]) {
  const failures = judgements
    .filter((judgement) => judgement.findings.length)
    .slice(0, 12)
    .map((judgement) => [
      `### ${judgement.scenarioTitle}`,
      `- conversationId: \`${judgement.conversationId}\``,
      `- score: ${judgement.overallScore}`,
      `- persona: ${judgement.persona}`,
      "",
      ...judgement.findings.slice(0, 6).map(formatFinding),
    ].join("\n"))
    .join("\n\n")

  return [
    "# Conversation Lab Report",
    "",
    `Generated at: ${summary.generatedAt}`,
    `Source: \`${summary.sourceFile}\``,
    "",
    "## Summary",
    "",
    `- Conversations: ${summary.conversationCount}`,
    `- Turns: ${summary.turnCount}`,
    `- Question satisfaction rate: ${Math.round(summary.satisfactionRate * 100)}%`,
    `- Severity counts: ${severityLine(summary)}`,
    `- Category counts: ${categoryLine(summary)}`,
    `- Progress preservation: ${progressMetricsLine(summary)}`,
    "",
    "## Worst Conversations",
    "",
    ...summary.worstConversations.map((item) => `- ${item.overallScore}/100 — ${item.scenarioTitle} (${item.findingCount} findings)`),
    "",
    "## Failures",
    "",
    failures || "No failures found.",
    "",
  ].join("\n")
}

export function evaluateConversationDataset(sourceFile = join(process.cwd(), "conversation-lab", "datasets", "generated", "latest.jsonl")) {
  const conversations = readJsonl(sourceFile)
  const judgements = judgeConversations(conversations)
  const turnCount = conversations.reduce((sum, conversation) => sum + conversation.turns.length, 0)
  const summary = summarizeJudgements(judgements, sourceFile, turnCount, conversations)
  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const summaryBase = `${stamp}-${basename(sourceFile).replace(/\.jsonl$/, "")}`
  const summaryJsonPath = join(process.cwd(), "conversation-lab", "reports", "summary", `${summaryBase}.json`)
  const summaryMarkdownPath = join(process.cwd(), "conversation-lab", "reports", "summary", `${summaryBase}.md`)
  const failuresPath = join(process.cwd(), "conversation-lab", "reports", "failures", `${summaryBase}.json`)
  const latestSummaryPath = join(process.cwd(), "conversation-lab", "reports", "summary", "latest.md")

  writeJson(summaryJsonPath, { summary, judgements })
  writeJson(failuresPath, judgements.filter((judgement) => judgement.findings.length))
  const markdown = formatMarkdown(summary, judgements)
  mkdirSync(dirname(summaryMarkdownPath), { recursive: true })
  writeFileSync(summaryMarkdownPath, markdown, "utf8")
  writeFileSync(latestSummaryPath, markdown, "utf8")

  return {
    sourceFile,
    summary,
    summaryJsonPath,
    summaryMarkdownPath,
    latestSummaryPath,
    failuresPath,
  }
}

if (process.argv[1]?.endsWith("evaluate-conversations.ts")) {
  const sourceFile = process.argv[2] ?? join(process.cwd(), "conversation-lab", "datasets", "generated", "latest.jsonl")
  const result = evaluateConversationDataset(sourceFile)
  console.log(`Conversation Lab evaluated ${result.summary.conversationCount} conversations / ${result.summary.turnCount} turns`)
  console.log(`Satisfaction: ${Math.round(result.summary.satisfactionRate * 100)}%`)
  console.log(`Failures: ${result.failuresPath}`)
  console.log(`Summary: ${result.latestSummaryPath}`)
}
