import type { MenuItem } from "@/lib/business-types"
import { menuItems } from "@/lib/mock-data/restaurant-data"
import type {
  ConversationResponseResolver,
  ConversationResponseResolverResult,
  ConversationVisualBlock,
} from "@/lib/mock-data/conversational-search"
import { normalizeSurfaceFlowText } from "@/lib/surface-flow/product-entity"

export const RESTAURANT_MENU_RESULTS_KIND = "restaurant-menu-results"
export const RESTAURANT_CART_PROMPT_KIND = "restaurant-cart-prompt"

const MENU_ITEM_CONTEXT_PREFIX = "menu-item-"
const CATEGORY_CONTEXT_PREFIX = "restaurant-category-"

export interface RestaurantMenuSearchResult {
  id: string
  title: string
  image: string
  price?: number
  subtitle?: string
  ctaLabel?: string
}

export interface RestaurantMenuResultsPayload {
  items: RestaurantMenuSearchResult[]
  intent: "recommendation" | "category" | "specific" | "context"
}

export interface RestaurantCartPromptPayload {
  action: "open-cart" | "open-checkout"
  itemCount: number
}

const CATEGORY_ALIASES: Record<string, string> = {
  entradas: "Entradas",
  pratos: "Pratos Principais",
  sobremesas: "Sobremesas",
  bebidas: "Bebidas",
  saladas: "Saladas",
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Entradas: ["entrada", "entradas", "aperitivo", "porcao", "coxinha", "pao de queijo"],
  "Pratos Principais": ["prato", "pratos", "principal", "principais", "picanha", "feijoada", "moqueca", "risoto"],
  Sobremesas: ["sobremesa", "sobremesas", "doce", "doces", "pudim", "petit gateau", "sobremesa"],
  Bebidas: ["bebida", "bebidas", "suco", "drink", "caipirinha", "cerveja"],
  Saladas: ["salada", "saladas", "leve", "vegetariano", "vegano"],
}

function normalizeText(value: string) {
  return normalizeSurfaceFlowText(value)
}

function menuItemToSearchResult(item: MenuItem): RestaurantMenuSearchResult {
  return {
    id: item.id,
    title: item.name,
    image: item.image,
    price: item.price,
    subtitle: item.category,
    ctaLabel: item.customizations?.length ? "Personalizar" : "Adicionar",
  }
}

function getContextMenuItems(contextItems: { id: string }[]) {
  const ids = new Set(
    contextItems
      .map((item) =>
        item.id.startsWith(MENU_ITEM_CONTEXT_PREFIX)
          ? item.id.slice(MENU_ITEM_CONTEXT_PREFIX.length)
          : null
      )
      .filter(Boolean) as string[]
  )

  return menuItems.filter((item) => ids.has(item.id))
}

function getContextCategories(contextItems: { id: string }[]) {
  return contextItems
    .map((item) => {
      if (!item.id.startsWith(CATEGORY_CONTEXT_PREFIX)) return null
      const slug = item.id.slice(CATEGORY_CONTEXT_PREFIX.length)
      return CATEGORY_ALIASES[slug] ?? null
    })
    .filter(Boolean) as string[]
}

function buildMenuResultsResponse(
  text: string,
  items: MenuItem[],
  intent: RestaurantMenuResultsPayload["intent"]
): ConversationResponseResolverResult | null {
  if (items.length === 0) return null

  return {
    text,
    visualBlock: {
      kind: RESTAURANT_MENU_RESULTS_KIND,
      payload: {
        items: items.slice(0, 3).map(menuItemToSearchResult),
        intent,
      } satisfies RestaurantMenuResultsPayload,
    },
  }
}

function buildCartPromptResponse(
  text: string,
  action: RestaurantCartPromptPayload["action"],
  itemCount: number
): ConversationResponseResolverResult {
  return {
    text,
    visualBlock: {
      kind: RESTAURANT_CART_PROMPT_KIND,
      payload: {
        action,
        itemCount,
      } satisfies RestaurantCartPromptPayload,
    },
  }
}

function matchesCartIntent(message: string) {
  const normalized = normalizeText(message)
  return (
    normalized.includes("carrinho") ||
    normalized.includes("pedido") ||
    normalized.includes("finalizar") ||
    normalized.includes("checkout") ||
    normalized.includes("fechar pedido") ||
    normalized.includes("ver pedido")
  )
}

function matchesCheckoutIntent(message: string) {
  const normalized = normalizeText(message)
  return normalized.includes("pagar") || normalized.includes("pagamento")
}

function matchesRecommendationIntent(message: string) {
  const normalized = normalizeText(message)
  const cues = [
    "recomenda",
    "indica",
    "sugere",
    "popular",
    "destaque",
    "o que pedir",
    "o que comer",
    "me ajuda",
    "nao sei",
    "fome",
    "cardapio",
    "menu",
    "especialidade",
  ]
  return cues.some((cue) => normalized.includes(cue))
}

function matchesContextualFollowUpIntent(message: string) {
  const normalized = normalizeText(message)
  const cues = [
    "combina",
    "acompanha",
    "parecido",
    "similar",
    "alternativa",
    "mais opco",
    "outra op",
    "e agora",
    "tambem",
    "junto",
    "recomenda",
    "indica",
  ]
  return cues.some((cue) => normalized.includes(cue))
}

function resolveCategoryFromMessage(message: string) {
  const normalized = normalizeText(message)

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return category
    }
  }

  for (const [slug, category] of Object.entries(CATEGORY_ALIASES)) {
    if (normalized.includes(slug)) {
      return category
    }
  }

  return null
}

function findSpecificMenuItem(message: string) {
  const normalized = normalizeText(message)

  return (
    menuItems.find((item) => {
      const itemName = normalizeText(item.name)
      return normalized.includes(itemName) || itemName.split(" ").some((word) => word.length > 3 && normalized.includes(word))
    }) ?? null
  )
}

function rankMenuItems(options: {
  message: string
  categories?: string[]
  preferPopular?: boolean
  limit?: number
}) {
  const normalized = normalizeText(options.message)
  const categories = new Set(options.categories ?? [])
  const limit = options.limit ?? 3

  const scored = menuItems
    .map((item) => {
      let score = 0
      const itemName = normalizeText(item.name)

      if (categories.has(item.category)) score += 6
      if (itemName.split(" ").some((word) => word.length > 3 && normalized.includes(word))) score += 8
      if (normalizeText(item.category) && normalized.includes(normalizeText(item.category))) score += 4
      if (item.tags.some((tag) => normalized.includes(normalizeText(tag)))) score += 3
      if (options.preferPopular && item.popular) score += 2

      return { item, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  if (scored.length > 0) {
    return scored.slice(0, limit).map(({ item }) => item)
  }

  if (categories.size > 0) {
    return menuItems.filter((item) => categories.has(item.category)).slice(0, limit)
  }

  return menuItems.filter((item) => item.popular).slice(0, limit)
}

function getRelatedItemsFromContext(contextMenuItems: MenuItem[], limit = 3) {
  const categories = new Set(contextMenuItems.map((item) => item.category))
  const excludeIds = new Set(contextMenuItems.map((item) => item.id))

  return menuItems
    .filter((item) => categories.has(item.category) && !excludeIds.has(item.id))
    .slice(0, limit)
}

export interface RestaurantConversationResolverOptions {
  cartItemCount?: number
}

export function createRestaurantMockConversationResolver(
  options: RestaurantConversationResolverOptions = {}
): ConversationResponseResolver {
  return ({ message, contextItems }) => {
    const contextMenuItems = getContextMenuItems(contextItems)
    const contextCategories = getContextCategories(contextItems)
    const cartItemCount = options.cartItemCount ?? 0

    if (matchesCartIntent(message) || matchesCheckoutIntent(message)) {
      if (cartItemCount === 0) {
        return buildMenuResultsResponse(
          "Seu pedido ainda esta vazio — separei alguns destaques para comecar.",
          menuItems.filter((item) => item.popular),
          "recommendation"
        )
      }

      return buildCartPromptResponse(
        cartItemCount === 1
          ? "Seu pedido tem 1 item. Quer revisar antes de finalizar?"
          : `Seu pedido tem ${cartItemCount} itens. Quer revisar antes de finalizar?`,
        matchesCheckoutIntent(message) ? "open-checkout" : "open-cart",
        cartItemCount
      )
    }

    const specificItem = findSpecificMenuItem(message)
    if (specificItem) {
      return buildMenuResultsResponse(
        `Boa escolha — ${specificItem.name} e um dos favoritos da casa.`,
        [specificItem],
        "specific"
      )
    }

    if (contextMenuItems.length > 0 && matchesContextualFollowUpIntent(message)) {
      const related = getRelatedItemsFromContext(contextMenuItems, 3)
      const label = contextMenuItems.length === 1 ? contextMenuItems[0].name : "o que voce selecionou"

      return buildMenuResultsResponse(
        `Pensando em ${label}, separei opcoes que combinam bem.`,
        related.length > 0 ? related : menuItems.filter((item) => item.popular).slice(0, 3),
        "context"
      )
    }

    const categoryFromMessage = resolveCategoryFromMessage(message)
    const categories = [...new Set([...contextCategories, ...(categoryFromMessage ? [categoryFromMessage] : [])])]

    if (categories.length > 0) {
      const items = rankMenuItems({ message, categories, limit: 3 })
      const categoryLabel = categories[0]

      return buildMenuResultsResponse(
        `No ${categoryLabel}, estas opcoes saem bem na conversa — veja o que combina com voce.`,
        items,
        "category"
      )
    }

    if (matchesRecommendationIntent(message)) {
      return buildMenuResultsResponse(
        "Estes pratos sao os mais pedidos por aqui — posso te ajudar a escolher um.",
        menuItems.filter((item) => item.popular).slice(0, 3),
        "recommendation"
      )
    }

    return null
  }
}

export const restaurantMockConversationResolver = createRestaurantMockConversationResolver()
