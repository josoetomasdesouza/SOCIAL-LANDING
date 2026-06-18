import { buildRuntimeDraftKey, createFilesystemStorage, resolveBusinessRuntimeStorageRoot } from "@/lib/runtime/storage"
import type { RuntimeStorageAdapter } from "@/lib/runtime/storage"
import type { BusinessRuntime } from "../core"
import { buildBusinessRuntimeDraft } from "./build-runtime"
import type {
  BusinessRuntimeDraftInput,
  BusinessRuntimeDraftRecord,
  BusinessRuntimeDraftSummary,
} from "./types"

function getBusinessRuntimeDraftStorage(rootDir: string = process.cwd()): RuntimeStorageAdapter {
  return createFilesystemStorage(resolveBusinessRuntimeStorageRoot(rootDir))
}

function toDraftKey(draftId: string) {
  return buildRuntimeDraftKey(draftId)
}

function assertDraftRuntime(runtime: BusinessRuntime): BusinessRuntime {
  return {
    ...runtime,
    status: "draft",
    meta: {
      ...runtime.meta,
      updatedAt: runtime.meta.updatedAt || new Date().toISOString(),
    },
  }
}

function toSummary(record: BusinessRuntimeDraftRecord): BusinessRuntimeDraftSummary {
  return {
    draftId: record.draftId,
    slug: record.runtime.slug,
    name: record.runtime.business.name,
    vertical: record.runtime.vertical,
    status: record.runtime.status,
    updatedAt: record.updatedAt,
    publishedSlug: record.publishedSlug,
    lastPublishedAt: record.lastPublishedAt,
    publicationVersion: record.publicationVersion,
  }
}

export function createBusinessRuntimeDraft(
  input: BusinessRuntimeDraftInput,
  options: {
    rootDir?: string
    draftId?: string
    now?: string
  } = {}
): BusinessRuntimeDraftRecord {
  const runtime = buildBusinessRuntimeDraft(input, {
    draftId: options.draftId,
    now: options.now,
  })
  const now = options.now ?? runtime.meta.updatedAt
  const record: BusinessRuntimeDraftRecord = {
    draftId: runtime.slug,
    runtime: assertDraftRuntime(runtime),
    createdAt: now,
    updatedAt: now,
  }

  const storage = getBusinessRuntimeDraftStorage(options.rootDir)
  const result = storage.writeJson(toDraftKey(record.draftId), record)

  if (!result.ok) {
    throw new Error(result.error || `Failed to write BusinessRuntime draft ${record.draftId}`)
  }

  return record
}

export function loadBusinessRuntimeDraft(
  draftId: string,
  options: { rootDir?: string } = {}
): BusinessRuntimeDraftRecord | null {
  const storage = getBusinessRuntimeDraftStorage(options.rootDir)
  const result = storage.readJson<BusinessRuntimeDraftRecord>(toDraftKey(draftId))

  if (!result.ok) {
    return null
  }

  return result.data
}

export function updateBusinessRuntimeDraft(
  draftId: string,
  runtime: BusinessRuntime,
  options: {
    rootDir?: string
    now?: string
  } = {}
): BusinessRuntimeDraftRecord {
  const existing = loadBusinessRuntimeDraft(draftId, options)

  if (!existing) {
    throw new Error(`BusinessRuntime draft not found: ${draftId}`)
  }

  const updatedAt = options.now ?? new Date().toISOString()
  const record: BusinessRuntimeDraftRecord = {
    ...existing,
    runtime: assertDraftRuntime({
      ...runtime,
      meta: {
        ...runtime.meta,
        updatedAt,
      },
    }),
    updatedAt,
  }

  const storage = getBusinessRuntimeDraftStorage(options.rootDir)
  const result = storage.writeJson(toDraftKey(draftId), record)

  if (!result.ok) {
    throw new Error(result.error || `Failed to update BusinessRuntime draft ${draftId}`)
  }

  return record
}

export function deleteBusinessRuntimeDraft(
  draftId: string,
  options: { rootDir?: string } = {}
) {
  const storage = getBusinessRuntimeDraftStorage(options.rootDir)
  return storage.delete(toDraftKey(draftId))
}

export function markBusinessRuntimeDraftPublished(
  draftId: string,
  options: {
    rootDir?: string
    publishedSlug: string
    publishedAt: string
  }
): BusinessRuntimeDraftRecord {
  const existing = loadBusinessRuntimeDraft(draftId, options)

  if (!existing) {
    throw new Error(`BusinessRuntime draft not found: ${draftId}`)
  }

  const record: BusinessRuntimeDraftRecord = {
    ...existing,
    runtime: assertDraftRuntime(existing.runtime),
    updatedAt: existing.updatedAt,
    publishedSlug: options.publishedSlug,
    lastPublishedAt: options.publishedAt,
    publicationVersion: (existing.publicationVersion ?? 0) + 1,
  }

  const storage = getBusinessRuntimeDraftStorage(options.rootDir)
  const result = storage.writeJson(toDraftKey(draftId), record)

  if (!result.ok) {
    throw new Error(result.error || `Failed to update BusinessRuntime draft publication metadata ${draftId}`)
  }

  return record
}

export function listBusinessRuntimeDrafts(
  options: { rootDir?: string } = {}
): BusinessRuntimeDraftSummary[] {
  const storage = getBusinessRuntimeDraftStorage(options.rootDir)
  return storage
    .list("runtime")
    .filter((key) => key.endsWith("/draft"))
    .map((key) => storage.readJson<BusinessRuntimeDraftRecord>(key).data)
    .filter((record): record is BusinessRuntimeDraftRecord => record !== null)
    .map(toSummary)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}
