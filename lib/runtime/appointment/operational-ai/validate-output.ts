import type { AppointmentRuntimeBundle } from "../types"
import { isChangedPathAllowed, isInfraChangedPath } from "./allowed-paths"
import { collectGrammarPaths, validateOperationalGrammarField } from "./grammar-gate"
import type { OperationalAdaptationKind, OperationalAiPatch, OperationalAiValidationResult } from "./types"
import { validateAppointmentRuntimeBundle } from "../validate"
import { validateAppointmentDraftBundle } from "../publication/validate-draft"

function stableJson(value: unknown): string {
  return JSON.stringify(value)
}

export function collectChangedPaths(
  base: AppointmentRuntimeBundle,
  merged: AppointmentRuntimeBundle
): string[] {
  const changes: string[] = []

  if (stableJson(base.operational) !== stableJson(merged.operational)) {
    for (const key of Object.keys(merged.operational) as Array<keyof typeof merged.operational>) {
      if (base.operational[key] !== merged.operational[key]) {
        changes.push(`operational.${key}`)
      }
    }
  }

  for (const key of Object.keys(merged.arrival) as Array<keyof typeof merged.arrival>) {
    if (base.arrival[key] !== merged.arrival[key]) {
      changes.push(`arrival.${key}`)
    }
  }

  if (base.establishment.brand.description !== merged.establishment.brand.description) {
    changes.push("establishment.brand.description")
  }

  if (base.establishment.brand.logo !== merged.establishment.brand.logo) {
    changes.push("establishment.brand.logo")
  }

  if (base.establishment.brand.coverImage !== merged.establishment.brand.coverImage) {
    changes.push("establishment.brand.coverImage")
  }

  if (base.establishment.brand.primaryColor !== merged.establishment.brand.primaryColor) {
    changes.push("establishment.brand.primaryColor")
  }

  for (const service of merged.services) {
    const baseService = base.services.find((entry) => entry.id === service.id)

    if (!baseService) {
      changes.push(`services[${service.id}]`)
      continue
    }

    if (baseService.description !== service.description) {
      changes.push(`services[${service.id}].description`)
    }

    if (baseService.price !== service.price) {
      changes.push(`services[${service.id}].price`)
    }

    if (baseService.duration !== service.duration) {
      changes.push(`services[${service.id}].duration`)
    }

    if (baseService.name !== service.name) {
      changes.push(`services[${service.id}].name`)
    }
  }

  for (const story of merged.feed.stories) {
    const baseStory = base.feed.stories.find((entry) => entry.id === story.id)

    if (!baseStory) {
      changes.push(`feed.stories[${story.id}]`)
      continue
    }

    if (baseStory.label !== story.label) {
      changes.push(`feed.stories[${story.id}].label`)
    }

    if (baseStory.image !== story.image) {
      changes.push(`feed.stories[${story.id}].image`)
    }
  }

  if (stableJson(base.feed.sections) !== stableJson(merged.feed.sections)) {
    for (const section of merged.feed.sections) {
      const baseSection = base.feed.sections.find((entry) => entry.id === section.id)

      if (!baseSection) {
        changes.push(`feed.sections[${section.id}]`)
        continue
      }

      if (stableJson(baseSection.items) !== stableJson(section.items)) {
        changes.push(`feed.sections[${section.id}].items`)
      }
    }
  }

  if (base.meta.updatedAt !== merged.meta.updatedAt) {
    changes.push("meta.updatedAt")
  }

  if (stableJson(base.meta.publication) !== stableJson(merged.meta.publication)) {
    changes.push("meta.publication")
  }

  return changes
}

export function validateIdPreservation(
  base: AppointmentRuntimeBundle,
  merged: AppointmentRuntimeBundle,
  adaptationKind?: OperationalAdaptationKind
): string[] {
  const errors: string[] = []

  const compareIds = (label: string, left: string[], right: string[]) => {
    if (stableJson(left) !== stableJson(right)) {
      errors.push(`id preservation: ${label} ids changed (${left.join(",")} -> ${right.join(",")})`)
    }
  }

  compareIds(
    "professionals",
    base.professionals.map((entry) => entry.id),
    merged.professionals.map((entry) => entry.id)
  )
  compareIds(
    "services",
    base.services.map((entry) => entry.id),
    merged.services.map((entry) => entry.id)
  )
  compareIds(
    "styles",
    base.styles.map((entry) => entry.id),
    merged.styles.map((entry) => entry.id)
  )
  compareIds(
    "stories",
    base.feed.stories.map((entry) => entry.id),
    merged.feed.stories.map((entry) => entry.id)
  )
  compareIds(
    "feed sections",
    base.feed.sections.map((entry) => entry.id),
    merged.feed.sections.map((entry) => entry.id)
  )

  for (const section of base.feed.sections) {
    if (adaptationKind === "external_review_map" && section.id === "reviews") {
      continue
    }

    const mergedSection = merged.feed.sections.find((entry) => entry.id === section.id)

    if (!mergedSection) {
      continue
    }

    compareIds(
      `feed section ${section.id} items`,
      section.items.map((entry) => entry.id),
      mergedSection.items.map((entry) => entry.id)
    )
  }

  return errors
}

export function validateSectionKindPreservation(
  base: AppointmentRuntimeBundle,
  merged: AppointmentRuntimeBundle,
  adaptationKind?: OperationalAdaptationKind
): string[] {
  const errors: string[] = []

  for (const section of base.feed.sections) {
    const mergedSection = merged.feed.sections.find((entry) => entry.id === section.id)

    if (!mergedSection) {
      errors.push(`section kinds: missing section ${section.id}`)
      continue
    }

    if (adaptationKind === "external_review_map" && section.id === "reviews") {
      for (const item of mergedSection.items) {
        if (item.kind !== "review") {
          errors.push(`section kinds: reviews section must keep review kind`)
        }
      }
      continue
    }

    if (section.items.length !== mergedSection.items.length) {
      errors.push(`section kinds: ${section.id} item count changed`)
      continue
    }

    for (let index = 0; index < section.items.length; index += 1) {
      if (section.items[index]?.kind !== mergedSection.items[index]?.kind) {
        errors.push(
          `section kinds: ${section.id}[${section.items[index]?.id}] kind changed (${section.items[index]?.kind} -> ${mergedSection.items[index]?.kind})`
        )
      }
    }
  }

  return errors
}

export function validateTopologyPreservation(
  base: AppointmentRuntimeBundle,
  merged: AppointmentRuntimeBundle
): string[] {
  const errors: string[] = []

  if (base.professionals.length !== merged.professionals.length) {
    errors.push("topology: professionals length changed")
  }

  if (base.services.length !== merged.services.length) {
    errors.push("topology: services length changed")
  }

  if (base.styles.length !== merged.styles.length) {
    errors.push("topology: styles length changed")
  }

  if (base.feed.stories.length !== merged.feed.stories.length) {
    errors.push("topology: stories length changed")
  }

  if (stableJson(base.feed.sections.map((section) => section.id)) !== stableJson(merged.feed.sections.map((section) => section.id))) {
    errors.push("topology: feed section order/ids changed")
  }

  if (base.arrival.drawerTitle !== merged.arrival.drawerTitle) {
    errors.push("topology: arrival.drawerTitle must remain stable")
  }

  if (base.arrival.mapsQuery !== merged.arrival.mapsQuery) {
    errors.push("topology: arrival.mapsQuery must remain stable")
  }

  return errors
}

export function validatePatchShape(patch: OperationalAiPatch, kind: OperationalAdaptationKind): string[] {
  const errors: string[] = []

  if (patch.arrival?.drawerTitle !== undefined) {
    errors.push("patch shape: arrival.drawerTitle is locked for all primitives")
  }

  if (patch.arrival?.mapsQuery !== undefined) {
    errors.push("patch shape: arrival.mapsQuery is locked for all primitives")
  }

  if (patch.establishment?.brand?.logo !== undefined || patch.establishment?.brand?.coverImage !== undefined) {
    errors.push("patch shape: brand asset urls are locked")
  }

  if (kind !== "external_review_map" && patch.feed?.sections) {
    errors.push("patch shape: feed.sections only allowed for external_review_map")
  }

  return errors
}

export function validateOperationalAiOutput(options: {
  slug: string
  baseBundle: AppointmentRuntimeBundle
  mergedBundle: AppointmentRuntimeBundle
  patch: OperationalAiPatch
  adaptationKind: OperationalAdaptationKind
  validateDraft?: boolean
  grammarPaths?: Array<{ path: string; value: string }>
}): OperationalAiValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const { slug, baseBundle, mergedBundle, patch, adaptationKind } = options

  errors.push(...validatePatchShape(patch, adaptationKind))

  const changedPaths = collectChangedPaths(baseBundle, mergedBundle).filter(
    (path) => !isInfraChangedPath(path)
  )

  if (changedPaths.length === 0) {
    errors.push("drift: fixture must change at least one allowed field")
  }

  for (const changedPath of changedPaths) {
    if (!isChangedPathAllowed(changedPath, adaptationKind)) {
      errors.push(`allowed paths: ${changedPath} is not allowed for ${adaptationKind}`)
    }
  }

  errors.push(...validateIdPreservation(baseBundle, mergedBundle, adaptationKind))
  errors.push(...validateSectionKindPreservation(baseBundle, mergedBundle, adaptationKind))
  errors.push(...validateTopologyPreservation(baseBundle, mergedBundle))

  const runtimeValidation = validateAppointmentRuntimeBundle(mergedBundle, slug)

  if (!runtimeValidation.ok) {
    errors.push(...runtimeValidation.errors.map((error) => `runtime schema: ${error}`))
  }

  if (options.validateDraft !== false) {
    const draftValidation = validateAppointmentDraftBundle(mergedBundle, slug)

    if (!draftValidation.ok) {
      errors.push(...draftValidation.errors.map((error) => `draft schema: ${error}`))
    }
  }

  const grammarEntries = options.grammarPaths ?? collectGrammarPaths(mergedBundle)

  for (const entry of grammarEntries) {
    const changed = changedPaths.some(
      (path) =>
        entry.path === path ||
        entry.path.startsWith(`${path}[`) ||
        path.startsWith(entry.path.split("[")[0] ?? "")
    )

    if (!changed) {
      continue
    }

    errors.push(...validateOperationalGrammarField(entry.path, entry.value))
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  }
}

export function buildInvalidPatchExample(): OperationalAiPatch {
  return {
    arrival: {
      drawerTitle: "PROMO IMPERDIVEL",
      mapsQuery: "https://example.com",
    },
    establishment: {
      brand: {
        logo: "https://evil.example/logo.png",
        description: "Melhor barbearia da cidade — clique aqui!!!",
      },
    },
  }
}

export function buildValidPatchExample(base: AppointmentRuntimeBundle): OperationalAiPatch {
  return {
    operational: {
      ...base.operational,
      momentHint: "encaixe leve no fim da tarde",
    },
  }
}
