import type { AnswerabilityClass } from "./answerability-classifier"
import type { ResponseStrategy } from "./strategy-executor"
import type { KernelResponse } from "./types"

/** Escape taxonomy — WS-19A PR4 (not mixed with wrong_lane). */
export type EscapeReason =
  | "situated_fallback"
  | "augusta_generic"
  | "broad_clarify_unexpected"
  | "transactional_unexpected"
  | "empty_or_null"

export type EvalMetricRecord = {
  eval_id: string
  expected_lane: AnswerabilityClass | "any"
  actual_lane: AnswerabilityClass | "none"
  expected_strategy: ResponseStrategy | "any"
  actual_strategy: ResponseStrategy | "none"
  escaped: boolean
  escape_reason?: EscapeReason
  wrong_lane: boolean
}

const AUGUSTA_GENERIC = /veja servi[cç]os e profissionais no feed quando quiser/i
/** Legacy situated fallback copy — not in-domain meta ack (PR4 observability). */
const SITUATED_FALLBACK = /me conta em uma linha:\s*cabelo|veja servi[cç]os e profissionais no feed quando quiser/i
const BROAD_CLARIFY_REPLY = /não captei o foco|nao captei o foco/i

export function detectEscape(params: {
  response: KernelResponse | null
  actual_strategy: ResponseStrategy | "none"
  expected_strategy: ResponseStrategy | "any"
}): { escaped: boolean; escape_reason?: EscapeReason } {
  const { response, actual_strategy, expected_strategy } = params
  const reply = response?.reply?.trim() ?? ""

  if (!response) {
    return { escaped: true, escape_reason: "empty_or_null" }
  }

  if (!reply && actual_strategy !== "delegate_08c") {
    return { escaped: true, escape_reason: "empty_or_null" }
  }

  if (!reply && actual_strategy === "delegate_08c") {
    return { escaped: false }
  }

  if (AUGUSTA_GENERIC.test(reply)) {
    return { escaped: true, escape_reason: "augusta_generic" }
  }

  if (SITUATED_FALLBACK.test(reply)) {
    return { escaped: true, escape_reason: "situated_fallback" }
  }

  if (
    actual_strategy === "delegate_08c" &&
    expected_strategy !== "any" &&
    expected_strategy !== "delegate_08c"
  ) {
    return { escaped: true, escape_reason: "transactional_unexpected" }
  }

  const broadUnexpected =
    (actual_strategy === "clarify_broad" || BROAD_CLARIFY_REPLY.test(reply)) &&
    expected_strategy !== "any" &&
    expected_strategy !== "clarify_broad" &&
    expected_strategy !== "clarify_target"

  if (broadUnexpected) {
    return { escaped: true, escape_reason: "broad_clarify_unexpected" }
  }

  return { escaped: false }
}

export function isWrongLane(params: {
  expected_lane: AnswerabilityClass | "any"
  actual_lane: AnswerabilityClass | "none"
  expected_strategy: ResponseStrategy | "any"
  actual_strategy: ResponseStrategy | "none"
}): boolean {
  const laneMismatch =
    params.expected_lane !== "any" &&
    params.actual_lane !== "none" &&
    params.expected_lane !== params.actual_lane
  const strategyMismatch =
    params.expected_strategy !== "any" &&
    params.actual_strategy !== "none" &&
    params.expected_strategy !== params.actual_strategy
  return laneMismatch || strategyMismatch
}

export function buildEvalMetricRecord(params: {
  eval_id: string
  expected_lane: AnswerabilityClass | "any"
  actual_lane: AnswerabilityClass | "none"
  expected_strategy: ResponseStrategy | "any"
  actual_strategy: ResponseStrategy | "none"
  response: KernelResponse | null
}): EvalMetricRecord {
  const { escaped, escape_reason } = detectEscape({
    response: params.response,
    actual_strategy: params.actual_strategy,
    expected_strategy: params.expected_strategy,
  })
  const wrong_lane = isWrongLane({
    expected_lane: params.expected_lane,
    actual_lane: params.actual_lane,
    expected_strategy: params.expected_strategy,
    actual_strategy: params.actual_strategy,
  })

  return {
    eval_id: params.eval_id,
    expected_lane: params.expected_lane,
    actual_lane: params.actual_lane,
    expected_strategy: params.expected_strategy,
    actual_strategy: params.actual_strategy,
    escaped,
    escape_reason: escaped ? escape_reason : undefined,
    wrong_lane,
  }
}

export type MetricsSummary = {
  total: number
  escapeCount: number
  wrongLaneCount: number
  criticalWrongLaneCount: number
  escapeByReason: Partial<Record<EscapeReason, number>>
}

export function summarizeMetrics(
  records: EvalMetricRecord[],
  criticalIds: Set<string>
): MetricsSummary {
  const escapeByReason: Partial<Record<EscapeReason, number>> = {}
  let escapeCount = 0
  let wrongLaneCount = 0
  let criticalWrongLaneCount = 0

  for (const r of records) {
    if (r.escaped) {
      escapeCount++
      if (r.escape_reason) {
        escapeByReason[r.escape_reason] = (escapeByReason[r.escape_reason] ?? 0) + 1
      }
    }
    if (r.wrong_lane) {
      wrongLaneCount++
      if (criticalIds.has(r.eval_id)) criticalWrongLaneCount++
    }
  }

  return {
    total: records.length,
    escapeCount,
    wrongLaneCount,
    criticalWrongLaneCount,
    escapeByReason,
  }
}

export function formatMetricsReport(summary: MetricsSummary): string {
  const escapePct =
    summary.total > 0 ? ((summary.escapeCount / summary.total) * 100).toFixed(1) : "0.0"
  const wrongPct =
    summary.total > 0 ? ((summary.wrongLaneCount / summary.total) * 100).toFixed(1) : "0.0"

  const reasonLines = Object.entries(summary.escapeByReason)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .map(([k, v]) => `  - ${k}: ${v}`)
    .join("\n")

  return [
    "Escape Rate:",
    `${summary.escapeCount} / ${summary.total} (${escapePct}%)`,
    "",
    "Wrong Lane Rate:",
    `${summary.wrongLaneCount} / ${summary.total} (${wrongPct}%)`,
    summary.criticalWrongLaneCount > 0
      ? `Critical wrong lane: ${summary.criticalWrongLaneCount}`
      : "Critical wrong lane: 0",
    "",
    "Top escape reasons:",
    reasonLines || "  (none)",
  ].join("\n")
}
