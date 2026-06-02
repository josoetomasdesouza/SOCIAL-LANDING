import type { OperationalAdaptationKind } from "./types"

export const OPERATIONAL_PRIMITIVE_ALLOWED_PATHS: Record<OperationalAdaptationKind, readonly string[]> = {
  operational_hints_refresh: [
    "operational.liveState",
    "operational.placeHint",
    "operational.momentHint",
    "operational.hoursHint",
  ],
  arrival_copy_variation: [
    "arrival.addressLine",
    "arrival.referenceHint",
    "arrival.routeHint",
    "arrival.parkingHint",
    "arrival.arrivalMood",
  ],
  brand_description_polish: ["establishment.brand.description"],
  service_copy_polish: ["services[].description"],
  external_review_map: ["feed.sections[reviews].items"],
  story_caption_refresh: ["feed.stories[].label"],
  full_draft_variation: [
    "operational.liveState",
    "operational.placeHint",
    "operational.momentHint",
    "operational.hoursHint",
    "arrival.referenceHint",
    "arrival.arrivalMood",
    "establishment.brand.description",
    "services[].description",
    "feed.stories[].label",
    "meta.publication",
    "meta.updatedAt",
  ],
}

export const OPERATIONAL_PRIMITIVE_LOCKED_PATHS: Record<OperationalAdaptationKind, readonly string[]> = {
  operational_hints_refresh: [
    "arrival.mapsQuery",
    "arrival.drawerTitle",
    "establishment.brand.logo",
    "establishment.brand.coverImage",
    "feed.sections",
    "professionals",
    "services[].id",
    "services[].price",
  ],
  arrival_copy_variation: ["arrival.mapsQuery", "arrival.drawerTitle"],
  brand_description_polish: [
    "establishment.brand.logo",
    "establishment.brand.coverImage",
    "establishment.brand.primaryColor",
  ],
  service_copy_polish: ["services[].id", "services[].price", "services[].duration", "services[].name"],
  external_review_map: ["feed.sections[].id", "feed.sections[videos].items", "feed.sections[news].items"],
  story_caption_refresh: ["feed.stories[].id", "feed.stories[].image"],
  full_draft_variation: [
    "establishment.brand.logo",
    "establishment.brand.coverImage",
    "arrival.mapsQuery",
    "arrival.drawerTitle",
    "professionals[].id",
    "services[].id",
    "styles[].id",
    "feed.stories[].id",
  ],
}

export function getAllowedPathsForKind(kind: OperationalAdaptationKind): readonly string[] {
  return OPERATIONAL_PRIMITIVE_ALLOWED_PATHS[kind]
}

export const OPERATIONAL_AI_INFRA_CHANGED_PATHS = ["meta.updatedAt", "meta.publication"] as const

export function isInfraChangedPath(path: string): boolean {
  return (OPERATIONAL_AI_INFRA_CHANGED_PATHS as readonly string[]).includes(path)
}

export function pathMatchesPattern(changedPath: string, pattern: string): boolean {
  if (pattern === changedPath) {
    return true
  }

  const arrayFieldMatch = /^(.+)\[\]\.(.+)$/.exec(pattern)

  if (arrayFieldMatch) {
    const [, prefix, suffix] = arrayFieldMatch
    return new RegExp(`^${escapeRegExp(prefix)}\\[[^\\]]+\\]\\.${escapeRegExp(suffix)}$`).test(
      changedPath
    )
  }

  if (pattern.endsWith("[]")) {
    const prefix = pattern.slice(0, -2)
    return changedPath.startsWith(`${prefix}[`) || changedPath.startsWith(`${prefix}.`)
  }

  const bracketMatch = /^(.*)\[([^[\]]+)\](.*)$/.exec(pattern)

  if (bracketMatch) {
    const [, before, , after] = bracketMatch
    const dynamic = new RegExp(
      `^${escapeRegExp(before)}\\[[^\\]]+\\]${escapeRegExp(after)}(?:$|\\.)`
    )
    return dynamic.test(changedPath)
  }

  return changedPath.startsWith(`${pattern}.`)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function isChangedPathAllowed(
  changedPath: string,
  kind: OperationalAdaptationKind
): boolean {
  return getAllowedPathsForKind(kind).some((pattern) => pathMatchesPattern(changedPath, pattern))
}
