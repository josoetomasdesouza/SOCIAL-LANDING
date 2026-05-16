import type { ConversationContextPayload, Product } from "@/lib/business-types"
import type { ConversationalSearchProductResult } from "@/lib/mock-data/conversational-search"
import type { ProductEntity } from "./contracts"

export function catalogProductToProductEntity(product: Product): ProductEntity {
  return {
    id: product.id,
    title: product.name,
    image: product.images[0] || "",
    summary: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    category: product.category,
    rating: product.rating,
    reviewCount: product.reviewCount,
    sourceRefs: {
      catalogId: product.id,
      conversationalResultId: product.id,
    },
  }
}

export function productEntityToConversationContext(entity: ProductEntity): ConversationContextPayload {
  return {
    id: entity.id,
    title: entity.title,
    image: entity.image,
    subtitle: entity.category || "Produto",
  }
}

export function productEntityToConversationalResult(entity: ProductEntity): ConversationalSearchProductResult {
  return {
    id: entity.sourceRefs?.conversationalResultId || entity.id,
    title: entity.title,
    image: entity.image,
    price: entity.price,
    ctaLabel: "Ver",
  }
}
