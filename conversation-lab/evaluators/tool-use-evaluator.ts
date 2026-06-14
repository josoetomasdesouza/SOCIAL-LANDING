import type { EvaluatorResult, LabConversation, LabFinding, LabTool } from "../types"

const REALTIME_TOOLS: LabTool[] = ["weather", "sports", "news", "web_search", "time"]
const TRANSACTIONAL_TOOLS: LabTool[] = ["catalog", "schedule", "service_lookup", "product_lookup", "booking"]

export function evaluateToolUse(conversation: LabConversation): EvaluatorResult {
  const findings: LabFinding[] = []

  for (const turn of conversation.turns) {
    if (REALTIME_TOOLS.includes(turn.expectedTool) && turn.actualTool !== turn.expectedTool) {
      findings.push({
        severity: "P0",
        category: "tool_use",
        message: `Pergunta atual exigia ${turn.expectedTool}, mas usou ${turn.actualTool}.`,
        turnIndex: turn.index,
        user: turn.user,
        assistant: turn.assistant,
      })
    }

    if (TRANSACTIONAL_TOOLS.includes(turn.expectedTool) && turn.actualTool === "reasoning") {
      findings.push({
        severity: "P1",
        category: "tool_use",
        message: "Pergunta operacional foi tratada como raciocínio geral.",
        turnIndex: turn.index,
        user: turn.user,
        assistant: turn.assistant,
      })
    }

    if (turn.actualTool !== "none" && turn.assistant.match(/\b(tool|ferramenta|route|router)\b/i)) {
      findings.push({
        severity: "P1",
        category: "tool_use",
        message: "Resposta mencionou ferramenta ou roteamento ao usuário.",
        turnIndex: turn.index,
        user: turn.user,
        assistant: turn.assistant,
      })
    }
  }

  const score = Math.max(0, 100 - findings.filter((finding) => finding.severity === "P0").length * 30 - findings.length * 8)
  return { name: "tool_use", score, findings }
}
