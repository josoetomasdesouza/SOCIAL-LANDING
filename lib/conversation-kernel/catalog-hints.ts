import { normalizeKernelText } from "./active-topic"
import type { ModelContextPack } from "./types"

function hasToken(message: string, ...tokens: string[]): boolean {
  const m = normalizeKernelText(message)
  return tokens.some((t) => m.includes(normalizeKernelText(t)))
}

export function extractCatalogFocusToken(message: string): string | undefined {
  const m = normalizeKernelText(message)
  if (hasToken(m, "degrade", "fade")) return "degrade"
  if (hasToken(m, "barba")) return "barba"
  if (hasToken(m, "corte masculino", "corte")) return "corte"
  if (hasToken(m, "hidrat")) return "hidrat"
  return undefined
}

/** Short price reference from catalog entities (services/products with price). */
export function buildCatalogPriceHint(pack: ModelContextPack, message: string, maxItems = 3): string | null {
  const priced = pack.catalog.entities.filter((e) => {
    const price = e.attributes?.price
    return typeof price === "number" || (typeof price === "string" && price.length > 0)
  })
  if (priced.length === 0) return null

  const focus = extractCatalogFocusToken(message)
  const matched = focus
    ? priced.filter((e) => {
        const blob = `${e.name} ${e.attributes?.description ?? ""}`.toLowerCase()
        return blob.includes(focus)
      })
    : []

  const pick = (matched.length > 0 ? matched : priced).slice(0, maxItems)
  const lines = pick.map((e) => {
    const price = e.attributes?.price
    return `${e.name} ~R$ ${price ?? "—"}`
  })
  return `Referência do catálogo: ${lines.join("; ")}. Confirma no balcão ou em Agendar para o valor final.`
}
