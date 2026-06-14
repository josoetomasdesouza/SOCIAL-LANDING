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

function isTransactionalTool(tool: string) {
  return ["catalog", "schedule", "service_lookup", "product_lookup", "booking"].includes(tool)
}

function hasFailClosedOperationalAnswer(answer: string) {
  return hasAny(answer, [
    "não há confirmação",
    "nao ha confirmacao",
    "não tenho confirmação",
    "nao tenho confirmacao",
    "precisa verificar",
    "preciso consultar",
    "consultar",
    "verificar",
    "não vou inventar",
    "nao vou inventar",
    "sem dado confirmado",
    "catálogo",
    "catalogo",
  ])
}

function answersSportsSchedule(answer: string) {
  return hasAny(answer, ["horários dos jogos", "horarios dos jogos", "suíça x catar", "suica x catar", "marrocos x brasil", "escócia x haiti", "escocia x haiti"])
}

function appearsWrongVertical(conversation: LabConversation, answer: string) {
  if (conversation.domain === "barbearia") return false
  return hasAny(answer, ["barbearia", "barbeiro", "corte masculino", "visual executivo", "barba negra"]) &&
    !hasAny(conversation.scenarioTitle, ["barbearia"])
}

export function evaluateSatisfaction(conversation: LabConversation): EvaluatorResult {
  const findings: LabFinding[] = []

  for (const turn of conversation.turns) {
    const answer = turn.assistant
    const user = turn.user
    const hasContext = turn.topicStackBefore.some((topic) => topic.state === "active" && topic.topic !== "descoberta")
    const isOperationalTurn = isTransactionalTool(turn.expectedTool)

    if (isOperationalTurn && appearsWrongVertical(conversation, answer)) {
      findings.push({
        severity: "P0",
        category: "question_satisfaction",
        message: "Pergunta operacional cross-vertical foi respondida como barbearia/agendamento.",
        turnIndex: turn.index,
        user,
        assistant: answer,
      })
    }

    if (isOperationalTurn && /^(sim|claro|tem)\b/i.test(answer.trim()) && !hasAny(answer, ["catálogo confirmado", "catalogo confirmado", "confirmação", "confirmacao"])) {
      findings.push({
        severity: "P0",
        category: "question_satisfaction",
        message: "Resposta operacional confirmou disponibilidade sem confirmação explícita.",
        turnIndex: turn.index,
        user,
        assistant: answer,
      })
    }

    if (isOperationalTurn && !answersSportsSchedule(answer) && !hasFailClosedOperationalAnswer(answer) && !hasAny(answer, ["sim", "não", "nao"])) {
      findings.push({
        severity: "P1",
        category: "question_satisfaction",
        message: "Pergunta operacional não recebeu fail-closed claro nem próximo passo seguro.",
        turnIndex: turn.index,
        user,
        assistant: answer,
      })
    }

    if (hasAny(answer, ["isso e outro assunto", "isso é outro assunto", "contexto atual", "classificador"])) {
      findings.push({
        severity: "P0",
        category: "question_satisfaction",
        message: "Resposta parece responder ao classificador em vez da pergunta real do usuário.",
        turnIndex: turn.index,
        user,
        assistant: answer,
      })
    }

    if (hasAny(user, ["que horas", "qual você escolheria", "qual voce escolheria", "e o preço", "e o preco", "e amanhã", "e amanha"]) && turn.expectedTool !== turn.actualTool) {
      findings.push({
        severity: "P0",
        category: "question_satisfaction",
        message: "Follow-up curto ignorou tópico ou ferramenta esperada do contexto anterior.",
        turnIndex: turn.index,
        user,
        assistant: answer,
      })
    }

    if (hasContext && hasAny(answer, ["posso responder isso como conversa geral", "me diz um pouco mais do que você quer saber", "me diz um pouco mais do que voce quer saber"])) {
      findings.push({
        severity: "P1",
        category: "question_satisfaction",
        message: "Resposta genérica ignorou contexto disponível.",
        turnIndex: turn.index,
        user,
        assistant: answer,
      })
    }

    if (hasAny(user, ["interessante", "legal", "não gostei", "nao gostei", "faz sentido", "gostei"]) && hasContext && hasAny(answer, ["conversa geral", "outro assunto", "sem misturar"])) {
      findings.push({
        severity: "P1",
        category: "question_satisfaction",
        message: "Reação curta recebeu resposta deslocada apesar de contexto anterior suficiente.",
        turnIndex: turn.index,
        user,
        assistant: answer,
      })
    }

    const normalizedUser = normalize(user)
    const looksLikeServiceQuestion =
      /\b(corta|cortam|fazem|atende|atendem)\b/.test(normalizedUser) ||
      (/\btem\b/.test(normalizedUser) &&
        hasAny(user, ["profissional", "especialista", "estoque", "reserva", "horário", "horario", "consulta", "mesa", "criança", "crianca", "pronta entrega"]) &&
        !hasAny(user, ["notícia", "noticia", "jogo", "joga", "temperatura", "clima", "filme", "netflix"]))

    if (looksLikeServiceQuestion && !hasAny(answer, ["sim", "não", "nao", "confirmar", "verificar", "catálogo", "catalogo"])) {
      findings.push({
        severity: "P0",
        category: "question_satisfaction",
        message: "Pergunta operacional sim/não não recebeu resolução explícita.",
        turnIndex: turn.index,
        user,
        assistant: answer,
      })
    }

    if (hasAny(user, ["vale a pena", "compensa", "serve"]) && !hasAny(answer, ["depende", "contexto", "produto", "investimento", "serviço", "servico", "decisão", "decisao"])) {
      findings.push({
        severity: "P1",
        category: "question_satisfaction",
        message: "Pergunta ambígua não pediu o contexto necessário antes de concluir.",
        turnIndex: turn.index,
        user,
        assistant: answer,
      })
    }
  }

  const score = Math.max(0, 100 - findings.filter((finding) => finding.severity === "P0").length * 25 - findings.length * 8)
  return { name: "satisfaction", score, findings }
}
