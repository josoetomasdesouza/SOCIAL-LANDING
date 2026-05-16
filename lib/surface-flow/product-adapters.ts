import type { ConversationContextPayload, Product } from "@/lib/business-types"
import type { ConversationalSearchProductResult, ProductEntity } from "./contracts"
import { normalizeSurfaceFlowText } from "./product-entity"

function uniq(values: Array<string | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])]
}

function buildProductKeywords(product: Product) {
  const specificationFragments = product.specifications?.flatMap((specification) => [
    specification.label,
    specification.value,
  ]) || []

  const searchableFragments = uniq([
    product.category,
    product.subcategory,
    product.description,
    product.fullDescription,
    ...specificationFragments,
  ])

  const normalizedSearchableText = normalizeSurfaceFlowText(searchableFragments.join(" "))
  const derivedKeywords: string[] = []

  if (
    normalizedSearchableText.includes("facial") ||
    normalizedSearchableText.includes("rosto")
  ) {
    derivedKeywords.push("facial", "rosto", "pele", "skincare")
  }

  if (normalizedSearchableText.includes("pele")) {
    derivedKeywords.push("pele", "skincare")
  }

  if (
    normalizedSearchableText.includes("hidratacao") ||
    normalizedSearchableText.includes("hidratante") ||
    normalizedSearchableText.includes("hidrata")
  ) {
    derivedKeywords.push("hidratante")
  }

  if (
    normalizedSearchableText.includes("protecao solar") ||
    normalizedSearchableText.includes("fps")
  ) {
    derivedKeywords.push("protetor")
  }

  return uniq([...searchableFragments, ...derivedKeywords])
}

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
    keywords: buildProductKeywords(product),
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
    id: entity.id,
    title: entity.title,
    image: entity.image,
    price: entity.price,
    ctaLabel: "Ver",
  }
}
