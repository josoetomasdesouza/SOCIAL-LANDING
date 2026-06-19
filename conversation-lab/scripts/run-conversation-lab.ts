import { evaluateConversationDataset } from "./evaluate-conversations"
import { generateConversationDataset, type ConversationLabMode } from "./generate-conversations"
import { basename } from "node:path"

export async function runConversationLab(mode: ConversationLabMode = "mock") {
  const generated = await generateConversationDataset(mode)
  const evaluated = evaluateConversationDataset(generated.latestPath)

  return {
    ...generated,
    summary: evaluated.summary,
    summaryPath: evaluated.latestSummaryPath,
    failuresPath: evaluated.failuresPath,
  }
}

if (process.argv[1] && basename(process.argv[1]) === "run-conversation-lab.ts") {
  const mode = process.argv[2] === "regression" ? "regression" : process.argv[2] === "real" || process.argv[2] === "real-agent" ? "real-agent" : "mock"
  runConversationLab(mode).then((result) => {
    console.log(`Conversation Lab (${mode}) completed ${result.conversationCount} conversations / ${result.turnCount} turns`)
    console.log(`Satisfaction: ${Math.round(result.summary.satisfactionRate * 100)}%`)
    console.log(`P0: ${result.summary.severityCounts.P0} | P1: ${result.summary.severityCounts.P1} | P2: ${result.summary.severityCounts.P2} | P3: ${result.summary.severityCounts.P3}`)
    console.log(`Dataset: ${result.latestPath}`)
    console.log(`Failures: ${result.failuresPath}`)
    console.log(`Summary: ${result.summaryPath}`)
  }).catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
