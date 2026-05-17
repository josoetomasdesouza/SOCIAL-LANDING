import type { ReactNode } from "react"
import type { ConversationContextPayload } from "@/lib/business-types"
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
  activeFlow?: "none" | "product"
  productFlowStep?: string
  activeProduct?: {
    id?: string
    title: string
    description?: string
    price?: number
  } | null
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

function summarizeActiveProductConversation(input: ConversationResponseResolverInput) {
  if (input.activeFlow !== "product" || !input.activeProduct?.title) {
    return null
  }

  const normalizedMessage = normalizeText(input.message)
  const normalizedDescription = normalizeText(
    `${input.activeProduct.description || ""} ${input.activeProduct.title || ""}`
  )
  const selectedContextLabel = input.contextItems
    .map((item) => item.title.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" e ")

  const stepLabel =
    input.productFlowStep === "cart-summary"
      ? "continuidade do fluxo"
      : input.productFlowStep === "product-entry"
        ? "selecao atual"
        : "detalhe do produto"

  if (normalizedMessage.includes("oleosa")) {
    if (normalizedDescription.includes("toque seco") || normalizedDescription.includes("matte")) {
      return {
        text: `${input.activeProduct.title} faz sentido para pele oleosa porque ja esta no ${stepLabel} com toque seco e acabamento matte. Posso te orientar sem sair deste ponto${selectedContextLabel ? `, considerando tambem ${selectedContextLabel}` : ""}.`,
      }
    }

    return {
      text: `Estou considerando ${input.activeProduct.title} neste ${stepLabel}. Para pele oleosa, eu avaliaria textura leve e acabamento menos residual antes de avancar${selectedContextLabel ? `, junto com ${selectedContextLabel}` : ""}.`,
    }
  }

  if (
    normalizedMessage.includes("bom para o dia a dia") ||
    normalizedMessage.includes("dia a dia") ||
    normalizedMessage.includes("usar todo dia")
  ) {
    return {
      text: `${input.activeProduct.title} continua aberto no ${stepLabel} e pode entrar na rotina do dia a dia se esse tipo de uso fizer sentido para voce${selectedContextLabel ? `. Tambem estou cruzando isso com ${selectedContextLabel}` : "."}`,
    }
  }

  return {
    text: `Estou considerando ${input.activeProduct.title} no ${stepLabel} enquanto respondo. Posso seguir sua pergunta sem fechar o fluxo${selectedContextLabel ? ` e levando em conta ${selectedContextLabel}` : ""}.`,
  }
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

export const ecommerceMockConversationResolver: ConversationResponseResolver = (input) => {
  const { message } = input
  const activeProductReply = summarizeActiveProductConversation(input)
  if (activeProductReply) {
    return activeProductReply
  }

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
