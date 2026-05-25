const STORAGE_KEY = "ecommerce-exploration:natura"
const MAX_TRACKED_PRODUCTS = 12

export interface ProductExplorationVisit {
  count: number
  lastVisitedAt: number
}

export type ProductExplorationMemory = Record<string, ProductExplorationVisit>

function readMemory(): ProductExplorationMemory {
  if (typeof window === "undefined") {
    return {}
  }

  try {
    const storedValue = window.sessionStorage.getItem(STORAGE_KEY)
    if (!storedValue) {
      return {}
    }

    const parsed = JSON.parse(storedValue) as ProductExplorationMemory
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

function writeMemory(memory: ProductExplorationMemory) {
  if (typeof window === "undefined") {
    return
  }

  const trimmedEntries = Object.entries(memory)
    .sort(([, left], [, right]) => right.lastVisitedAt - left.lastVisitedAt)
    .slice(0, MAX_TRACKED_PRODUCTS)

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(trimmedEntries)))
}

export function recordProductExploration(productId: string): ProductExplorationMemory {
  const memory = readMemory()
  const previousVisit = memory[productId]
  const nextVisit: ProductExplorationVisit = {
    count: (previousVisit?.count ?? 0) + 1,
    lastVisitedAt: Date.now(),
  }

  const nextMemory = {
    ...memory,
    [productId]: nextVisit,
  }

  writeMemory(nextMemory)
  return nextMemory
}

export function getProductExplorationMemory(): ProductExplorationMemory {
  return readMemory()
}

export function orderProductsWithExplorationAwareness<T extends { id: string }>(items: T[]): T[] {
  const memory = readMemory()

  return [...items]
    .map((item, index) => ({
      item,
      index,
      lastVisitedAt: memory[item.id]?.lastVisitedAt ?? 0,
    }))
    .sort((left, right) => {
      if (right.lastVisitedAt !== left.lastVisitedAt) {
        return right.lastVisitedAt - left.lastVisitedAt
      }

      return left.index - right.index
    })
    .map(({ item }) => item)
}

export function hasQuietRevisitAwareness(productId: string, memory: ProductExplorationMemory) {
  return (memory[productId]?.count ?? 0) >= 2
}
