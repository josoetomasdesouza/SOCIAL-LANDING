import type { ReactNode } from "react"
import type { ConversationContextPayload, Product } from "@/lib/business-types"
import { products } from "@/lib/mock-data/ecommerce-data"
import type { ConversationalSearchProductResult } from "@/lib/surface-flow/contracts"
import {
  catalogProductToProductEntity,
  productEntityToConversationalResult,
} from "@/lib/surface-flow/product-adapters"
import {
  normalizeSurfaceFlowText,
  rankProductEntitiesForConversation,
} from "@/lib/surface-flow/product-entity"

export type { ConversationalSearchProductResult } from "@/lib/surface-flow/contracts"

export interface ConversationVisualBlock {
  kind: string
  payload: unknown
}

export interface ConversationResponseResolverResult {
  text: string
  visualBlock?: ConversationVisualBlock
}

export interface ConversationResponseResolverInput {
  message: string
  brandName: string
  contextItems: ConversationContextPayload[]
}

export type ConversationResponseResolver = (
  input: ConversationResponseResolverInput
) => ConversationResponseResolverResult | null

export type ConversationVisualBlockRenderer = (
  visualBlock: ConversationVisualBlock
) => ReactNode

export interface ConversationalSearchResultsPayload {
  products: ConversationalSearchProductResult[]
}

export const CONVERSATIONAL_SEARCH_RESULTS_KIND = "conversational-search-results"
const ECOMMERCE_PRODUCT_CONTEXT_PREFIX = "ecommerce-product-"
const CATALOG_PRODUCT_ENTITIES = products.map(catalogProductToProductEntity)
const FACIAL_SEARCH_TERMS = [
  "facial",
  "faciais",
  "rosto",
  "pele",
  "skincare",
  "hidratante",
  "protetor",
  "limpeza",
  "serum",
]

function normalizeText(value: string) {
  return normalizeSurfaceFlowText(value)
}

function getContextCatalogProducts(contextItems: ConversationContextPayload[]) {
  const contextProductIds = new Set(
    contextItems
      .map((item) => {
        if (!item.id.startsWith(ECOMMERCE_PRODUCT_CONTEXT_PREFIX)) {
          return null
        }

        return item.id.slice(ECOMMERCE_PRODUCT_CONTEXT_PREFIX.length)
      })
      .filter(Boolean) as string[]
  )

  return products.filter((product) => contextProductIds.has(product.id))
}

function getSearchTermsFromContextProducts(contextProducts: Product[]) {
  const terms = new Set<string>()

  for (const product of contextProducts) {
    const entity = catalogProductToProductEntity(product)

    if (entity.category) {
      terms.add(normalizeText(entity.category))
    }

    for (const keyword of entity.keywords || []) {
      terms.add(normalizeText(keyword))
    }
  }

  return [...terms]
}

function matchesContextualFollowUpIntent(message: string) {
  const normalizedMessage = normalizeText(message)
  const followUpCues = [
    "similar",
    "parecido",
    "parecida",
    "combina",
    "complementa",
    "alternativa",
    "mais opco",
    "outra op",
    "outro produto",
    "me mostra mais",
    "mostra mais",
    "e agora",
    "e esse",
    "sobre esse",
    "nesse caso",
    "com isso",
    "com ele",
    "com ela",
    "junto",
    "tambem",
    "recomenda",
    "indica",
    "o que vai bem",
    "faz sentido",
    "combinacao",
  ]

  return followUpCues.some((cue) => normalizedMessage.includes(cue))
}

function matchesFacialProductsIntent(message: string) {
  const normalizedMessage = normalizeText(message)
  const mentionsFacialCategory =
    normalizedMessage.includes("facial") ||
    normalizedMessage.includes("faciais") ||
    normalizedMessage.includes("rosto") ||
    normalizedMessage.includes("pele") ||
    normalizedMessage.includes("skincare")
  const mentionsProductCue =
    normalizedMessage.includes("produto") ||
    normalizedMessage.includes("produtos") ||
    normalizedMessage.includes("creme") ||
    normalizedMessage.includes("serum") ||
    normalizedMessage.includes("limpeza") ||
    normalizedMessage.includes("protetor")
  const mentionsSearchIntent =
    normalizedMessage.includes("quero") ||
    normalizedMessage.includes("queria") ||
    normalizedMessage.includes("tem algo") ||
    normalizedMessage.includes("tem alguma") ||
    normalizedMessage.includes("qual produto") ||
    normalizedMessage.includes("o que e melhor") ||
    normalizedMessage.includes("me mostra") ||
    normalizedMessage.includes("mostrar") ||
    normalizedMessage.includes("indica") ||
    normalizedMessage.includes("indicacao") ||
    normalizedMessage.includes("ajuda") ||
    normalizedMessage.includes("melhorar")

  return mentionsFacialCategory && (mentionsProductCue || mentionsSearchIntent)
}

function summarizeContextProductLabel(contextProducts: Product[]) {
  if (contextProducts.length === 0) {
    return null
  }

  if (contextProducts.length === 1) {
    return contextProducts[0].name
  }

  return `${contextProducts[0].name} e mais ${contextProducts.length - 1}`
}

function getRelatedProductsFromContext(contextProducts: Product[], limit: number) {
  const excludeIds = new Set(contextProducts.map((product) => product.id))
  const terms = getSearchTermsFromContextProducts(contextProducts)

  if (terms.length === 0) {
    return []
  }

  return rankProductEntitiesForConversation(
    CATALOG_PRODUCT_ENTITIES,
    terms,
    limit + excludeIds.size
  )
    .filter((entity) => !excludeIds.has(entity.id))
    .slice(0, limit)
    .map(productEntityToConversationalResult)
}

function getCatalogProductsForConversationalSearch(message: string, contextProducts: Product[] = []) {
  const normalizedMessage = normalizeText(message)
  const messageTerms = FACIAL_SEARCH_TERMS.filter((term) => normalizedMessage.includes(term))
  const contextTerms = getSearchTermsFromContextProducts(contextProducts)
  const searchTerms = [...new Set([...messageTerms, ...contextTerms])]

  return rankProductEntitiesForConversation(CATALOG_PRODUCT_ENTITIES, searchTerms, 3).map(
    productEntityToConversationalResult
  )
}

function buildSearchResultsResponse(
  text: string,
  searchResults: ConversationalSearchProductResult[]
): ConversationResponseResolverResult | null {
  if (searchResults.length === 0) {
    return null
  }

  return {
    text,
    visualBlock: {
      kind: CONVERSATIONAL_SEARCH_RESULTS_KIND,
      payload: {
        products: searchResults,
      } satisfies ConversationalSearchResultsPayload,
    },
  }
}

export const ecommerceMockConversationResolver: ConversationResponseResolver = ({
  message,
  contextItems,
}) => {
  const contextProducts = getContextCatalogProducts(contextItems)

  if (contextProducts.length > 0 && matchesContextualFollowUpIntent(message)) {
    const relatedProducts = getRelatedProductsFromContext(contextProducts, 3)
    const contextLabel = summarizeContextProductLabel(contextProducts)

    return buildSearchResultsResponse(
      contextLabel
        ? `Pensando em ${contextLabel}, separei algumas opcoes que combinam.`
        : "Separei algumas opcoes que combinam com o que voce selecionou.",
      relatedProducts
    )
  }

  if (!matchesFacialProductsIntent(message)) {
    return null
  }

  return buildSearchResultsResponse(
    contextProducts.length > 0
      ? "Considerando o que voce selecionou, encontrei alguns produtos que combinam."
      : "Encontrei alguns produtos que combinam com isso.",
    getCatalogProductsForConversationalSearch(message, contextProducts)
  )
}
