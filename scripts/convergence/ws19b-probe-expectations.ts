/**
 * One-off helper: probe matrixRef scenarios and print actual lane/strategy for WS-19B JSON.
 * npx --yes tsx scripts/convergence/ws19b-probe-expectations.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { buildAppointmentModelContextPack } from "@/lib/conversation-kernel/appointment/build-appointment-model-context-pack"
import { classifyTurn } from "@/lib/conversation-kernel/strategy-executor"
import {
  resolveRuleKernelStub,
  touchKernelSessionFromMessage,
} from "@/lib/conversation-kernel/rule-kernel-stub"
import { createKernelSession } from "@/lib/conversation-kernel/types"
import type { SelectedContextItem } from "@/lib/conversation-kernel/types"
import { barberShopArrivalContext, barberShopConfig, barberShopHeroOperationalContext } from "@/lib/mock-data/appointment-data"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const MATRIX_PATH = path.join(ROOT, "docs/audit/ws19a-conversation-kernel-eval-matrix.json")

const MATRIX_REFS = [
  "E-G01", "E-G02", "E-G03", "E-G04", "E-G05", "E-G06", "E-G07", "E-G08", "E-G09", "E-G10",
  "E-G18", "E-G19", "E-G20", "E-G21", "E-G22", "E-G23", "E-G24", "E-G25", "E-G26", "E-G27",
  "E-G28", "E-G29", "E-G30", "E-G31", "E-G33", "E-G34", "E-G35", "E-G36", "E-G37", "E-G38",
  "E-G39", "E-G40", "E-G41", "E-G42", "E-G43", "E-G44", "E-G45",
  "E-M-APT-15", "E-M-APT-16", "E-M-APT-17", "E-M-APT-18",
]

type EvalRow = {
  id: string
  prompts: string[]
  selectedContext?: SelectedContextItem & { id?: string }
}

function evalRowById(id: string): EvalRow | undefined {
  const matrix = JSON.parse(readFileSync(MATRIX_PATH, "utf8"))
  const global = matrix.global as EvalRow[]
  const found = global.find((e) => e.id === id)
  if (found) return found
  for (const model of ["appointment", "restaurant", "health", "ecommerce"] as const) {
    const row = (matrix.perModel[model] as EvalRow[]).find((e) => e.id === id)
    if (row) return row
  }
  return undefined
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

function selectedFromEval(row: EvalRow): SelectedContextItem[] | undefined {
  if (!row.selectedContext) return undefined
  const sc = row.selectedContext
  return [
    {
      id: sc.id ?? `eval-${row.id}`,
      kind: sc.kind ?? "unknown",
      title: sc.title,
      knownFacts: sc.knownFacts ?? [],
      belongsToCurrentHouse: sc.belongsToCurrentHouse ?? true,
      isExternalOrEditorial: sc.isExternalOrEditorial ?? false,
      relatedEntityIds: sc.relatedEntityIds,
    },
  ]
}

const scenarios: object[] = []

for (let i = 0; i < MATRIX_REFS.length; i++) {
  const matrixRef = MATRIX_REFS[i]
  const row = evalRowById(matrixRef)
  if (!row) {
    console.error("missing", matrixRef)
    continue
  }
  const prompts = row.prompts.filter(Boolean)
  const selected = selectedFromEval(row)
  const pack = buildAppointmentModelContextPack({ ctx: appointmentCtx })
  if (selected?.length) {
    Object.assign(pack, { selectedContextItems: selected })
  }
  const session = createKernelSession()
  let response = null
  for (const p of prompts) {
    response = resolveRuleKernelStub({ message: p, pack, session })
    touchKernelSessionFromMessage(p, session, pack)
  }
  const lastPrompt = prompts[prompts.length - 1] ?? ""
  const turn = classifyTurn(lastPrompt, pack, session)

  scenarios.push({
    id: `B-${String(i + 1).padStart(2, "0")}`,
    matrixRef,
    prompt: lastPrompt,
    prior_turns: prompts.slice(0, -1),
    chip: selected?.[0]
      ? { kind: selected[0].kind, title: selected[0].title }
      : null,
    expected_lane: turn.lane,
    expected_strategy: turn.strategy,
    forbidden_patterns: ["veja servi(c|o)s e profissionais no feed quando quiser"],
    escape_expected: false,
    critical: true,
  })

  console.log(matrixRef, turn.lane, turn.strategy, response?.action.type ?? "null")
}

const out = {
  version: "1.0.0",
  workstream: "WS-19B",
  charter: "docs/audit/WS-19B_CONVERSATIONAL_COVERAGE.md",
  gate: {
    escapeRateMaxPercent: 5,
    criticalWrongLaneMax: 0,
  },
  scenarios: scenarios.slice(0, 40),
}

writeFileSync(
  path.join(ROOT, "docs/audit/ws19b-conversational-coverage.json"),
  JSON.stringify(out, null, 2) + "\n"
)
console.log(`\nWrote ${scenarios.length} scenarios`)
