import type { BusinessRuntime } from "../core"
import {
  isBusinessOperationalAiPathAllowed,
  isBusinessOperationalAiPathLocked,
} from "./allowed-paths"
import type {
  BusinessOperationalAiKind,
  BusinessOperationalAiPatch,
  BusinessOperationalAiValidationResult,
} from "./types"

function stableJson(value: unknown) {
  return JSON.stringify(value)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function serviceKey(value: unknown, index: number) {
  return isObject(value) && typeof value.id === "string" ? value.id : String(index)
}

function faqKey(value: unknown, index: number) {
  return isObject(value) && typeof value.id === "string" ? value.id : String(index)
}

function collectDiffPaths(left: unknown, right: unknown, prefix = ""): string[] {
  if (stableJson(left) === stableJson(right)) {
    return []
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    const leftArray = Array.isArray(left) ? left : []
    const rightArray = Array.isArray(right) ? right : []
    const maxLength = Math.max(leftArray.length, rightArray.length)
    const paths: string[] = []

    for (let index = 0; index < maxLength; index += 1) {
      const leftValue = leftArray[index]
      const rightValue = rightArray[index]
      const key = prefix === "services"
        ? serviceKey(rightValue ?? leftValue, index)
        : prefix === "knowledge.faq"
          ? faqKey(rightValue ?? leftValue, index)
          : String(index)
      paths.push(...collectDiffPaths(leftValue, rightValue, `${prefix}[${key}]`))
    }

    return paths.length > 0 ? paths : [prefix]
  }

  if (isObject(left) || isObject(right)) {
    const leftObject = isObject(left) ? left : {}
    const rightObject = isObject(right) ? right : {}
    const keys = new Set([...Object.keys(leftObject), ...Object.keys(rightObject)])
    const paths = Array.from(keys).flatMap((key) =>
      collectDiffPaths(leftObject[key], rightObject[key], prefix ? `${prefix}.${key}` : key)
    )

    return paths.length > 0 ? paths : [prefix]
  }

  return prefix ? [prefix] : []
}

function collectPatchPaths(patch: BusinessOperationalAiPatch): string[] {
  return collectDiffPaths({}, patch)
}

function validatePatchShape(patch: BusinessOperationalAiPatch): string[] {
  const errors: string[] = []
  const patchPaths = collectPatchPaths(patch)

  for (const path of patchPaths) {
    if (isBusinessOperationalAiPathLocked(path)) {
      errors.push(`locked paths: ${path} cannot be patched`)
    }
  }

  return errors
}

export function collectBusinessRuntimeChangedPaths(
  base: BusinessRuntime,
  merged: BusinessRuntime
): string[] {
  return collectDiffPaths(base, merged)
}

export function validateBusinessOperationalAiOutput(options: {
  baseRuntime: BusinessRuntime
  mergedRuntime: BusinessRuntime
  patch: BusinessOperationalAiPatch
  kind: BusinessOperationalAiKind
}): BusinessOperationalAiValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  errors.push(...validatePatchShape(options.patch))

  const changedPaths = collectBusinessRuntimeChangedPaths(
    options.baseRuntime,
    options.mergedRuntime
  )

  if (changedPaths.length === 0) {
    errors.push("drift: operational AI patch must change at least one allowed field")
  }

  for (const path of changedPaths) {
    if (!isBusinessOperationalAiPathAllowed(path, options.kind)) {
      errors.push(`allowed paths: ${path} is not allowed for ${options.kind}`)
    }
  }

  if (!options.mergedRuntime.business.name.trim()) {
    errors.push("runtime: business.name cannot be empty")
  }

  if (!options.mergedRuntime.brand.name.trim()) {
    errors.push("runtime: brand.name cannot be empty")
  }

  for (const service of options.mergedRuntime.services) {
    if (!service.id || !service.name.trim()) {
      errors.push("runtime: services must keep id and name")
    }
  }

  for (const faq of options.mergedRuntime.knowledge.faq ?? []) {
    if (!faq.id || !faq.question.trim() || !faq.answer.trim()) {
      errors.push("runtime: faq entries must keep id, question and answer")
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    changedPaths,
  }
}

export function buildInvalidBusinessOperationalPatchExample(): BusinessOperationalAiPatch & {
  slug: string
} {
  return {
    slug: "forbidden-slug",
    business: {
      name: "Tentativa proibida",
      description: "Este patch tenta alterar slug.",
    },
  }
}
