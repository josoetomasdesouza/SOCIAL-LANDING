import type { ConversationContextPayload } from "@/lib/business-types"
import type { ModelContextPack, SelectedContextItem, SelectedContextItemKind } from "./types"

export function inferSelectedContextKind(id: string, subtitle?: string): SelectedContextItemKind {
  if (id.startsWith("appointment-service-") || id.startsWith("restaurant-menu-") || id.includes("service-")) {
    return "service"
  }
  if (id.startsWith("appointment-barber-") || subtitle?.toLowerCase().includes("profissional")) {
    return "professional"
  }
  if (id.startsWith("ecommerce-product-")) return "product"
  if (id.startsWith("restaurant-dish-") || id.startsWith("restaurant-item-")) return "menu_item"
  if (id.startsWith("appointment-style-")) return "style"
  if (id.includes("vid") || subtitle?.toLowerCase().includes("video")) return "video"
  if (id.includes("news") || subtitle?.toLowerCase().includes("notícia") || subtitle?.toLowerCase().includes("noticia")) {
    return "news"
  }
  if (id.includes("rev")) return "review"
  if (
    id.includes("-soc-") ||
    id.includes("-post-") ||
    subtitle?.toLowerCase() === "post" ||
    subtitle?.toLowerCase() === "publicação" ||
    subtitle?.toLowerCase() === "publicacao"
  ) {
    return "social_post"
  }
  return "unknown"
}

export function isExternalEditorialContext(
  kind: SelectedContextItemKind,
  title: string,
  belongsToCurrentHouse: boolean
): boolean {
  if (!belongsToCurrentHouse) return true
  if (kind === "news") {
    const normalized = title.toLowerCase()
    if (normalized.includes("dom corleone") && !normalized.includes("barba negra")) {
      return true
    }
  }
  return false
}

export function isSocialFeedChip(item: { kind: string; id: string; knownFacts: string[] }): boolean {
  if (item.kind === "social_post") return true
  if (item.id.includes("-soc-") || item.id.includes("-post-")) return true
  return item.knownFacts.some((f) => /^subtitle:(post|publicação|publicacao)$/i.test(f.trim()))
}

export function mapContextPayloadToSelectedItem(
  item: ConversationContextPayload,
  brandName: string
): SelectedContextItem {
  const kind = inferSelectedContextKind(item.id, item.subtitle)
  const titleLower = item.title.toLowerCase()
  const houseLower = brandName.toLowerCase()
  const belongsToCurrentHouse =
    kind !== "news" ||
    titleLower.includes(houseLower) ||
    titleLower.includes("augusta") ||
    !titleLower.includes("dom corleone")

  const isExternalOrEditorial = isExternalEditorialContext(kind, item.title, belongsToCurrentHouse)

  const knownFacts: string[] = []
  if (item.subtitle) knownFacts.push(`subtitle:${item.subtitle}`)

  let relatedEntityIds: string[] | undefined
  if (item.id.startsWith("appointment-service-")) {
    relatedEntityIds = [item.id.replace("appointment-service-", "")]
  }
  if (item.id.startsWith("appointment-barber-")) {
    relatedEntityIds = [item.id.replace("appointment-barber-", "")]
  }

  return {
    id: item.id,
    kind,
    title: item.title,
    summary: item.subtitle,
    knownFacts,
    belongsToCurrentHouse,
    isExternalOrEditorial,
    relatedEntityIds,
    sourcePrefix: item.id.split("-").slice(0, 2).join("-"),
  }
}

export function buildSelectedContextItems(
  contextItems: ConversationContextPayload[],
  brandName: string
): SelectedContextItem[] {
  return contextItems.map((item) => mapContextPayloadToSelectedItem(item, brandName))
}

export function mergePackSelectedContext(
  pack: ModelContextPack,
  contextItems: ConversationContextPayload[]
): ModelContextPack {
  if (contextItems.length === 0) return pack
  return {
    ...pack,
    selectedContextItems: buildSelectedContextItems(contextItems, pack.brandName),
  }
}
