import type { ProductEntity } from "./contracts"

export function normalizeSurfaceFlowText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function getProductEntitySearchText(entity: ProductEntity) {
  return normalizeSurfaceFlowText(
    [
      entity.title,
      entity.summary,
      entity.category,
      ...(entity.keywords || []),
    ]
      .filter(Boolean)
      .join(" ")
  )
}

export function rankProductEntitiesForConversation(
  entities: ProductEntity[],
  terms: string[],
  limit: number
) {
  const normalizedTerms = terms
    .map((term) => normalizeSurfaceFlowText(term).trim())
    .filter(Boolean)

  if (normalizedTerms.length === 0) {
    return []
  }

  const rankedEntities = entities
    .map((entity, index) => {
      const searchText = getProductEntitySearchText(entity)
      const score = normalizedTerms.reduce((total, term) => {
        if (!searchText.includes(term)) return total
        return total + (entity.title && normalizeSurfaceFlowText(entity.title).includes(term) ? 3 : 1)
      }, 0)

      return {
        entity,
        index,
        score,
      }
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score
      return left.index - right.index
    })

  const matchingEntities = rankedEntities
    .filter((entry) => entry.score > 0)
    .map((entry) => entry.entity)

  if (matchingEntities.length >= limit) {
    return matchingEntities.slice(0, limit)
  }

  return matchingEntities
}
