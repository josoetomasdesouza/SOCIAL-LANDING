import type { EvaluatorResult, LabConversation, LabFinding } from "../types"

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function hasAny(value: string, cues: string[]) {
  const normalized = normalize(value)
  return cues.some((cue) => normalized.includes(normalize(cue)))
}

export function evaluateContinuity(conversation: LabConversation): EvaluatorResult {
  const findings: LabFinding[] = []

  for (const turn of conversation.turns) {
    const beforeActive = turn.topicStackBefore.find((topic) => topic.state === "active")?.topic
    const afterActive = turn.topicStackAfter.find((topic) => topic.state === "active")?.topic

    if (hasAny(turn.user, ["que horas"]) && beforeActive === "futebol" && turn.actualTool !== "sports") {
      findings.push({
        severity: "P0",
        category: "continuity",
        message: "Follow-up curto 'que horas?' perdeu o tópico esportivo ativo.",
        turnIndex: turn.index,
        user: turn.user,
        assistant: turn.assistant,
      })
    }

    if (hasAny(turn.user, ["voltando", "retomando"]) && afterActive && ["web", "clima", "noticia", "tempo"].includes(afterActive)) {
      findings.push({
        severity: "P1",
        category: "continuity",
        message: "Retomada explícita não reativou o tópico pausado adequado.",
        turnIndex: turn.index,
        user: turn.user,
        assistant: turn.assistant,
      })
    }

    if (hasAny(turn.assistant, ["voltando para serviço", "voltando para servico"]) && !hasAny(turn.user, ["voltando", "horário", "horario", "serviço", "servico"])) {
      findings.push({
        severity: "P1",
        category: "continuity",
        message: "Assistente forçou retorno ao domínio sem pedido do usuário.",
        turnIndex: turn.index,
        user: turn.user,
        assistant: turn.assistant,
      })
    }
  }

  const score = Math.max(0, 100 - findings.filter((finding) => finding.severity === "P0").length * 25 - findings.length * 10)
  return { name: "continuity", score, findings }
}
