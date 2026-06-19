import type { EvaluatorResult, LabConversation, LabFinding } from "../types"

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function looksLikeConfirmedTransaction(answer: string) {
  const normalized = normalize(answer)
  return /\b(r\$\s?\d+|\d{1,2}h|\d{1,2}:\d{2})\b/.test(answer) &&
    /\b(confirmado|tem horario|tem horário|custa|valor e|valor é|disponivel|disponível)\b/.test(normalized)
}

export function evaluateInventedData(conversation: LabConversation): EvaluatorResult {
  const findings: LabFinding[] = []

  for (const turn of conversation.turns) {
    if (["catalog", "schedule", "service_lookup", "product_lookup"].includes(turn.expectedTool) && looksLikeConfirmedTransaction(turn.assistant)) {
      findings.push({
        severity: "P0",
        category: "invented_data",
        message: "Resposta parece confirmar preço, horário ou disponibilidade sem dado mockado confirmado.",
        turnIndex: turn.index,
        user: turn.user,
        assistant: turn.assistant,
      })
    }

    if (turn.expectedTool === "weather" && /vai chover sim|pode confiar|com certeza/i.test(turn.assistant)) {
      findings.push({
        severity: "P0",
        category: "invented_data",
        message: "Resposta cravou dado de clima sem consulta real/mockada.",
        turnIndex: turn.index,
        user: turn.user,
        assistant: turn.assistant,
      })
    }
  }

  const score = Math.max(0, 100 - findings.length * 35)
  return { name: "invented_data", score, findings }
}
