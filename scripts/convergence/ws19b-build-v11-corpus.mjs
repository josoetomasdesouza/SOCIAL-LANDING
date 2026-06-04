/**
 * WS-19B v1.1 corpus builder (observability only — no kernel changes).
 * Run: node scripts/convergence/ws19b-build-v11-corpus.mjs
 */
import { execSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const OUT = path.join(ROOT, "docs/audit/ws19b-conversational-coverage.json")
const HARVEST_PATH = path.join(ROOT, "docs/audit/ws19b-reality-harvest.json")

function applyRealityOrigin(list) {
  const harvest = JSON.parse(readFileSync(HARVEST_PATH, "utf8"))
  const corpusByRh = new Map()
  for (const entry of harvest.entries) {
    for (const corpusId of entry.promoted_to_corpus ?? []) {
      corpusByRh.set(corpusId, entry.id)
    }
  }
  return list.map((s) => {
    const rh = corpusByRh.get(s.id)
    if (rh) {
      return { ...s, origin: "reality", realityRef: rh }
    }
    return { ...s, origin: "synthetic" }
  })
}

const CORPUS_MIN = 60
const HUMAN_MIN = 40

function loadV1Corpus() {
  try {
    const v1 = execSync("git show origin/main:docs/audit/ws19b-conversational-coverage.json", {
      cwd: ROOT,
      encoding: "utf8",
    })
    return JSON.parse(v1)
  } catch {
    return JSON.parse(readFileSync(OUT, "utf8"))
  }
}

/** Classifier canary — expectations stay probe-aligned; not gate-critical wrong_lane. */
const PROBE_IDS = new Set([
  "B-01",
  "B-03",
  "B-04",
  "B-05",
  "B-06",
  "B-08",
  "B-09",
  "B-10",
  "B-11",
  "B-14",
  "B-18",
  "B-19",
  "B-25",
  "B-26",
  "B-30",
  "B-39",
])

/**
 * Product-intent lane/strategy (WS-19A matrix / eval review — not classifyTurn at build time).
 */
const MANUAL_EXPECT_BY_REF = {
  "E-G01": { expected_lane: "answerable_from_operational_context", expected_strategy: "direct" },
  "E-G02": { expected_lane: "answerable_from_operational_context", expected_strategy: "direct" },
  "E-G03": { expected_lane: "needs_clarification", expected_strategy: "clarify_broad" },
  "E-G04": { expected_lane: "answerable_with_honest_gap", expected_strategy: "honest_gap" },
  "E-G05": { expected_lane: "needs_clarification", expected_strategy: "defer_legacy" },
  "E-G06": { expected_lane: "blocked", expected_strategy: "blocked" },
  "E-G07": { expected_lane: "answerable_from_operational_context", expected_strategy: "direct" },
  "E-G08": { expected_lane: "should_delegate_transactional", expected_strategy: "delegate_08c" },
  "E-G09": { expected_lane: "should_delegate_transactional", expected_strategy: "delegate_08c" },
  "E-G10": { expected_lane: "needs_clarification", expected_strategy: "clarify_broad" },
  "E-G18": { expected_lane: "answerable_from_selected_context", expected_strategy: "direct" },
  "E-G19": {
    expected_lane: "answerable_from_selected_context",
    expected_strategy: "direct",
    known_product_gap: true,
  },
  "E-G21": { expected_lane: "needs_clarification", expected_strategy: "clarify_target" },
  "E-G22": { expected_lane: "answerable_from_selected_context", expected_strategy: "direct" },
  "E-G23": { expected_lane: "answerable_from_active_topic", expected_strategy: "direct" },
  "E-G24": { expected_lane: "answerable_from_active_topic", expected_strategy: "direct" },
  "E-G25": { expected_lane: "answerable_with_honest_gap", expected_strategy: "honest_gap" },
  "E-G26": { expected_lane: "should_delegate_transactional", expected_strategy: "delegate_08c" },
  "E-G27": { expected_lane: "answerable_from_selected_context", expected_strategy: "direct" },
  "E-G28": { expected_lane: "answerable_from_operational_context", expected_strategy: "direct" },
  "E-G29": { expected_lane: "answerable_from_active_topic", expected_strategy: "direct" },
  "E-G30": { expected_lane: "in_domain_missing_context", expected_strategy: "clarify_target" },
  "E-G31": { expected_lane: "answerable_from_catalog", expected_strategy: "direct" },
  "E-G33": { expected_lane: "answerable_from_operational_context", expected_strategy: "direct" },
  "E-G34": { expected_lane: "answerable_with_honest_gap", expected_strategy: "honest_gap" },
  "E-G35": { expected_lane: "answerable_from_operational_context", expected_strategy: "direct" },
  "E-G36": { expected_lane: "in_domain_missing_context", expected_strategy: "clarify_target" },
  "E-G37": { expected_lane: "in_domain_missing_context", expected_strategy: "clarify_target" },
  "E-G38": {
    expected_lane: "needs_clarification",
    expected_strategy: "clarify_broad",
    known_product_gap: true,
  },
  "E-G39": { expected_lane: "answerable_from_selected_context", expected_strategy: "direct" },
  "E-G40": { expected_lane: "answerable_from_selected_context", expected_strategy: "direct" },
  "E-G41": { expected_lane: "answerable_from_operational_context", expected_strategy: "direct" },
  "E-G42": { expected_lane: "answerable_from_operational_context", expected_strategy: "direct" },
  "E-G43": { expected_lane: "answerable_from_active_topic", expected_strategy: "direct" },
  "E-G44": { expected_lane: "should_delegate_transactional", expected_strategy: "delegate_08c" },
  "E-G45": { expected_lane: "needs_clarification", expected_strategy: "clarify_broad" },
  "E-G46": { expected_lane: "answerable_from_selected_context", expected_strategy: "direct" },
  "E-M-APT-15": {
    expected_lane: "answerable_from_selected_context",
    expected_strategy: "direct",
    known_product_gap: true,
  },
  "E-M-APT-16": { expected_lane: "answerable_from_selected_context", expected_strategy: "direct" },
  "E-M-APT-17": { expected_lane: "answerable_from_selected_context", expected_strategy: "direct" },
  "E-M-APT-18": { expected_lane: "answerable_from_selected_context", expected_strategy: "direct" },
}

/** Per-id overrides when matrixRef alone is ambiguous (manual product review). */
const MANUAL_EXPECT_BY_ID = {
  "B-15": { expected_lane: "answerable_from_active_topic", expected_strategy: "direct" },
  "B-23": { expected_lane: "needs_clarification", expected_strategy: "clarify_target" },
  "B-34": { expected_lane: "answerable_from_active_topic", expected_strategy: "direct" },
  "B-53": {
    expected_lane: "answerable_from_selected_context",
    expected_strategy: "direct",
    known_product_gap: true,
  },
}

const REMOVE = new Set(["B-13", "B-40"])

const AUGUSTA = "veja servi[cç]os e profissionais no feed quando quiser"
const BROAD_FORBIDDEN = "não captei o foco|nao captei o foco"
const SITUATED_FORBIDDEN = "me conta em uma linha"

const ADVERSARIAL = [
  {
    id: "B-41",
    tags: ["adversarial", "transactional_indevido"],
    prompt: "degrade",
    prior_turns: [],
    chip: { kind: "video", title: "Tutorial: Fade Perfeito em 5 Minutos", knownFacts: ["tema: fade"] },
    expected_lane: "answerable_from_selected_context",
    expected_strategy: "direct",
    forbidden_patterns: [AUGUSTA],
    forbidden_action_types: ["delegate_transactional_resolver"],
    calibration: "human",
    critical: true,
    adversarial: true,
  },
  {
    id: "B-42",
    tags: ["adversarial", "broad_indevido"],
    prompt: "me fala ai",
    prior_turns: [],
    chip: { kind: "video", title: "Tutorial: Fade Perfeito em 5 Minutos" },
    expected_lane: "answerable_from_selected_context",
    expected_strategy: "direct",
    forbidden_patterns: [AUGUSTA, BROAD_FORBIDDEN],
    calibration: "human",
    critical: true,
    adversarial: true,
  },
  {
    id: "B-43",
    tags: ["adversarial", "chip_trap"],
    matrixRef: "E-G35",
    prompt: "Tem estacionamento?",
    prior_turns: [],
    chip: { kind: "service", title: "Corte Masculino" },
    expected_lane: "answerable_from_operational_context",
    expected_strategy: "direct",
    forbidden_patterns: [AUGUSTA, "30 min", "tradicional com máquina"],
    calibration: "human",
    critical: true,
    adversarial: true,
  },
  {
    id: "B-44",
    tags: ["adversarial", "ambiguity"],
    prompt: "e isso?",
    prior_turns: ["fale mais sobre esse post"],
    chip: { kind: "social_post", title: "Sabado de casa cheia! Obrigado pela confianca." },
    expected_lane: "answerable_from_selected_context",
    expected_strategy: "direct",
    forbidden_patterns: [AUGUSTA],
    calibration: "human",
    critical: true,
    adversarial: true,
  },
  {
    id: "B-45",
    tags: ["adversarial", "ambiguity"],
    prompt: "tem essa barbearia la em Curitiba?",
    prior_turns: [],
    chip: { kind: "social_post", title: "Novo lounge na Augusta" },
    expected_lane: "in_domain_missing_context",
    expected_strategy: "clarify_target",
    forbidden_patterns: [AUGUSTA, "augusta, 1500"],
    calibration: "human",
    critical: true,
    adversarial: true,
  },
  {
    id: "B-46",
    tags: ["adversarial", "ambiguity"],
    prompt: "o que significa isso pra minha cidade?",
    prior_turns: [],
    chip: { kind: "social_post", title: "Sabado de casa cheia! Obrigado pela confianca." },
    expected_lane: "in_domain_missing_context",
    expected_strategy: "clarify_target",
    forbidden_patterns: [AUGUSTA],
    calibration: "human",
    critical: true,
    adversarial: true,
  },
  {
    id: "B-47",
    tags: ["adversarial", "topic_drift"],
    prompt: "e quanto custa?",
    prior_turns: ["esse fade é feito tambem em mulheres?"],
    chip: { kind: "video", title: "Tutorial: Fade Perfeito em 5 Minutos", knownFacts: ["tema: fade"] },
    expected_lane: "answerable_from_active_topic",
    expected_strategy: "direct",
    forbidden_patterns: [AUGUSTA, "mulher|feminino|clipe ensina"],
    calibration: "human",
    critical: true,
    adversarial: true,
  },
  {
    id: "B-48",
    tags: ["adversarial", "topic_drift"],
    prompt: "e funciona no domingo?",
    prior_turns: ["qual o preco do degrade?"],
    chip: { kind: "service", title: "Degrade" },
    expected_lane: "answerable_from_operational_context",
    expected_strategy: "direct",
    forbidden_patterns: [AUGUSTA, "R\\$ 55|catálogo"],
    calibration: "human",
    critical: true,
    adversarial: true,
  },
  {
    id: "B-49",
    tags: ["adversarial", "topic_drift"],
    prompt: "quero marcar um horario",
    prior_turns: ["tem estacionamento?", "e até que horas?"],
    chip: { kind: "service", title: "Corte Masculino" },
    expected_lane: "should_delegate_transactional",
    expected_strategy: "delegate_08c",
    forbidden_patterns: [AUGUSTA, "estacionamento conveniado"],
    calibration: "human",
    critical: true,
    adversarial: true,
  },
  {
    id: "B-50",
    tags: ["adversarial", "transactional_indevido"],
    prompt: "mostra a tecnica do fade neste clipe",
    prior_turns: [],
    chip: { kind: "video", title: "Tutorial: Fade Perfeito em 5 Minutos", knownFacts: ["tema: fade"] },
    expected_lane: "answerable_from_selected_context",
    expected_strategy: "direct",
    forbidden_patterns: [AUGUSTA],
    forbidden_action_types: ["delegate_transactional_resolver"],
    calibration: "human",
    critical: true,
    adversarial: true,
  },
]

const EXTRA_CORPUS = [
  {
    id: "B-51",
    matrixRef: "E-G46",
    tags: ["video_audience_followup"],
    prompt: "carecas",
    prior_turns: ["qual a tendencia para carecas?"],
    chip: {
      kind: "video",
      title: "Tendencias de Corte Masculino 2024",
      knownFacts: ["tema: tendencias corte masculino"],
    },
    expected_lane: "answerable_from_selected_context",
    expected_strategy: "direct",
    forbidden_patterns: [AUGUSTA, "fica na augusta", BROAD_FORBIDDEN, SITUATED_FORBIDDEN],
    calibration: "human",
    critical: true,
    adversarial: false,
  },
  {
    id: "B-52",
    matrixRef: "E-M-APT-17",
    tags: ["replaces_B-13"],
    prompt: "Onde fica a barbearia Dom Corleone?",
    prior_turns: [],
    chip: {
      kind: "news",
      title: "Barbearia Dom Corleone abre unidade em Pinheiros",
      knownFacts: ["entidade: Dom Corleone"],
    },
    expected_lane: "answerable_from_selected_context",
    expected_strategy: "direct",
    forbidden_patterns: [AUGUSTA, "Carlos Silva|appointment-booking"],
    calibration: "human",
    critical: true,
  },
  {
    id: "B-53",
    matrixRef: "E-M-APT-18",
    prompt: "fale mais sobre esse corte",
    prior_turns: [],
    chip: { kind: "service", title: "Corte Masculino", relatedEntityIds: ["service-1"] },
    expected_lane: "answerable_from_selected_context",
    expected_strategy: "direct",
    forbidden_patterns: [AUGUSTA],
    calibration: "human",
    critical: true,
    known_product_gap: true,
  },
  {
    id: "B-54",
    tags: ["adversarial", "ambiguity"],
    prompt: "essa",
    prior_turns: [],
    chip: { kind: "video", title: "Tendencias de Corte Masculino 2024", knownFacts: ["tema: tendencias corte masculino"] },
    expected_lane: "in_domain_missing_context",
    expected_strategy: "clarify_target",
    forbidden_patterns: [AUGUSTA, BROAD_FORBIDDEN],
    calibration: "human",
    critical: true,
    adversarial: true,
  },
  {
    id: "B-55",
    tags: ["adversarial", "ambiguity"],
    prompt: "isso",
    prior_turns: ["qual tendencia para cabelo cacheado?"],
    chip: { kind: "video", title: "Tendencias de Corte Masculino 2024", knownFacts: ["tema: tendencias corte masculino"] },
    expected_lane: "answerable_from_selected_context",
    expected_strategy: "direct",
    forbidden_patterns: [AUGUSTA, BROAD_FORBIDDEN],
    calibration: "human",
    critical: true,
    adversarial: true,
  },
  {
    id: "B-56",
    tags: ["adversarial", "ambiguity"],
    prompt: "e la?",
    prior_turns: ["fale mais sobre esse post"],
    chip: { kind: "social_post", title: "Sabado de casa cheia! Obrigado pela confianca." },
    expected_lane: "in_domain_missing_context",
    expected_strategy: "clarify_target",
    forbidden_patterns: [AUGUSTA, BROAD_FORBIDDEN],
    calibration: "human",
    critical: true,
    adversarial: true,
  },
  {
    id: "B-57",
    tags: ["adversarial", "ambiguity"],
    prompt: "minha cidade",
    prior_turns: [],
    chip: { kind: "social_post", title: "Novo lounge na Augusta" },
    expected_lane: "in_domain_missing_context",
    expected_strategy: "clarify_target",
    forbidden_patterns: [AUGUSTA, "augusta, 1500"],
    calibration: "human",
    critical: true,
    adversarial: true,
  },
  {
    id: "B-58",
    tags: ["adversarial", "chip_trap"],
    prompt: "Tem estacionamento?",
    prior_turns: [],
    chip: { kind: "news", title: "Barbearia Dom Corleone abre unidade em Pinheiros" },
    expected_lane: "answerable_from_operational_context",
    expected_strategy: "direct",
    forbidden_patterns: [AUGUSTA, "Dom Corleone abre|Pinheiros"],
    calibration: "human",
    critical: true,
    adversarial: true,
  },
  {
    id: "B-59",
    tags: ["adversarial", "broad_indevido"],
    prompt: "oi",
    prior_turns: [],
    chip: { kind: "video", title: "Tendencias de Corte Masculino 2024" },
    expected_lane: "answerable_from_selected_context",
    expected_strategy: "direct",
    forbidden_patterns: [AUGUSTA, BROAD_FORBIDDEN],
    calibration: "human",
    critical: true,
    adversarial: true,
  },
  {
    id: "B-60",
    matrixRef: "E-M-APT-16",
    prompt: "qual tendencia para cabelo cacheado?",
    prior_turns: [],
    chip: { kind: "video", title: "Tendencias de Corte Masculino 2024", knownFacts: ["tema: tendencias corte masculino"] },
    expected_lane: "answerable_from_selected_context",
    expected_strategy: "direct",
    forbidden_patterns: [AUGUSTA, BROAD_FORBIDDEN],
    calibration: "human",
    critical: true,
  },
]

const NEGATIVE_CONTROLS = [
  {
    id: "NC-01",
    tags: ["negative_control"],
    forbidden_patterns: [],
    prompt: "???",
    prior_turns: [],
    chip: null,
    expected_lane: "any",
    expected_strategy: "any",
    escape_expected: true,
    expected_escape_reason: "empty_or_null",
    calibration: "human",
    critical: false,
    adversarial: false,
  },
  {
    id: "NC-02",
    tags: ["negative_control"],
    forbidden_patterns: [],
    prompt: "(fixture)",
    control_fixture: {
      reply: "Veja servicos e profissionais no feed quando quiser.",
      action: { type: "text_only" },
    },
    expected_lane: "answerable_from_operational_context",
    expected_strategy: "direct",
    escape_expected: true,
    expected_escape_reason: "augusta_generic",
    calibration: "human",
    critical: false,
  },
  {
    id: "NC-03",
    tags: ["negative_control"],
    forbidden_patterns: [],
    prompt: "(fixture-broad)",
    control_fixture: {
      reply: "Não captei o foco — é sobre horário, como chegar, preços, um item do feed ou agendar?",
      action: { type: "text_only" },
    },
    expected_lane: "answerable_from_selected_context",
    expected_strategy: "direct",
    escape_expected: true,
    expected_escape_reason: "broad_clarify_unexpected",
    calibration: "human",
    critical: false,
  },
]

const raw = loadV1Corpus()
const baseNum = (id) => {
  const m = /^B-(\d+)$/.exec(id)
  return m ? Number(m[1]) : null
}

const base = raw.scenarios
  .filter((s) => {
    const n = baseNum(s.id)
    return n !== null && n <= 40 && !REMOVE.has(s.id)
  })
  .map((s) => {
    const human = !PROBE_IDS.has(s.id)
    const manual = { ...(MANUAL_EXPECT_BY_REF[s.matrixRef] ?? {}), ...(MANUAL_EXPECT_BY_ID[s.id] ?? {}) }
    return {
      ...s,
      calibration: human ? "human" : "probe",
      tags: s.tags ?? [],
      adversarial: false,
      known_product_gap: manual.known_product_gap ?? false,
      ...(human ? manual : {}),
      escape_expected: s.escape_expected ?? false,
    }
  })

const merged = [...base, ...ADVERSARIAL, ...NEGATIVE_CONTROLS, ...EXTRA_CORPUS].map((s) => ({
  ...s,
  prior_turns: s.prior_turns ?? [],
  chip: s.chip ?? null,
  forbidden_patterns: s.forbidden_patterns ?? [AUGUSTA],
  tags: s.tags ?? [],
  adversarial: s.adversarial ?? false,
  known_product_gap: Boolean(s.known_product_gap),
  escape_expected: s.escape_expected ?? false,
  critical: s.critical ?? true,
  calibration: s.calibration ?? "probe",
}))

const byId = new Map()
for (const s of merged) {
  if (s.id) byId.set(s.id, s)
}
const scenarios = applyRealityOrigin([...byId.values()])

const humanCount = scenarios.filter((s) => s.calibration === "human").length
const realityDerived = scenarios.filter((s) => s.origin === "reality").length
const syntheticCount = scenarios.filter((s) => s.origin === "synthetic").length
const harvestFile = JSON.parse(readFileSync(HARVEST_PATH, "utf8"))
const realityBacklogOpen = harvestFile.entries.filter((e) => e.status === "backlog").length
const probeCount = scenarios.filter((s) => s.calibration === "probe").length
const adversarialCount = scenarios.filter((s) => s.adversarial === true || s.tags?.includes("adversarial")).length
const negativeControlCount = scenarios.filter((s) => s.tags?.includes("negative_control")).length

if (scenarios.length < CORPUS_MIN) {
  console.error(`Corpus ${scenarios.length} < ${CORPUS_MIN}`)
  process.exit(1)
}
if (humanCount < HUMAN_MIN) {
  console.error(`Human calibrated ${humanCount} < ${HUMAN_MIN}`)
  process.exit(1)
}

const reality_percentage =
  scenarios.length > 0 ? Math.round((realityDerived / scenarios.length) * 1000) / 10 : 0

const out = {
  version: "1.3.0",
  workstream: "WS-19B",
  charter: "docs/audit/WS-19B_CONVERSATIONAL_COVERAGE.md",
  followup: "docs/audit/WS-19B_REALITY_BACKLOG.md",
  realityHarvest: "docs/audit/ws19b-reality-harvest.json",
  gate: {
    escapeRateMaxPercent: 5,
    criticalWrongLaneMax: 0,
    escapeRateScope: "escape_expected_false",
    wrongLaneScope: "human_critical_non_adversarial",
    corpusMin: CORPUS_MIN,
    humanCalibratedMin: HUMAN_MIN,
    realityTargetMin: 10,
  },
  stats: {
    total: scenarios.length,
    humanCalibrated: humanCount,
    probeCalibrated: probeCount,
    adversarial: adversarialCount,
    negativeControls: negativeControlCount,
    realityDerived,
    synthetic: syntheticCount,
    realityBacklogOpen,
    reality_count: realityDerived,
    synthetic_count: syntheticCount,
    reality_percentage,
  },
  scenarios,
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n")
console.log(
  `WS-19B v1.3: ${scenarios.length} scenarios · human=${humanCount} · reality=${realityDerived} (${reality_percentage}%) · synthetic=${syntheticCount}`
)
