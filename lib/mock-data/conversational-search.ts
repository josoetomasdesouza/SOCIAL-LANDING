import type { ReactNode } from "react"
import type { ConversationContextPayload } from "@/lib/business-types"
import { products } from "@/lib/mock-data/ecommerce-data"
import {
  catalogProductToProductEntity,
  productEntityToConversationalResult,
} from "@/lib/surface-flow/product-adapters"
import {
  normalizeSurfaceFlowText,
  rankProductEntitiesForConversation,
} from "@/lib/surface-flow/product-entity"

export interface ConversationalSearchProductResult {
  id: string
  title: string
  image: string
  price?: number
  ctaLabel?: string
}

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

function getCatalogProductsForConversationalSearch(message: string) {
  const normalizedMessage = normalizeText(message)
  const matchedTerms = FACIAL_SEARCH_TERMS.filter((term) => normalizedMessage.includes(term))

  return rankProductEntitiesForConversation(CATALOG_PRODUCT_ENTITIES, matchedTerms, 3)
    .map(productEntityToConversationalResult)
}

export const ecommerceMockConversationResolver: ConversationResponseResolver = ({ message }) => {
  if (!matchesFacialProductsIntent(message)) {
    return null
  }

  return {
    text: "Encontrei alguns produtos que combinam com isso.",
    visualBlock: {
      kind: CONVERSATIONAL_SEARCH_RESULTS_KIND,
      payload: {
        products: getCatalogProductsForConversationalSearch(message),
      } satisfies ConversationalSearchResultsPayload,
    },
  }
}
