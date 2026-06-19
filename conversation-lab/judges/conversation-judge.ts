import { evaluateContinuity } from "../evaluators/continuity-evaluator"
import { evaluateInventedData } from "../evaluators/invented-data-evaluator"
import { evaluateNaturalness } from "../evaluators/naturalness-evaluator"
import { evaluateNoLeak } from "../evaluators/no-leak-evaluator"
import { evaluateSatisfaction } from "../evaluators/satisfaction-evaluator"
import { evaluateToolUse } from "../evaluators/tool-use-evaluator"
import type { ConversationJudgement, LabConversation, LabFinding, LabSeverity, LabSummary } from "../types"

const CATEGORIES: LabFinding["category"][] = [
  "question_satisfaction",
  "continuity",
  "tool_use",
  "naturalness",
  "no_leak",
  "invented_data",
]

const SEVERITIES: LabSeverity[] = ["P0", "P1", "P2", "P3"]

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

function isRecoverableOperationalTurn(turn: LabConversation["turns"][number]) {
  return ["catalog", "booking", "schedule", "service_lookup", "product_lookup"].includes(turn.expectedTool) ||
    hasAny(turn.user, [
      "tem horario",
      "tem horário",
      "tem vaga",
      "quanto custa",
      "preco",
      "preço",
      "valor",
      "aceita cartao",
      "aceita cartão",
      "pix",
      "onde fica",
      "endereco",
      "endereço",
      "quantas pessoas",
      "faz sobrancelha",
      "atende criança",
      "atende crianca",
    ])
}

function hasDryBlockedAnswer(answer: string) {
  return hasAny(answer, [
    "não há confirmação",
    "nao ha confirmacao",
    "não tenho confirmação",
    "nao tenho confirmacao",
    "não há preço confirmado",
    "nao ha preco confirmado",
  ]) && !answer.includes("?")
}

function hasSlotRecoveryAnswer(answer: string) {
  return answer.includes("?") && hasAny(answer, [
    "manhã",
    "manha",
    "tarde",
    "noite",
    "corte masculino",
    "infantil",
    "barba",
    "credito",
    "crédito",
    "debito",
    "débito",
    "pix",
    "unidade",
    "qual serviço",
    "qual servico",
    "qual serviço?",
    "qual servico?",
  ])
}

function summarizeProgressMetrics(conversations: LabConversation[] | undefined, inventedDataCount: number): LabSummary["progressMetrics"] {
  const turns = conversations?.flatMap((conversation) => conversation.turns).filter(isRecoverableOperationalTurn) ?? []
  const distribution = { ADVANCES: 0, NEUTRAL: 0, BLOCKS: 0 }
  let blocked = 0
  let recovered = 0

  for (const turn of turns) {
    if (hasDryBlockedAnswer(turn.assistant)) {
      blocked += 1
      distribution.BLOCKS += 1
      continue
    }

    if (hasSlotRecoveryAnswer(turn.assistant)) {
      recovered += 1
      distribution.ADVANCES += 1
      continue
    }

    distribution.NEUTRAL += 1
  }

  return {
    blocked_response_rate: turns.length ? Math.round((blocked / turns.length) * 1000) / 1000 : 0,
    slot_recovery_rate: turns.length ? Math.round((recovered / turns.length) * 1000) / 1000 : 0,
    progress_delta_distribution: distribution,
    invented_data_count: inventedDataCount,
  }
}

export function judgeConversation(conversation: LabConversation): ConversationJudgement {
  const evaluatorResults = [
    evaluateSatisfaction(conversation),
    evaluateContinuity(conversation),
    evaluateToolUse(conversation),
    evaluateNaturalness(conversation),
    evaluateNoLeak(conversation),
    evaluateInventedData(conversation),
  ]
  const findings = evaluatorResults.flatMap((result) => result.findings)
  const overallScore = Math.round(evaluatorResults.reduce((sum, result) => sum + result.score, 0) / evaluatorResults.length)
  const satisfactionScore = evaluatorResults.find((result) => result.name === "satisfaction")?.score ?? 0

  return {
    conversationId: conversation.id,
    scenarioId: conversation.scenarioId,
    scenarioTitle: conversation.scenarioTitle,
    persona: conversation.persona,
    overallScore,
    satisfactionRate: satisfactionScore / 100,
    findings,
    evaluatorResults,
  }
}

export function judgeConversations(conversations: LabConversation[]) {
  return conversations.map(judgeConversation)
}

export function summarizeJudgements(judgements: ConversationJudgement[], sourceFile: string, turnCount = 0, conversations?: LabConversation[]): LabSummary {
  const findings = judgements.flatMap((judgement) => judgement.findings)
  const severityCounts = Object.fromEntries(SEVERITIES.map((severity) => [
    severity,
    findings.filter((finding) => finding.severity === severity).length,
  ])) as Record<LabSeverity, number>
  const categoryCounts = Object.fromEntries(CATEGORIES.map((category) => [
    category,
    findings.filter((finding) => finding.category === category).length,
  ])) as Record<LabFinding["category"], number>

  return {
    generatedAt: new Date().toISOString(),
    sourceFile,
    conversationCount: judgements.length,
    turnCount,
    satisfactionRate: judgements.length
      ? Math.round((judgements.reduce((sum, judgement) => sum + judgement.satisfactionRate, 0) / judgements.length) * 1000) / 1000
      : 0,
    severityCounts,
    categoryCounts,
    progressMetrics: summarizeProgressMetrics(conversations, categoryCounts.invented_data),
    worstConversations: [...judgements]
      .sort((a, b) => a.overallScore - b.overallScore)
      .slice(0, 8)
      .map((judgement) => ({
        conversationId: judgement.conversationId,
        scenarioTitle: judgement.scenarioTitle,
        overallScore: judgement.overallScore,
        findingCount: judgement.findings.length,
      })),
  }
}
