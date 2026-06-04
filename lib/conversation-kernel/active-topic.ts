import { buildCatalogPriceHint } from "./catalog-hints"
import type { ActiveTopic, KernelResponse, KernelSession, ModelContextPack } from "./types"

export function normalizeKernelText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
}

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

export function detectStrongTopic(message: string): ActiveTopic | null {
  const m = normalizeKernelText(message)

  if (
    hasToken(m, "quero agendar", "quero marcar", "marcar um horario", "marcar um horário", "agendar um horario", "agendar um horário") ||
    (hasToken(m, "agendar", "marcar", "reservar") && hasToken(m, "horario", "horário")) ||
    hasToken(m, "vaga hoje", "tem vaga", "tem horario", "tem horário", "encaixe")
  ) {
    return "schedule"
  }

  if (
    hasToken(m, "preco", "preço", "valor", "quanto custa", "quanto e", "quanto é", "custa quanto") ||
    hasToken(m, "pix", "pagamento", "cartao", "cartão", "debito", "débito")
  ) {
    return "pricing"
  }

  if (
    hasToken(m, "barbeiro", "profissional", "quem faz", "equipe", "carlos", "rafael", "lucas") &&
    !hasToken(m, "noticia", "notícia", "premio", "prêmio")
  ) {
    return "professional"
  }

  if (hasToken(m, "servico", "serviço", "degrade", "fade", "corte masculino", "barba completa") && !hasToken(m, "barbeiro")) {
    return "service"
  }

  if (
    hasToken(m, "como chego", "como eu chego", "estacionamento", "estacionar", "endereco", "endereço") ||
    (hasToken(m, "onde fica", "onde fica esse", "onde fica essa") && !hasToken(m, "dom corleone", "noticia", "notícia"))
  ) {
    return "arrival"
  }

  if (hasToken(m, "quantas pessoas", "cabem no", "cabe no", "capacidade", "lotacao", "lotação")) {
    return null
  }

  if (
    hasToken(m, "feriado", "feriados", "fecham", "horario", "horário", "funciona nos", "funciona no", "todo sabado", "todo sábado") &&
    !hasToken(m, "post", "publicacao", "publicação")
  ) {
    return "arrival"
  }

  if (
    hasToken(m, "noticia", "notícia", "premio", "prêmio", "o que diz", "essa noticia", "essa notícia", "matéria", "materia")
  ) {
    return "news_editorial"
  }

  return null
}

function chipKindConflictsWithTopic(
  chipKind: string,
  topic: ActiveTopic
): boolean {
  switch (topic) {
    case "schedule":
      return chipKind === "video" || chipKind === "news" || chipKind === "service"
    case "pricing":
      return chipKind === "video" || chipKind === "news" || chipKind === "social_post"
    case "professional":
      return chipKind === "service" || chipKind === "video"
    case "service":
      return chipKind === "professional" || chipKind === "video"
    case "arrival":
      return chipKind === "video" || chipKind === "news" || chipKind === "social_post"
    case "news_editorial":
      return false
    default:
      return false
  }
}

/** True when active topic lane should win over selectedContextItems for this turn. */
export function shouldActiveTopicOverrideChip(
  message: string,
  session: KernelSession,
  pack: ModelContextPack
): boolean {
  if (pack.selectedContextItems.length === 0) return false

  const detected = detectStrongTopic(message)
  const chip = pack.selectedContextItems[0]

  if (detected === "arrival" && chip.isExternalOrEditorial) {
    return false
  }

  if (detected && chipKindConflictsWithTopic(chip.kind, detected)) {
    if (detected === "pricing" && chip.kind === "video" && !session.activeTopic) {
      return false
    }
    return true
  }

  if (session.activeTopic && detected && detected !== session.activeTopic) {
    return true
  }

  if (
    session.activeTopic &&
    session.activeTopic !== "news_editorial" &&
    hasToken(message, "preco", "preço", "pix", "pagamento", "valor", "quanto")
  ) {
    return true
  }

  if (session.activeTopic && hasToken(message, "horario", "horário", "vaga", "agendar", "marcar")) {
    return true
  }

  return false
}

export function updateActiveTopicFromMessage(
  message: string,
  session: KernelSession,
  pack?: ModelContextPack
): void {
  const detected = detectStrongTopic(message)
  if (!detected) return

  const chip = pack?.selectedContextItems[0]
  if (chip && !chipKindConflictsWithTopic(chip.kind, detected) && !session.activeTopic) {
    if (detected === "pricing" && chip.kind === "video") return
    if (detected === "news_editorial" && chip.kind === "news") return
    if (detected === "service" && chip.kind === "service") return
    if (detected === "professional" && chip.kind === "professional") return
    return
  }

  session.activeTopic = detected
  session.lastTopic = detected
}

function groundingActiveTopic(confidence: "high" | "medium" | "low"): KernelResponse["grounding"] {
  return { source: "active_topic", itemIds: [], confidence }
}

function baseActive(
  partial: Partial<KernelResponse> & Pick<KernelResponse, "reply" | "intent" | "topic" | "action">,
  activeTopic: ActiveTopic
): KernelResponse {
  return {
    domainZone: "in_domain",
    topicShift: true,
    structure: { acknowledged: true, answered: true },
    confidence: "high",
    source: "rule_table",
    activeTopic,
    grounding: partial.grounding ?? groundingActiveTopic("high"),
    ...partial,
  }
}

export function resolveActiveTopic(
  message: string,
  pack: ModelContextPack,
  session: KernelSession
): KernelResponse | null {
  const topic = detectStrongTopic(message) ?? session.activeTopic
  if (!topic) return null

  const m = normalizeKernelText(message)

  switch (topic) {
    case "pricing": {
      const catalogHint = buildCatalogPriceHint(pack, message)
      const priceLine =
        catalogHint ??
        "Não tenho tabela de preços detalhada aqui — valores no feed em Agendar ou confirma no balcão."
      return baseActive(
        {
          reply: priceLine,
          intent: "practical_question",
          topic: "pricing",
          domainZone: "in_domain_unknown",
          action: { type: "text_only" },
          grounding: catalogHint
            ? { source: "catalog", itemIds: [], confidence: "high" }
            : { source: "data_gap", itemIds: [], confidence: "high" },
        },
        "pricing"
      )
    }
    case "schedule":
      return baseActive(
        {
          reply: "",
          intent: "transactional",
          topic: "booking",
          action: { type: "delegate_transactional_resolver" },
        },
        "schedule"
      )
    case "professional": {
      const names = pack.catalog.entities
        .filter((e) => e.kind === "professional")
        .map((e) => e.name)
        .slice(0, 4)
      return baseActive(
        {
          reply: `Na ${pack.brandName}, quem costuma pegar degrade e fade é ${names.join(", ")} — escolhe no feed em Agendar para ver horários.`,
          intent: "entity_lookup",
          topic: "professional",
          action: { type: "text_only" },
        },
        "professional"
      )
    }
    case "service":
      return baseActive(
        {
          reply: "",
          intent: "transactional",
          topic: "service_keyword",
          action: { type: "delegate_transactional_resolver" },
        },
        "service"
      )
    case "arrival": {
      const addr = pack.operational?.addressLine
      return baseActive(
        {
          reply: addr
            ? `Estamos em ${addr}. Mapa no topo da página para rota e estacionamento.`
            : `Use o mapa no topo para chegar na ${pack.brandName}.`,
          intent: "practical_question",
          topic: "arrival",
          action: { type: "bridge_to_page", anchor: "hero_map" },
        },
        "arrival"
      )
    }
    case "news_editorial": {
      const chip = pack.selectedContextItems[0]
      if (chip?.kind === "news") {
        return baseActive(
          {
            reply: `A notícia "${chip.title}" é matéria do feed — premiação e abertura de unidade são do recorte editorial, não alteram o agendamento da ${pack.brandName} na Augusta.`,
            intent: "context_grounded",
            topic: "news_detail",
            domainZone: "in_domain",
            action: { type: "text_only" },
            grounding: { source: "selected_context", itemIds: [chip.id], confidence: "high" },
          },
          "news_editorial"
        )
      }
      return null
    }
    default:
      return null
  }
}
