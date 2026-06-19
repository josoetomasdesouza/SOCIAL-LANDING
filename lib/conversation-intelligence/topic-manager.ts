import { normalizeSurfaceFlowText } from "@/lib/surface-flow/product-entity"
import type { ConversationHistoryMessage, ConversationTopicFrame } from "./types"

function normalize(value: string) {
  return normalizeSurfaceFlowText(value).trim()
}

function hasAny(normalized: string, cues: string[]) {
  return cues.some((cue) => normalized.includes(normalize(cue)))
}

function classifyTopic(message: string) {
  const normalized = normalize(message)

  if (hasAny(normalized, ["cabelo feminino", "feminino cacheado", "cacheado", "cacheada"])) return "cabelo_feminino"
  if (hasAny(normalized, ["que dia", "data de hoje", "hora atual", "horas sao", "horas são"])) return "tempo_atual"
  if (hasAny(normalized, ["netflix", "filme", "serie", "série"])) return "netflix"
  if (hasAny(normalized, ["jogo", "futebol", "copa", "brasileirao", "brasileirão", "libertadores"])) return "futebol"
  if (hasAny(normalized, ["clima", "tempo", "previsao", "previsão", "temperatura", "chover", "chuva"])) return "clima"
  if (hasAny(normalized, ["noticia", "notícia", "noticias", "notícias"])) return "noticias"
  if (hasAny(normalized, ["tecnologia", "iphone", "android", "inteligencia artificial", "inteligência artificial"])) return "tecnologia"
  if (hasAny(normalized, ["quem foi", "capital", "curiosidade", "historia", "história"])) return "curiosidade"
  if (hasAny(normalized, ["corte", "cortar", "barba", "barbeiro", "agendar", "marcar", "horario", "horário", "servico", "serviço", "profissional", "visual", "degrade", "degradê", "social", "executivo", "qnt", "quanto", "preco", "preço", "e preço", "e preco", "tem hoje", "tem amanhã", "tem amanha", "e hoje", "e amanhã", "e amanha", "hj tem"])) {
    return "agendamento"
  }
  if (hasAny(normalized, ["obrigado", "obrigada", "valeu", "era isso"])) return "encerramento"

  return "conversa_livre"
}

function wantsReturn(message: string) {
  const normalized = normalize(message)
  return hasAny(normalized, ["voltando", "volta no", "retomando", "sobre o que falamos", "sobre aquilo", "sobre o corte", "sobre o horário", "sobre o horario", "e o horário", "e o horario"])
}

function topicFromHistory(history: ConversationHistoryMessage[]) {
  const topics: string[] = []

  for (const message of history) {
    if (message.role !== "user") continue
    const topic = classifyTopic(message.content)
    if (topic !== "conversa_livre" && topic !== "encerramento") {
      topics.push(topic)
    }
  }

  return topics
}

function lastUserMessage(history: ConversationHistoryMessage[]) {
  return history
    .filter((message) => message.role === "user")
    .at(-1)?.content ?? ""
}

export function deriveTopicStack({
  message,
  history = [],
}: {
  message: string
  history?: ConversationHistoryMessage[]
}): ConversationTopicFrame[] {
  const previousTopics = topicFromHistory(history)
  const classifiedTopic = classifyTopic(message)
  const lastTopic = previousTopics.at(-1)
  const normalized = normalize(message)
  const isShortTimeFollowUp = /^(que\s+horas|horarios?|horários?)\??$/.test(normalized)
  const isShortOperationalFollowUp = /^(e\s+)?(?:o\s+)?(?:preco|preço|hoje|amanha|amanhã)\??$/.test(normalized) ||
    /^(tem\s+hoje|tem\s+amanha|tem\s+amanhã)\??$/.test(normalized)
  const previousUserWasReturn = wantsReturn(lastUserMessage(history))
  const previousUserMessage = normalize(lastUserMessage(history))
  const previousUserPointsElsewhere = hasAny(previousUserMessage, ["restaurante", "reserva", "mesa", "consulta", "produto", "entrega", "clima", "noticia", "notícia"])
  const isSportsOpinionFollowUp =
    hasAny(normalized, ["qual voce assistiria", "qual você assistiria", "qual voce escolheria", "qual você escolheria", "qual mais interessante", "qual voce acha", "qual você acha"]) &&
    previousTopics.includes("futebol") &&
    !previousUserWasReturn
  const hasRecentOperationalTopic = previousTopics.includes("agendamento") || previousTopics.includes("cabelo_feminino")
  const currentTopic =
    (isShortTimeFollowUp && lastTopic === "futebol" && !previousUserWasReturn && !previousUserPointsElsewhere) || isSportsOpinionFollowUp
      ? "futebol"
      : (isShortTimeFollowUp || isShortOperationalFollowUp) && hasRecentOperationalTopic
        ? "agendamento"
        : classifiedTopic

  if (currentTopic === "encerramento") {
    return previousTopics.slice(-2).map((topic) => ({ topic, state: "closed" }))
  }

  if (wantsReturn(message)) {
    const normalized = normalize(message)
    const returnTopic =
      normalized.includes("corte") || normalized.includes("cortar") || normalized.includes("barba") || normalized.includes("agenda") || normalized.includes("horario")
        ? "agendamento"
        : previousTopics
        .slice()
        .reverse()
        .find((topic) => topic !== lastTopic && topic !== "conversa_livre") ??
      lastTopic ??
      "conversa_livre"

    return [
      ...previousTopics
        .filter((topic) => topic !== returnTopic)
        .slice(-2)
        .map((topic) => ({ topic, state: "paused" as const })),
      { topic: returnTopic, state: "active" },
    ]
  }

  if (!lastTopic || lastTopic === currentTopic || currentTopic === "conversa_livre") {
    return [{ topic: currentTopic === "conversa_livre" ? (lastTopic ?? "conversa_livre") : currentTopic, state: "active" }]
  }

  return [
    { topic: lastTopic, state: "paused" },
    { topic: currentTopic, state: "active" },
  ]
}

export function activeTopic(topicStack: ConversationTopicFrame[]) {
  return topicStack.find((topic) => topic.state === "active")?.topic ?? "conversa_livre"
}
