import type { EvaluatorResult, LabConversation, LabFinding } from "../types"

const INTERNAL_CUES = [
  "resolver",
  "classifier",
  "classificador",
  "intent",
  "toolRoute",
  "actionRequest",
  "questionContract",
  "topicStack",
  "fallback",
  "pipeline",
  "LLM brain",
  "routing",
  "metadata",
  "visualBlock",
  "rawText",
  "formatProfile",
  "arquitetura",
]

export function evaluateNoLeak(conversation: LabConversation): EvaluatorResult {
  const findings: LabFinding[] = []

  for (const turn of conversation.turns) {
    const leaked = INTERNAL_CUES.find((cue) => turn.assistant.toLowerCase().includes(cue.toLowerCase()))
    if (!leaked) continue

    findings.push({
      severity: "P0",
      category: "no_leak",
      message: `Vazamento de termo interno: ${leaked}.`,
      turnIndex: turn.index,
      user: turn.user,
      assistant: turn.assistant,
    })
  }

  const score = Math.max(0, 100 - findings.length * 35)
  return { name: "no_leak", score, findings }
}
