import type { ConversationContextPayload } from "@/lib/business-types"

export interface ConversationalSearchProductResult {
  id: string
  title: string
  image: string
  price?: number
  ctaLabel?: string
}

export interface ConversationalSearchVisualBlock {
  type: "product-carousel"
  products: ConversationalSearchProductResult[]
}

export interface ConversationResponseResolverResult {
  text: string
  visualBlock?: ConversationalSearchVisualBlock
}

export interface ConversationResponseResolverInput {
  message: string
  brandName: string
  contextItems: ConversationContextPayload[]
}

export type ConversationResponseResolver = (
  input: ConversationResponseResolverInput
) => ConversationResponseResolverResult | null

const MOCK_FACIAL_PRODUCTS: ConversationalSearchProductResult[] = [
  {
    id: "facial-cleanser",
    title: "Gel de Limpeza Facial",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop",
    price: 49.90,
    ctaLabel: "Ver",
  },
  {
    id: "facial-serum",
    title: "Serum Uniformizador",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop",
    price: 79.90,
    ctaLabel: "Ver",
  },
  {
    id: "facial-sunscreen",
    title: "Protetor Solar Facial FPS 70",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop",
    price: 89.90,
    ctaLabel: "Ver",
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
  const mentionsProduct = normalizedMessage.includes("produto")
  const mentionsFacialCategory =
    normalizedMessage.includes("facial") ||
    normalizedMessage.includes("faciais") ||
    normalizedMessage.includes("rosto") ||
    normalizedMessage.includes("pele")

  return mentionsProduct && mentionsFacialCategory
}

export const ecommerceMockConversationResolver: ConversationResponseResolver = ({ message }) => {
  if (!matchesFacialProductsIntent(message)) {
    return null
  }

  return {
    text: "Encontrei alguns produtos que combinam com isso.",
    visualBlock: {
      type: "product-carousel",
      products: MOCK_FACIAL_PRODUCTS,
    },
  }
}
