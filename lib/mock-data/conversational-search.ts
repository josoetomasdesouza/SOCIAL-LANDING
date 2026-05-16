import type { ReactNode } from "react"
import type { ConversationContextPayload } from "@/lib/business-types"

export interface ConversationalSearchProductResult {
  id: string
  title: string
  image: string
  price?: number
  ctaLabel?: string
  action?: ConversationalSearchCardAction
}

export type ConversationalSearchCardAction =
  | {
      type: "open-product-drawer"
      targetId: string
    }
  | {
      type: "navigate-to-section"
      targetId: string
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

const MOCK_FACIAL_PRODUCTS: ConversationalSearchProductResult[] = [
  {
    id: "facial-cleanser",
    title: "Gel de Limpeza Facial",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop",
    price: 49.90,
    ctaLabel: "Explorar",
    action: {
      type: "navigate-to-section",
      targetId: "categories",
    },
  },
  {
    id: "facial-serum",
    title: "Serum Uniformizador",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop",
    price: 79.90,
    ctaLabel: "Explorar",
    action: {
      type: "navigate-to-section",
      targetId: "categories",
    },
  },
  {
    id: "facial-sunscreen",
    title: "Protetor Solar Facial FPS 70",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop",
    price: 89.90,
    ctaLabel: "Abrir",
    action: {
      type: "open-product-drawer",
      targetId: "prod-5",
    },
  },
]

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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

export const ecommerceMockConversationResolver: ConversationResponseResolver = ({ message }) => {
  if (!matchesFacialProductsIntent(message)) {
    return null
  }

  return {
    text: "Encontrei alguns produtos que combinam com isso.",
    visualBlock: {
      kind: CONVERSATIONAL_SEARCH_RESULTS_KIND,
      payload: {
        products: MOCK_FACIAL_PRODUCTS,
      } satisfies ConversationalSearchResultsPayload,
    },
  }
}
