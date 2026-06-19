import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import type { LabConversation, ScenarioSeed } from "../types"
import { simulateConversationFromMessages } from "./user-simulator"

export interface GoldenRegressionCase {
  id: string
  rootCause: string
  title: string
  persona: string
  initialGoal: string
  cognitivePattern: string
  messages: string[]
  createdAt: string
  domain?: ScenarioSeed["domain"]
  businessVertical?: ScenarioSeed["businessVertical"]
  user_message?: string
  previous_topic?: string
  expected_topic?: string
  wrong_behavior?: string
  expected_contract?: string
}

const GOLDEN_PATH = join(process.cwd(), "conversation-lab", "datasets", "golden", "auto-regressions.jsonl")
export const GOLDEN_PATHS = [
  GOLDEN_PATH,
  join(process.cwd(), "conversation-lab", "datasets", "golden", "topic-continuity-regressions.jsonl"),
  join(process.cwd(), "conversation-lab", "datasets", "golden", "question-contract-regressions.jsonl"),
  join(process.cwd(), "conversation-lab", "datasets", "golden", "conversation-memory-regressions.jsonl"),
  join(process.cwd(), "conversation-lab", "datasets", "golden", "cross-vertical-operational-regressions.jsonl"),
  join(process.cwd(), "conversation-lab", "datasets", "golden", "final-hardening-regressions.jsonl"),
  join(process.cwd(), "conversation-lab", "datasets", "golden", "naturalness-regressions.jsonl"),
  join(process.cwd(), "conversation-lab", "datasets", "golden", "human-message-taxonomy-regressions.jsonl"),
  join(process.cwd(), "conversation-lab", "datasets", "golden", "user-progress-preservation-regressions.jsonl"),
]

function readGoldenCases(path = GOLDEN_PATH): GoldenRegressionCase[] {
  if (!existsSync(path)) return []

  return readFileSync(path, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as GoldenRegressionCase)
}

function goldenToScenario(golden: GoldenRegressionCase): ScenarioSeed {
  return {
    id: `golden-${golden.id}`,
    title: golden.title,
    domain: golden.domain ?? "retomada_assunto",
    businessVertical: golden.businessVertical ?? "appointment",
    persona: golden.persona,
    initialGoal: golden.initialGoal,
    cognitivePattern: golden.cognitivePattern,
    topicShifts: [],
    implicitFollowUps: [],
    operationalQuestions: [],
    generalQuestions: [],
    ambiguousQuestions: [],
  }
}

export function loadGoldenRegressionConversations(runId: string): LabConversation[] {
  return GOLDEN_PATHS.flatMap((path) => readGoldenCases(path)).map((golden) =>
    simulateConversationFromMessages(goldenToScenario(golden), runId, golden.messages)
  )
}

export function goldenRegressionPathLabels() {
  return GOLDEN_PATHS.map((path) => path.replace(`${process.cwd()}/`, ""))
}
