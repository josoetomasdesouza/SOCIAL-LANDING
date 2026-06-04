import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
export const REALITY_HARVEST_PATH = path.join(ROOT, "docs/audit/ws19b-reality-harvest.json")
const MATRIX_PATH = path.join(ROOT, "docs/audit/ws19a-conversation-kernel-eval-matrix.json")

export type RealityCaptureStatus = "backlog" | "fixed" | "promoted"

export type RealityCapture = {
  id: string
  date: string
  /** ISO-8601 capture time (WS-19C). */
  timestamp?: string
  /** Vertical under test (e.g. appointment). */
  vertical?: string
  smoke_axis?: string
  source: string
  chip: {
    kind: string
    title: string
    id?: string
    knownFacts?: string[]
  } | null
  prior_turns: string[]
  prompt?: string
  actual_behavior: string
  expected_behavior: string
  root_cause: string
  promoted_to_eval?: string | null
  promoted_to_corpus?: string[]
  status: RealityCaptureStatus
}

export type RealityHarvestFile = {
  version: string
  entries: RealityCapture[]
  targets?: { corpusRealityMin?: number }
}

/** Advisory target — v1.3 Reality Acceleration (does not fail CI). */
export const REALITY_CORPUS_TARGET = 10

export type RealityMetrics = {
  reality_count: number
  synthetic_count: number
  reality_percentage: number
}

export function buildRealityMetrics(reality: number, synthetic: number): RealityMetrics {
  const total = reality + synthetic
  const pct = total > 0 ? (reality / total) * 100 : 0
  return {
    reality_count: reality,
    synthetic_count: synthetic,
    reality_percentage: Math.round(pct * 10) / 10,
  }
}

export type RealityTargetDashboard = {
  reality_count: number
  reality_target: number
  remaining_to_target: number
}

export function buildRealityTargetDashboard(
  realityCount: number,
  target = REALITY_CORPUS_TARGET
): RealityTargetDashboard {
  return {
    reality_count: realityCount,
    reality_target: target,
    remaining_to_target: Math.max(0, target - realityCount),
  }
}

export function formatRealityTargetDashboard(d: RealityTargetDashboard): string {
  return `Reality: ${d.reality_count} / ${d.reality_target}\nremaining: ${d.remaining_to_target}`
}

export type RealityPromotionDashboard = {
  backlog: number
  promoted: number
  fixed: number
  pending: number
}

export function summarizeRealityPromotionDashboard(
  entries: RealityCapture[]
): RealityPromotionDashboard {
  let backlog = 0
  let promoted = 0
  let fixed = 0
  for (const e of entries) {
    if (e.status === "backlog") backlog++
    else if (e.status === "promoted") promoted++
    else if (e.status === "fixed") fixed++
  }
  return { backlog, promoted, fixed, pending: backlog + fixed }
}

export type TopRealityScenario = {
  rh_id: string
  eval_id: string | null
  corpus_ids: string[]
}

/** Promoted RH entries for WS-19B «Top Reality Scenarios» review. */
export function listTopRealityScenarios(entries: RealityCapture[]): TopRealityScenario[] {
  return entries
    .filter((e) => e.status === "promoted")
    .map((e) => ({
      rh_id: e.id,
      eval_id: e.promoted_to_eval ?? null,
      corpus_ids: e.promoted_to_corpus ?? [],
    }))
}

export function realityAccelerationWarnings(
  metrics: RealityMetrics,
  target = REALITY_CORPUS_TARGET
): string[] {
  if (metrics.reality_count >= target) return []
  return [
    `Reality Acceleration: reality_count ${metrics.reality_count} < ${target} (advisory — build not blocked)`,
  ]
}

const REQUIRED_FIELDS = [
  "id",
  "date",
  "source",
  "chip",
  "prior_turns",
  "actual_behavior",
  "expected_behavior",
  "root_cause",
  "promoted_to_eval",
] as const

export function loadRealityHarvest(): RealityHarvestFile {
  return JSON.parse(readFileSync(REALITY_HARVEST_PATH, "utf8")) as RealityHarvestFile
}

function evalExistsInMatrix(evalId: string): boolean {
  const matrix = JSON.parse(readFileSync(MATRIX_PATH, "utf8")) as {
    global?: { id: string }[]
    perModel?: Record<string, { id: string }[]>
    crossModel?: { id: string }[]
  }
  if (matrix.global?.some((e) => e.id === evalId)) return true
  for (const rows of Object.values(matrix.perModel ?? {})) {
    if (rows.some((e) => e.id === evalId)) return true
  }
  return matrix.crossModel?.some((e) => e.id === evalId) ?? false
}

export type RealityHarvestValidation = {
  ok: boolean
  errors: string[]
  promotedCorpusIds: Map<string, string>
}

/** Validates capture shape and promotion links (corpus + matrix). */
export function validateRealityHarvest(corpusScenarioIds: Set<string>): RealityHarvestValidation {
  const errors: string[] = []
  const promotedCorpusIds = new Map<string, string>()

  if (!existsSync(REALITY_HARVEST_PATH)) {
    return { ok: false, errors: ["missing ws19b-reality-harvest.json"], promotedCorpusIds }
  }

  const file = loadRealityHarvest()
  const seen = new Set<string>()

  for (const entry of file.entries) {
    for (const field of REQUIRED_FIELDS) {
      if (!(field in entry)) {
        errors.push(`${entry.id ?? "?"}: missing field ${field}`)
      }
    }
    if (!entry.id?.startsWith("RH-")) {
      errors.push(`${entry.id}: id must start with RH-`)
    }
    if (seen.has(entry.id)) {
      errors.push(`${entry.id}: duplicate reality id`)
    }
    seen.add(entry.id)

    if (!Array.isArray(entry.prior_turns)) {
      errors.push(`${entry.id}: prior_turns must be array`)
    }

    if (entry.status === "promoted") {
      if (!entry.promoted_to_eval) {
        errors.push(`${entry.id}: promoted status requires promoted_to_eval`)
      } else if (!evalExistsInMatrix(entry.promoted_to_eval)) {
        errors.push(`${entry.id}: promoted_to_eval ${entry.promoted_to_eval} not in matrix`)
      }
      for (const corpusId of entry.promoted_to_corpus ?? []) {
        if (!corpusScenarioIds.has(corpusId)) {
          errors.push(`${entry.id}: promoted_to_corpus ${corpusId} missing from WS-19B corpus`)
        }
        promotedCorpusIds.set(corpusId, entry.id)
      }
      if ((entry.promoted_to_corpus ?? []).length === 0) {
        errors.push(`${entry.id}: promoted status requires promoted_to_corpus`)
      }
    }
  }

  return { ok: errors.length === 0, errors, promotedCorpusIds }
}

export type ScenarioOrigin = "reality" | "synthetic"

export function countScenarioOrigins(
  scenarios: { id: string; origin?: ScenarioOrigin; realityRef?: string }[]
): { reality: number; synthetic: number; realityRefs: string[] } {
  let reality = 0
  let synthetic = 0
  const realityRefs: string[] = []
  for (const s of scenarios) {
    if (s.origin === "reality") {
      reality++
      if (s.realityRef) realityRefs.push(`${s.id}←${s.realityRef}`)
    } else {
      synthetic++
    }
  }
  return { reality, synthetic, realityRefs }
}

export function assertCorpusRealityLinks(
  scenarios: { id: string; origin?: ScenarioOrigin; realityRef?: string }[],
  promotedCorpusIds: Map<string, string>
): string[] {
  const errors: string[] = []
  for (const s of scenarios) {
    if (s.origin === "reality") {
      if (!s.realityRef) {
        errors.push(`${s.id}: origin reality without realityRef`)
      } else if (promotedCorpusIds.get(s.id) !== s.realityRef) {
        errors.push(`${s.id}: realityRef ${s.realityRef} does not match harvest promotion`)
      }
    }
  }
  for (const [corpusId, rhId] of promotedCorpusIds) {
    const s = scenarios.find((x) => x.id === corpusId)
    if (s && s.origin !== "reality") {
      errors.push(`${corpusId}: harvest ${rhId} promoted but scenario origin is not reality`)
    }
  }
  return errors
}
