import {
  buildRuntimeBackupKey,
  buildRuntimeLiveKey,
  createFilesystemStorage,
  formatBackupTimestamp,
  resolveBusinessRuntimeStorageRoot,
} from "@/lib/runtime/storage"
import type { RuntimeStorageAdapter } from "@/lib/runtime/storage"
import type { BusinessRuntime } from "../core"
import {
  loadBusinessRuntimeDraft,
  markBusinessRuntimeDraftPublished,
} from "../drafts/storage.server"
import type {
  BusinessRuntimePublicationRecord,
  BusinessRuntimePublicationSummary,
  PublishBusinessRuntimeDraftResult,
} from "./types"

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function getBusinessRuntimePublicationStorage(rootDir: string = process.cwd()): RuntimeStorageAdapter {
  return createFilesystemStorage(resolveBusinessRuntimeStorageRoot(rootDir))
}

function normalizeSlug(value: string) {
  return value.trim().toLowerCase()
}

export function validateBusinessRuntimePublicationSlug(slug: string): string[] {
  const normalized = normalizeSlug(slug)

  if (!normalized) {
    return ["slug is required"]
  }

  if (!SLUG_PATTERN.test(normalized)) {
    return ["slug must use lowercase letters, numbers and hyphens only"]
  }

  return []
}

function toLiveRuntime(runtime: BusinessRuntime, slug: string, updatedAt: string): BusinessRuntime {
  return {
    ...runtime,
    slug,
    status: "published",
    meta: {
      ...runtime.meta,
      updatedAt,
    },
  }
}

function toSummary(record: BusinessRuntimePublicationRecord): BusinessRuntimePublicationSummary {
  return {
    slug: record.slug,
    draftId: record.draftId,
    name: record.runtime.business.name,
    vertical: record.runtime.vertical,
    status: record.runtime.status,
    updatedAt: record.updatedAt,
  }
}

function findPublicationForDraft(
  draftId: string,
  storage: RuntimeStorageAdapter
): BusinessRuntimePublicationRecord | null {
  for (const key of storage.list("runtime").filter((entry) => entry.endsWith("/live"))) {
    const result = storage.readJson<BusinessRuntimePublicationRecord>(key)

    if (result.ok && result.data?.draftId === draftId) {
      return result.data
    }
  }

  return null
}

export function publishBusinessRuntimeDraft(
  draftId: string,
  options: {
    rootDir?: string
    now?: string
  } = {}
): PublishBusinessRuntimeDraftResult {
  const draft = loadBusinessRuntimeDraft(draftId, { rootDir: options.rootDir })

  if (!draft) {
    throw new Error(`BusinessRuntime draft not found: ${draftId}`)
  }

  const slug = normalizeSlug(draft.runtime.slug)
  const slugErrors = validateBusinessRuntimePublicationSlug(slug)

  if (slugErrors.length > 0) {
    throw new Error(slugErrors.join("; "))
  }

  const storage = getBusinessRuntimePublicationStorage(options.rootDir)
  const previousPublication = findPublicationForDraft(draftId, storage)

  if (draft.publishedSlug && draft.publishedSlug !== slug) {
    throw new Error(
      `published slug cannot be changed for draft ${draftId}: current ${draft.publishedSlug}, requested ${slug}`
    )
  }

  if (previousPublication && previousPublication.slug !== slug) {
    throw new Error(
      `published slug cannot be changed for draft ${draftId}: current ${previousPublication.slug}, requested ${slug}`
    )
  }

  const liveKey = buildRuntimeLiveKey(slug)
  const existing = storage.readJson<BusinessRuntimePublicationRecord>(liveKey)

  if (existing.ok && existing.data && existing.data.draftId !== draftId) {
    throw new Error(`slug already published by another draft: ${slug}`)
  }

  const now = options.now ?? new Date().toISOString()
  const publication: BusinessRuntimePublicationRecord = {
    slug,
    draftId,
    runtime: toLiveRuntime(draft.runtime, slug, now),
    publishedAt: existing.data?.publishedAt ?? now,
    updatedAt: now,
  }

  const backupKey = existing.ok && existing.data
    ? buildRuntimeBackupKey(slug, formatBackupTimestamp(new Date(now)))
    : undefined
  const write = storage.writeJson(liveKey, publication, {
    backup: Boolean(backupKey),
    backupKey,
  })

  if (!write.ok) {
    throw new Error(write.error || `Failed to publish BusinessRuntime slug ${slug}`)
  }

  markBusinessRuntimeDraftPublished(draftId, {
    rootDir: options.rootDir,
    publishedSlug: slug,
    publishedAt: now,
  })

  return {
    publication,
    backupKey: write.backupKey,
    backupPath: write.backupPath,
  }
}

export function loadBusinessRuntimePublication(
  slug: string,
  options: { rootDir?: string } = {}
): BusinessRuntimePublicationRecord | null {
  const errors = validateBusinessRuntimePublicationSlug(slug)

  if (errors.length > 0) {
    return null
  }

  const storage = getBusinessRuntimePublicationStorage(options.rootDir)
  const result = storage.readJson<BusinessRuntimePublicationRecord>(buildRuntimeLiveKey(normalizeSlug(slug)))

  if (!result.ok) {
    return null
  }

  return result.data
}

export function listBusinessRuntimePublications(
  options: { rootDir?: string } = {}
): BusinessRuntimePublicationSummary[] {
  const storage = getBusinessRuntimePublicationStorage(options.rootDir)
  return storage
    .list("runtime")
    .filter((key) => key.endsWith("/live"))
    .map((key) => storage.readJson<BusinessRuntimePublicationRecord>(key).data)
    .filter((record): record is BusinessRuntimePublicationRecord => record !== null)
    .map(toSummary)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}
