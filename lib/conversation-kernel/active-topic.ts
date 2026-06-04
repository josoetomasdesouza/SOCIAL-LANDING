import { buildCatalogPriceHint } from "./catalog-hints"
import { isVideoChipContentInquiry } from "./conversation-priority"
import { shouldIntentBeatChip } from "./topic-ownership"
import { detectStrongTopic, normalizeKernelText } from "./topic-detection"
import type { ActiveTopic, KernelResponse, KernelSession, ModelContextPack } from "./types"

export { detectStrongTopic, isFadeReferencedAsVideoContent, normalizeKernelText } from "./topic-detection"
export { isVideoChipContentInquiry } from "./conversation-priority"

function chipKindConflictsWithTopic(chipKind: string, topic: ActiveTopic): boolean {
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

/** @deprecated Use shouldIntentBeatChip — mantido para imports existentes. */
export function shouldActiveTopicOverrideChip(
  message: string,
  session: KernelSession,
  pack: ModelContextPack
): boolean {
  return shouldIntentBeatChip(message, session, pack)
}

export function updateActiveTopicFromMessage(
  message: string,
  session: KernelSession,
  pack?: ModelContextPack
): void {
  const detected = detectStrongTopic(message)
  if (!detected) return

  const chip = pack?.selectedContextItems[0]
  if (chip?.kind === "video" && isVideoChipContentInquiry(message, chip)) return
  if (chip && !chipKindConflictsWithTopic(chip.kind, detected) && !session.activeTopic) {
    if (detected === "pricing" && chip.kind === "video") return
    if (detected === "service" && chip.kind === "video") return
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
      const m = normalizeKernelText(message)
      const hoursTurn =
        /^(e\s+)?(ate|até)\s+que\s+horas/.test(m) ||
        hasToken(m, "feriado", "feriados", "fecham", "horario", "horário", "funciona nos", "funciona no", "que horas")
      if (hoursTurn) {
        const hours = pack.operational?.openingHours ?? pack.operational?.hoursHint ?? "Seg-Sab: 9h-20h"
        const holiday = hasToken(message, "feriado", "feriados", "natal", "ano novo")
        const reply = holiday
          ? `Em dias normais seguimos ${hours}. Em feriados o horário pode ser diferente — confirma no WhatsApp ou no balcão da ${pack.brandName} antes de vir.`
          : `Funcionamos em geral ${hours}. Para um dia específico ou feriado, confirma no balcão ou no WhatsApp da casa.`
        return baseActive(
          {
            reply,
            intent: "operational",
            topic: "hours_holidays",
            action: { type: "text_only" },
            grounding: { source: "operational", itemIds: [], confidence: "high" },
          },
          "arrival"
        )
      }
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
