import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { buildAppointmentModelContextPack } from "@/lib/conversation-kernel/appointment/build-appointment-model-context-pack"
import {
  buildEvalMetricRecord,
  formatMetricsReport,
  summarizeMetrics,
  type EvalMetricRecord,
} from "@/lib/conversation-kernel/eval-metrics"
import { classifyTurn } from "@/lib/conversation-kernel/strategy-executor"
import {
  resolveRuleKernelStub,
  touchKernelSessionFromMessage,
} from "@/lib/conversation-kernel/rule-kernel-stub"
import type { AnswerabilityClass } from "@/lib/conversation-kernel/answerability-classifier"
import type { ResponseStrategy } from "@/lib/conversation-kernel/strategy-executor"
import { createKernelSession, type KernelResponse, type SelectedContextItem } from "@/lib/conversation-kernel/types"
import { barberShopArrivalContext, barberShopConfig, barberShopHeroOperationalContext } from "@/lib/mock-data/appointment-data"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const WS19B_PATH = path.join(ROOT, "docs/audit/ws19b-conversational-coverage.json")

export type Ws19bScenario = {
  id: string
  matrixRef?: string
  prompt: string
  prior_turns?: string[]
  chip?: { kind: string; title: string; id?: string; knownFacts?: string[] } | null
  expected_lane: AnswerabilityClass | "any"
  expected_strategy: ResponseStrategy | "any"
  forbidden_patterns?: string[]
  escape_expected: boolean
  critical: boolean
}

export type Ws19bCoverageFile = {
  version: string
  gate: { escapeRateMaxPercent: number; criticalWrongLaneMax: number }
  scenarios: Ws19bScenario[]
}

const appointmentCtx = {
  brandName: barberShopConfig.name,
  operational: {
    liveState: barberShopHeroOperationalContext.liveState,
    placeHint: barberShopHeroOperationalContext.placeHint,
    momentHint: barberShopHeroOperationalContext.momentHint,
    hoursHint: barberShopHeroOperationalContext.hoursHint,
    openingHours: barberShopConfig.openingHours ?? "Seg-Sab: 9h-20h",
  },
  arrival: {
    addressLine: barberShopArrivalContext.addressLine,
    parkingHint: barberShopArrivalContext.parkingHint,
    referenceHint: barberShopArrivalContext.referenceHint,
  },
  serviceNames: [] as string[],
}

function chipFromScenario(scenario: Ws19bScenario): SelectedContextItem[] | undefined {
  if (!scenario.chip) return undefined
  const c = scenario.chip
  return [
    {
      id: c.id ?? `ws19b-${scenario.id}`,
      kind: c.kind as SelectedContextItem["kind"],
      title: c.title,
      knownFacts: c.knownFacts ?? [],
      belongsToCurrentHouse: true,
      isExternalOrEditorial: false,
    },
  ]
}

export function runWs19bScenario(scenario: Ws19bScenario): {
  response: KernelResponse | null
  record: EvalMetricRecord
} {
  const pack = buildAppointmentModelContextPack({ ctx: appointmentCtx })
  const selected = chipFromScenario(scenario)
  if (selected?.length) {
    pack.selectedContextItems = selected
  }

  const session = createKernelSession()
  const turns = [...(scenario.prior_turns ?? []), scenario.prompt]
  let response: KernelResponse | null = null

  for (const message of turns) {
    response = resolveRuleKernelStub({ message, pack, session })
    touchKernelSessionFromMessage(message, session, pack)
  }

  const lastMessage = scenario.prompt
  const turn = classifyTurn(lastMessage, pack, session)
  const actual_lane = turn.lane
  const actual_strategy = turn.strategy

  const record = buildEvalMetricRecord({
    eval_id: scenario.id,
    expected_lane: scenario.expected_lane,
    actual_lane,
    expected_strategy: scenario.expected_strategy,
    actual_strategy,
    response,
  })

  return { response, record }
}

export function loadWs19bCoverage(): Ws19bCoverageFile {
  return JSON.parse(readFileSync(WS19B_PATH, "utf8")) as Ws19bCoverageFile
}

export function runWs19bMetrics(): {
  records: EvalMetricRecord[]
  summary: ReturnType<typeof summarizeMetrics>
  gateOk: boolean
  failures: string[]
} {
  const file = loadWs19bCoverage()
  const scenarios = file.scenarios.slice(0, 40)
  const criticalIds = new Set(scenarios.filter((s) => s.critical).map((s) => s.id))
  const records: EvalMetricRecord[] = []
  const failures: string[] = []

  for (const scenario of scenarios) {
    const { response, record } = runWs19bScenario(scenario)

    for (const pat of scenario.forbidden_patterns ?? []) {
      if (response?.reply && new RegExp(pat, "i").test(response.reply)) {
        failures.push(`${scenario.id}: forbidden pattern ${pat}`)
      }
    }

    if (!scenario.escape_expected && record.escaped) {
      failures.push(
        `${scenario.id}: unexpected escape (${record.escape_reason ?? "unknown"}) ref=${scenario.matrixRef ?? ""}`
      )
    }

    records.push(record)
  }

  const summary = summarizeMetrics(records, criticalIds)
  const escapePct = summary.total > 0 ? (summary.escapeCount / summary.total) * 100 : 0
  const gateOk =
    escapePct < file.gate.escapeRateMaxPercent &&
    summary.criticalWrongLaneCount <= file.gate.criticalWrongLaneMax

  if (summary.criticalWrongLaneCount > 0) {
    for (const r of records) {
      if (r.wrong_lane && criticalIds.has(r.eval_id)) {
        failures.push(
          `${r.eval_id}: wrong_lane expected=${r.expected_lane}/${r.expected_strategy} actual=${r.actual_lane}/${r.actual_strategy}`
        )
      }
    }
  }

  return { records, summary, gateOk, failures }
}

export function printWs19bReport(records: EvalMetricRecord[], summary: ReturnType<typeof summarizeMetrics>): void {
  console.log("\n--- WS-19B Top 40 metrics ---")
  for (const r of records) {
    const flags = [
      r.escaped ? `escape=${r.escape_reason}` : "ok",
      r.wrong_lane ? "wrong_lane" : "",
    ]
      .filter(Boolean)
      .join(" · ")
    console.log(
      `${r.escaped || r.wrong_lane ? "WARN" : "OK  "} ${r.eval_id} lane=${r.actual_lane} strategy=${r.actual_strategy} (${flags})`
    )
  }
  console.log("\n" + formatMetricsReport(summary))
}
