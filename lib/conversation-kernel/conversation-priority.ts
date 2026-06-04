import { detectStrongTopic, isFadeReferencedAsVideoContent, normalizeKernelText } from "./topic-detection"
import type { ActiveTopic, KernelSession, ModelContextPack, SelectedContextItem } from "./types"

/** Pesos alinhados a WS-19A_PHASE1_5.md §3.4 — maior vence na mensagem atual. */
export const INTENT_PRIORITY_WEIGHT: Record<string, number> = {
  schedule: 100,
  arrival: 95,
  hours: 90,
  pricing: 85,
  operational: 80,
  professional: 75,
  service: 70,
  news_editorial: 60,
}

export const CHIP_ANCHOR_WEIGHT: Record<string, number> = {
  service: 50,
  professional: 48,
  video: 45,
  social_post: 40,
  news: 38,
  product: 35,
  menu_item: 35,
  review: 32,
  style: 30,
  unknown: 20,
}

export { isFadeReferencedAsVideoContent } from "./topic-detection"

function hasToken(message: string, ...tokens: string[]): boolean {
  const m = normalizeKernelText(message)
  return tokens.some((t) => {
    const token = normalizeKernelText(t)
    if (token.length <= 4) {
      return new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(m)
    }
    return m.includes(token)
  })
}

/** Pergunta sobre conteúdo do clipe — chip editorial vence keyword de serviço. */
export function isVideoChipContentInquiry(message: string, chip: SelectedContextItem): boolean {
  if (chip.kind !== "video") return false
  const m = normalizeKernelText(message)
  if (
    hasToken(
      m,
      "quero marcar",
      "quero agendar",
      "quero marcar esse",
      "marcar esse",
      "agendar esse",
      "marcar um horario",
      "marcar um horário",
      "vaga hoje",
      "tem vaga"
    )
  ) {
    return false
  }
  return (
    isFadeReferencedAsVideoContent(message) ||
    hasToken(
      m,
      "fade",
      "tendencia",
      "tendência",
      "cacheado",
      "crespo",
      "careca",
      "carecas",
      "calvo",
      "calvos",
      "calvicie",
      "antes",
      "depois",
      "card",
      "perguntei",
      "comentei",
      "sobre o que estamos",
      "estamos falando",
      "o que e",
      "o que é",
      "oque é",
      "isso",
      "esse",
      "como faz",
      "serve pra mim",
      "serve pra mim?",
      "fale mais",
      "fale do",
      "tecnica",
      "técnica",
      "desse conteudo",
      "desse conteúdo",
      "esse conteudo",
      "esse conteúdo",
      "sobre o conteudo",
      "sobre o conteúdo",
      "do video",
      "do vídeo"
    )
  )
}

export function isSocialPostContentInquiry(message: string, chip: SelectedContextItem): boolean {
  if (chip.kind !== "social_post" && chip.kind !== "news") return false
  const m = normalizeKernelText(message)
  if (hasToken(m, "quero marcar", "quero agendar", "quero marcar esse", "marcar esse", "vaga hoje")) return false
  return hasToken(
    m,
    "sobre o que",
    "estamos falando",
    "o que significa",
    "essa publicacao",
    "essa publicação",
    "esse post",
    "fale mais",
    "sobre isso"
  )
}

/** Chip editorial com pergunta de conteúdo — não perder para service keyword na mensagem. */
export function isEditorialChipAnchoredTurn(message: string, pack: ModelContextPack): boolean {
  const chip = pack.selectedContextItems[0]
  if (!chip) return false
  if (chip.kind === "video") return isVideoChipContentInquiry(message, chip)
  if (chip.kind === "social_post" || chip.kind === "news") {
    return isSocialPostContentInquiry(message, chip)
  }
  return false
}

/** Intenção detectada na mensagem (sem pesos) — usado por topic-ownership. */
export function resolveIntentCategory(message: string, session: KernelSession): string | null {
  const topic = detectStrongTopic(message)
  if (topic === "arrival") return "arrival"
  if (topic === "schedule") return "schedule"
  if (topic === "pricing") return "pricing"
  if (topic === "professional") return "professional"
  if (topic === "service") return "service"
  if (topic === "news_editorial") return "news_editorial"

  const m = normalizeKernelText(message)
  if (
    hasToken(m, "feriado", "fecham", "horario", "horário", "aberto agora", "funciona nos") ||
    /^(e\s+)?(ate|até)\s+que\s+horas/.test(m) ||
    hasToken(m, "e ate que horas", "e até que horas", "e o horario", "e o horário")
  ) {
    return "hours"
  }
  if (hasToken(m, "estacionamento", "curitiba", "filial", "unidade em", "capacidade", "lotacao", "lotação")) {
    return "operational"
  }

  if (session.sessionLane === "hours" && /^(e\s+)?(ate|até)\s+que\s+horas/.test(m)) {
    return "hours"
  }

  const weakSessionContinuation =
    /^(e\s+)?(ate|até)\s+que\s+horas/.test(m) ||
    hasToken(m, "e ate que horas", "e até que horas", "e o horario", "e o horário", "e quanto custa") ||
    (hasToken(m, "me fala", "fala ai", "fala aí", "nao entendi", "não entendi") && m.length < 28) ||
    hasToken(m, "unidade", "esta unidade", "essa unidade")

  if (session.activeTopic && weakSessionContinuation) {
    const map: Record<ActiveTopic, string> = {
      schedule: "schedule",
      arrival: "arrival",
      pricing: "pricing",
      professional: "professional",
      service: "service",
      news_editorial: "news_editorial",
    }
    if (hasToken(m, "preco", "preço", "pix", "pagamento", "valor", "quanto custa", "e quanto custa")) {
      return "pricing"
    }
    if (session.sessionLane === "hours") return "hours"
    return map[session.activeTopic] ?? null
  }

  return null
}

export function chipAnchorWeight(chip: SelectedContextItem): number {
  return CHIP_ANCHOR_WEIGHT[chip.kind] ?? CHIP_ANCHOR_WEIGHT.unknown
}

export function intentWeight(category: string | null): number {
  if (!category) return 0
  return INTENT_PRIORITY_WEIGHT[category] ?? 0
}
