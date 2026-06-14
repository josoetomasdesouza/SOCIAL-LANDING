import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { loadGoldenRegressionConversations } from "../generators/golden-regression-loader"
import { generateScenarioSeeds } from "../generators/scenario-generator"
import { runRealAgentConversations } from "../generators/real-agent-runner"
import { simulateConversations } from "../generators/user-simulator"
import type { LabConversation } from "../types"

function writeJsonl(filePath: string, rows: unknown[]) {
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, rows.map((row) => JSON.stringify(row)).join("\n") + "\n", "utf8")
}

export type ConversationLabMode = "mock" | "real-agent" | "regression"

function modeLabel(mode: ConversationLabMode) {
  if (mode === "regression") return "regression"
  return mode === "real-agent" ? "real" : "mock"
}

export async function generateConversationDataset(mode: ConversationLabMode = "mock") {
  const root = process.cwd()
  const label = modeLabel(mode)
  const runId = `${label}-${new Date().toISOString().replace(/[:.]/g, "-")}`
  const scenarios = mode === "regression" ? [] : generateScenarioSeeds(30)
  const goldenConversations = loadGoldenRegressionConversations(runId)
  const mockConversations = mode === "regression"
    ? goldenConversations
    : [
      ...simulateConversations(scenarios, runId),
      ...goldenConversations,
    ]
  const conversations: LabConversation[] = mode === "real-agent" || mode === "regression"
    ? await runRealAgentConversations(mockConversations)
    : mockConversations
  const generatedPath = join(root, "conversation-lab", "datasets", "generated", `${runId}.jsonl`)
  const modeLatestPath = join(root, "conversation-lab", "datasets", "generated", `latest-${label}.jsonl`)
  const latestPath = join(root, "conversation-lab", "datasets", "generated", "latest.jsonl")

  writeJsonl(generatedPath, conversations)
  writeJsonl(modeLatestPath, conversations)
  writeJsonl(latestPath, conversations)

  return {
    mode,
    runId,
    generatedPath,
    modeLatestPath,
    latestPath,
    conversationCount: conversations.length,
    turnCount: conversations.reduce((sum, conversation) => sum + conversation.turns.length, 0),
  }
}

if (process.argv[1]?.endsWith("generate-conversations.ts")) {
  const modeArg = process.argv[2] === "regression" ? "regression" : process.argv[2] === "real" || process.argv[2] === "real-agent" ? "real-agent" : "mock"
  generateConversationDataset(modeArg).then((result) => {
    console.log(`Conversation Lab generated ${result.conversationCount} ${modeArg} conversations / ${result.turnCount} turns`)
    console.log(result.generatedPath)
  }).catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
