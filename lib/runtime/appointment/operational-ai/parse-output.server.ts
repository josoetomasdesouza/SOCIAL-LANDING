import type { OperationalAiPatch, OperationalAdaptationKind } from "./types"
import { validatePatchShape } from "./validate-output"

const PATCH_ROOT_KEYS = new Set([
  "operational",
  "arrival",
  "establishment",
  "services",
  "feed",
])

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function stripMarkdownFence(raw: string): string {
  const trimmed = raw.trim()
  const fenced = /^```(?:json)?\s*([\s\S]*?)```$/i.exec(trimmed)

  if (fenced) {
    return fenced[1]?.trim() ?? trimmed
  }

  return trimmed
}

function extractJsonObject(raw: string): unknown {
  const normalized = stripMarkdownFence(raw)

  try {
    return JSON.parse(normalized)
  } catch {
    const start = normalized.indexOf("{")
    const end = normalized.lastIndexOf("}")

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("parser: response is not JSON")
    }

    return JSON.parse(normalized.slice(start, end + 1))
  }
}

function assertPatchObject(value: unknown, adaptationKind: OperationalAdaptationKind): OperationalAiPatch {
  if (!isPlainObject(value)) {
    throw new Error("parser: patch must be a JSON object")
  }

  for (const key of Object.keys(value)) {
    if (!PATCH_ROOT_KEYS.has(key)) {
      throw new Error(`parser: unexpected patch key "${key}"`)
    }
  }

  const patch = value as OperationalAiPatch
  const shapeErrors = validatePatchShape(patch, adaptationKind)

  if (shapeErrors.length > 0) {
    throw new Error(shapeErrors.join("; "))
  }

  if (Object.keys(value).length === 0) {
    throw new Error("parser: patch must not be empty")
  }

  return patch
}

export function parseOperationalAiPatchResponse(
  raw: string,
  adaptationKind: OperationalAdaptationKind
): OperationalAiPatch {
  if (!raw.trim()) {
    throw new Error("parser: empty LLM response")
  }

  const parsed = extractJsonObject(raw)

  if (!isPlainObject(parsed)) {
    throw new Error("parser: top-level JSON must be an object")
  }

  const topLevelKeys = Object.keys(parsed)

  if (topLevelKeys.length !== 1 || topLevelKeys[0] !== "patch") {
    throw new Error('parser: envelope must be exactly { "patch": ... }')
  }

  return assertPatchObject(parsed.patch, adaptationKind)
}

export function parseOperationalAiPatchObject(
  value: unknown,
  adaptationKind: OperationalAdaptationKind
): OperationalAiPatch {
  return assertPatchObject(value, adaptationKind)
}
