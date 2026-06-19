import type { BusinessRuntime, BusinessRuntimeService } from "../core"
import type { BusinessOperationalAiPatch } from "./types"

function slugifyId(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
}

function resolveServiceId(service: Partial<BusinessRuntimeService>, index: number) {
  return service.id || `ai-service-${slugifyId(service.name || "servico") || index + 1}`
}

export function mergeBusinessOperationalAiPatch(
  base: BusinessRuntime,
  patch: BusinessOperationalAiPatch
): BusinessRuntime {
  const merged = structuredClone(base)

  if (patch.business) {
    merged.business = {
      ...merged.business,
      ...patch.business,
    }
  }

  if (patch.brand) {
    merged.brand = {
      ...merged.brand,
      ...patch.brand,
    }
  }

  if (patch.services) {
    for (const [index, servicePatch] of patch.services.entries()) {
      const id = resolveServiceId(servicePatch, index)
      const existing = merged.services.find((service) => service.id === id)

      if (existing) {
        Object.assign(existing, servicePatch, { id })
      } else {
        merged.services.push({
          id,
          name: servicePatch.name || "Novo serviço",
          description: servicePatch.description,
          category: servicePatch.category,
          price: servicePatch.price,
          durationMinutes: servicePatch.durationMinutes,
          tags: servicePatch.tags,
        })
      }
    }
  }

  if (patch.hours) {
    merged.hours = {
      ...merged.hours,
      ...patch.hours,
    }
  }

  if (patch.location) {
    merged.location = {
      ...merged.location,
      ...patch.location,
    }
  }

  if (patch.channels) {
    merged.channels = {
      ...merged.channels,
      ...patch.channels,
    }
  }

  if (patch.policies) {
    merged.policies = {
      ...merged.policies,
      ...patch.policies,
    }
  }

  if (patch.knowledge?.faq) {
    merged.knowledge = {
      ...merged.knowledge,
      faq: patch.knowledge.faq,
    }
  }

  return merged
}
