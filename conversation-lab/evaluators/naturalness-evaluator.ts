import type { EvaluatorResult, LabConversation, LabFinding } from "../types"

function firstWord(value: string) {
  return value.trim().split(/\s+/)[0]?.toLowerCase() ?? ""
}

function similarity(a: string, b: string) {
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter((word) => word.length > 3))
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter((word) => word.length > 3))
  if (!wordsA.size || !wordsB.size) return 0
  const overlap = [...wordsA].filter((word) => wordsB.has(word)).length
  return overlap / Math.max(wordsA.size, wordsB.size)
}

export function evaluateNaturalness(conversation: LabConversation): EvaluatorResult {
  const findings: LabFinding[] = []

  for (const turn of conversation.turns) {
    if (turn.assistant.length < 24) {
      findings.push({
        severity: "P2",
        category: "naturalness",
        message: "Resposta curta demais para uma conversa multi-turno.",
        turnIndex: turn.index,
        user: turn.user,
        assistant: turn.assistant,
      })
    }

    if (/\b(posso responder isso como conversa geral|próximo passo natural|fluxo|classificador)\b/i.test(turn.assistant)) {
      findings.push({
        severity: "P1",
        category: "naturalness",
        message: "Resposta tem cheiro de macro ou linguagem de sistema.",
        turnIndex: turn.index,
        user: turn.user,
        assistant: turn.assistant,
      })
    }

    const previous = conversation.turns[turn.index - 2]
    if (previous && firstWord(previous.assistant) === firstWord(turn.assistant) && firstWord(turn.assistant).length > 3) {
      findings.push({
        severity: "P3",
        category: "naturalness",
        message: "Aberturas consecutivas repetidas.",
        turnIndex: turn.index,
        user: turn.user,
        assistant: turn.assistant,
      })
    }

    if (previous && similarity(previous.assistant, turn.assistant) > 0.72) {
      findings.push({
        severity: "P2",
        category: "naturalness",
        message: "Respostas consecutivas parecidas demais.",
        turnIndex: turn.index,
        user: turn.user,
        assistant: turn.assistant,
      })
    }
  }

  const score = Math.max(0, 100 - findings.filter((finding) => finding.severity === "P1").length * 14 - findings.length * 5)
  return { name: "naturalness", score, findings }
}
