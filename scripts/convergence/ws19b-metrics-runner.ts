import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { buildAppointmentModelContextPack } from "@/lib/conversation-kernel/appointment/build-appointment-model-context-pack"
import {
  buildEvalMetricRecord,
  formatMetricsReport,
  summarizeMetrics,
  type EscapeReason,
  type EvalMetricRecord,
} from "@/lib/conversation-kernel/eval-metrics"
import { classifyTurn } from "@/lib/conversation-kernel/strategy-executor"
import {
  resolveRuleKernelStub,
  touchKernelSessionFromMessage,
} from "@/lib/conversation-kernel/rule-kernel-stub"
import type { AnswerabilityClass } from "@/lib/conversation-kernel/answerability-classifier"
import type { ResponseStrategy } from "@/lib/conversation-kernel/strategy-executor"
import {
  createKernelSession,
  type KernelAction,
  type KernelResponse,
  type SelectedContextItem,
} from "@/lib/conversation-kernel/types"
import { barberShopArrivalContext, barberShopConfig, barberShopHeroOperationalContext } from "@/lib/mock-data/appointment-data"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const WS19B_PATH = path.join(ROOT, "docs/audit/ws19b-conversational-coverage.json")

export type Ws19bCalibration = "probe" | "human"

export type Ws19bControlFixture = {
  reply: string
  action?: KernelAction
}

export type Ws19bScenario = {
  id: string
  matrixRef?: string
  prompt: string
  prior_turns?: string[]
  chip?: { kind: string; title: string; id?: string; knownFacts?: string[] } | null
  expected_lane: AnswerabilityClass | "any"
  expected_strategy: ResponseStrategy | "any"
  forbidden_patterns?: string[]
  forbidden_action_types?: string[]
  escape_expected: boolean
  expected_escape_reason?: EscapeReason
  critical: boolean
  calibration: Ws19bCalibration
  tags?: string[]
  adversarial?: boolean
  known_product_gap?: boolean
  control_fixture?: Ws19bControlFixture
}

export type Ws19bCoverageFile = {
  version: string
  gate: {
    escapeRateMaxPercent: number
    criticalWrongLaneMax: number
    escapeRateScope?: string
    wrongLaneScope?: string
    corpusMin?: number
    humanCalibratedMin?: number
  }
  stats?: {
    total: number
    humanCalibrated: number
    probeCalibrated?: number
    adversarial: number
    negativeControls: number
  }
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

function responseFromFixture(fixture: Ws19bControlFixture): KernelResponse {
  return {
    reply: fixture.reply,
    intent: "discover",
    domainZone: "in_domain",
    topic: "negative_control_fixture",
    topicShift: false,
    structure: { acknowledged: true, answered: false },
    confidence: "medium",
    action: fixture.action ?? ({ type: "text_only" } satisfies KernelAction),
    source: "rule_table",
    grounding: { source: "none", itemIds: [], confidence: "low" },
  }
}

function isNegativeControl(scenario: Ws19bScenario): boolean {
  return scenario.tags?.includes("negative_control") ?? false
}

function isAdversarial(scenario: Ws19bScenario): boolean {
  return scenario.adversarial === true || scenario.tags?.includes("adversarial") === true
}

function isEscapeRateDenominator(scenario: Ws19bScenario): boolean {
  return !scenario.escape_expected && !isNegativeControl(scenario) && !isAdversarial(scenario)
}

function isWrongLaneGateScope(scenario: Ws19bScenario): boolean {
  return (
    scenario.critical &&
    scenario.calibration === "human" &&
    !isAdversarial(scenario) &&
    !scenario.known_product_gap &&
    !isNegativeControl(scenario) &&
    !scenario.escape_expected
  )
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
  let response: KernelResponse | null = null

  if (scenario.control_fixture) {
    response = responseFromFixture(scenario.control_fixture)
  } else {
    const turns = [...(scenario.prior_turns ?? []), scenario.prompt]
    for (const message of turns) {
      response = resolveRuleKernelStub({ message, pack, session })
      touchKernelSessionFromMessage(message, session, pack)
    }
  }

  const lastMessage = scenario.control_fixture ? scenario.prompt : scenario.prompt
  const turn = classifyTurn(lastMessage, pack, session)

  const record = buildEvalMetricRecord({
    eval_id: scenario.id,
    expected_lane: scenario.expected_lane,
    actual_lane: turn.lane,
    expected_strategy: scenario.expected_strategy,
    actual_strategy: turn.strategy,
    response,
  })

  return { response, record }
}

export function loadWs19bCoverage(): Ws19bCoverageFile {
  return JSON.parse(readFileSync(WS19B_PATH, "utf8")) as Ws19bCoverageFile
}

export type Ws19bMetricsResult = {
  records: EvalMetricRecord[]
  summary: ReturnType<typeof summarizeMetrics>
  gateSummary: ReturnType<typeof summarizeMetrics>
  calibration: { human: number; probe: number }
  gateOk: boolean
  failures: string[]
}

export function runWs19bMetrics(): Ws19bMetricsResult {
  const file = loadWs19bCoverage()
  const byId = new Map<string, Ws19bScenario>()
  for (const s of file.scenarios) {
    if (s.id) byId.set(s.id, s)
  }
  const scenarios = [...byId.values()]
  const wrongLaneGateIds = new Set(scenarios.filter(isWrongLaneGateScope).map((s) => s.id))
  const escapeGateRecords: EvalMetricRecord[] = []
  const records: EvalMetricRecord[] = []
  const failures: string[] = []

  let humanCount = 0
  let probeCount = 0

  for (const scenario of scenarios) {
    if (scenario.calibration === "human") humanCount++
    else probeCount++

    const { response, record } = runWs19bScenario(scenario)
    records.push(record)

    if (isEscapeRateDenominator(scenario)) {
      escapeGateRecords.push(record)
    }

    const enforce = !isAdversarial(scenario)

    if (!isNegativeControl(scenario)) {
      for (const pat of scenario.forbidden_patterns ?? []) {
        if (response?.reply && new RegExp(pat, "i").test(response.reply)) {
          const msg = `${scenario.id}: forbidden pattern ${pat}`
          if (enforce) failures.push(msg)
        }
      }
    }

    for (const actionType of scenario.forbidden_action_types ?? []) {
      if (response?.action.type === actionType) {
        const msg = `${scenario.id}: forbidden action ${actionType}`
        if (enforce) failures.push(msg)
      }
    }

    if (scenario.escape_expected) {
      if (!record.escaped) {
        failures.push(`${scenario.id}: expected escape but none detected`)
      } else if (
        scenario.expected_escape_reason &&
        record.escape_reason !== scenario.expected_escape_reason
      ) {
        failures.push(
          `${scenario.id}: expected escape_reason ${scenario.expected_escape_reason} got ${record.escape_reason ?? "none"}`
        )
      }
    } else if (record.escaped && enforce) {
      failures.push(
        `${scenario.id}: unexpected escape (${record.escape_reason ?? "unknown"}) ref=${scenario.matrixRef ?? ""}`
      )
    }
  }

  const summary = summarizeMetrics(records, new Set(scenarios.filter((s) => s.critical).map((s) => s.id)))
  const gateSummary = summarizeMetrics(escapeGateRecords, wrongLaneGateIds)

  const escapePct =
    gateSummary.total > 0 ? (gateSummary.escapeCount / gateSummary.total) * 100 : 0
  const gateOk =
    escapePct < file.gate.escapeRateMaxPercent &&
    gateSummary.criticalWrongLaneCount <= file.gate.criticalWrongLaneMax

  if (gateSummary.criticalWrongLaneCount > 0) {
    for (const r of records) {
      if (r.wrong_lane && wrongLaneGateIds.has(r.eval_id)) {
        failures.push(
          `${r.eval_id}: wrong_lane expected=${r.expected_lane}/${r.expected_strategy} actual=${r.actual_lane}/${r.actual_strategy}`
        )
      }
    }
  }

  const humanMin = file.gate.humanCalibratedMin ?? 40
  const corpusMin = file.gate.corpusMin ?? 60

  if (humanCount < humanMin) {
    failures.push(`human calibration count ${humanCount} < ${humanMin} required`)
  }

  if (scenarios.length < corpusMin) {
    failures.push(`corpus size ${scenarios.length} < ${corpusMin} required`)
  }

  return {
    records,
    summary,
    gateSummary,
    calibration: { human: humanCount, probe: probeCount },
    gateOk,
    failures,
  }
}

export function printWs19bReport(result: Ws19bMetricsResult, file?: Ws19bCoverageFile): void {
  const { records, summary, gateSummary, calibration } = result
  const stats = file?.stats
  const adversarial =
    stats?.adversarial ??
    records.filter((_, i) => {
      const s = file?.scenarios[i]
      return s?.adversarial === true || s?.tags?.includes("adversarial")
    }).length
  const negativeControls =
    stats?.negativeControls ?? file?.scenarios.filter((s) => s.tags?.includes("negative_control")).length ?? 0

  console.log("\n--- WS-19B coverage metrics ---")
  console.log(`Total scenarios: ${records.length}`)
  console.log(`Human calibrated: ${calibration.human}`)
  console.log(`Probe calibrated: ${calibration.probe}`)
  console.log(`Adversarial: ${adversarial}`)
  console.log(`Negative controls: ${negativeControls}`)

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

  console.log("\n--- Full corpus ---")
  console.log(formatMetricsReport(summary))

  console.log("\n--- Gate scope (escape_expected=false, non-control) ---")
  console.log(formatMetricsReport(gateSummary))
}
