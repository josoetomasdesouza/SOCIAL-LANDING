import { join } from "node:path"

import { readdirSync } from "node:fs"

export const RUNTIME_LIVE_VERSION = "v1" as const

export const STORAGE_KEY_RUNTIME_LIVE = "runtime"
export const STORAGE_KEY_RUNTIME_DRAFT = "draft"
export const STORAGE_KEY_RUNTIME_BACKUP = "backup"
export const STORAGE_KEY_EXTERNAL_SNAPSHOT = "snapshot"
export const STORAGE_KEY_EXTERNAL_SYNC_REPORT = "sync-report"
export const STORAGE_KEY_EXTERNAL_MERGED_PREVIEW = "merged-preview"

export function resolveAppointmentStorageRoot(rootDir: string = process.cwd()): string {
  return join(rootDir, "data/runtime/appointment")
}

export function buildRuntimeLiveKey(slug: string): string {
  return `${STORAGE_KEY_RUNTIME_LIVE}/${slug}/live`
}

export function buildRuntimeDraftKey(slug: string): string {
  return `${STORAGE_KEY_RUNTIME_LIVE}/${slug}/draft`
}

export function buildRuntimeBackupKey(slug: string, timestamp: string): string {
  return `${STORAGE_KEY_RUNTIME_LIVE}/${slug}/${STORAGE_KEY_RUNTIME_BACKUP}/${timestamp}`
}

export function buildRuntimeBackupPrefix(slug: string): string {
  return `${STORAGE_KEY_RUNTIME_LIVE}/${slug}/${STORAGE_KEY_RUNTIME_BACKUP}/`
}

export function buildExternalSnapshotKey(slug: string): string {
  return `external/${slug}/${STORAGE_KEY_EXTERNAL_SNAPSHOT}`
}

export function buildExternalSyncReportKey(slug: string): string {
  return `external/${slug}/${STORAGE_KEY_EXTERNAL_SYNC_REPORT}`
}

export function buildExternalMergedPreviewKey(slug: string): string {
  return `external/${slug}/${STORAGE_KEY_EXTERNAL_MERGED_PREVIEW}`
}

export function formatBackupTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace(/:/g, "-")
}

export function parseBackupFilename(filename: string): { slug: string; timestamp: string } | null {
  const match = new RegExp(`^(.+)\\.${RUNTIME_LIVE_VERSION}\\.(.+)\\.backup\\.json$`).exec(filename)

  if (!match) {
    return null
  }

  return {
    slug: match[1],
    timestamp: match[2],
  }
}

export function backupFilenameToKey(filename: string): string | null {
  const parsed = parseBackupFilename(filename)

  if (!parsed) {
    return null
  }

  return buildRuntimeBackupKey(parsed.slug, parsed.timestamp)
}

export function resolveStorageKeyPath(key: string, storageRoot: string): string | null {
  const liveMatch = /^runtime\/([^/]+)\/live$/.exec(key)

  if (liveMatch) {
    return join(storageRoot, `${liveMatch[1]}.${RUNTIME_LIVE_VERSION}.json`)
  }

  const draftMatch = /^runtime\/([^/]+)\/draft$/.exec(key)

  if (draftMatch) {
    return join(storageRoot, `${draftMatch[1]}.draft.json`)
  }

  const backupMatch = /^runtime\/([^/]+)\/backup\/(.+)$/.exec(key)

  if (backupMatch) {
    return join(
      storageRoot,
      "backups",
      `${backupMatch[1]}.${RUNTIME_LIVE_VERSION}.${backupMatch[2]}.backup.json`
    )
  }

  const snapshotMatch = /^external\/([^/]+)\/snapshot$/.exec(key)

  if (snapshotMatch) {
    return join(storageRoot, "external", `${snapshotMatch[1]}.snapshot.json`)
  }

  const syncReportMatch = /^external\/([^/]+)\/sync-report$/.exec(key)

  if (syncReportMatch) {
    return join(storageRoot, "external", `${syncReportMatch[1]}.sync-report.json`)
  }

  const mergedPreviewMatch = /^external\/([^/]+)\/merged-preview$/.exec(key)

  if (mergedPreviewMatch) {
    return join(storageRoot, "external", `${mergedPreviewMatch[1]}.merged-preview.json`)
  }

  return null
}

export function resolveStorageKeyFromFilesystemPath(
  path: string,
  storageRoot: string
): string | null {
  if (!path.startsWith(storageRoot)) {
    return null
  }

  const relative = path.slice(storageRoot.length + 1)

  if (relative.endsWith(".draft.json") && !relative.includes("/")) {
    return buildRuntimeDraftKey(relative.replace(".draft.json", ""))
  }

  const liveMatch = /^(.+)\.v1\.json$/.exec(relative)

  if (liveMatch && !relative.includes("/")) {
    return buildRuntimeLiveKey(liveMatch[1])
  }

  const backupMatch = /^backups\/(.+)\.v1\.(.+)\.backup\.json$/.exec(relative)

  if (backupMatch) {
    return buildRuntimeBackupKey(backupMatch[1], backupMatch[2])
  }

  const snapshotMatch = /^external\/(.+)\.snapshot\.json$/.exec(relative)

  if (snapshotMatch) {
    return buildExternalSnapshotKey(snapshotMatch[1])
  }

  const syncReportMatch = /^external\/(.+)\.sync-report\.json$/.exec(relative)

  if (syncReportMatch) {
    return buildExternalSyncReportKey(syncReportMatch[1])
  }

  const mergedPreviewMatch = /^external\/(.+)\.merged-preview\.json$/.exec(relative)

  if (mergedPreviewMatch) {
    return buildExternalMergedPreviewKey(mergedPreviewMatch[1])
  }

  return null
}

export function listRuntimeBackupKeys(slug: string, storageRoot: string): string[] {
  const backupDir = join(storageRoot, "backups")

  try {
    return readdirSync(backupDir)
      .map((filename) => backupFilenameToKey(filename))
      .filter((entry): entry is string => entry !== null && entry.startsWith(buildRuntimeBackupPrefix(slug)))
      .sort((left, right) => right.localeCompare(left))
  } catch {
    return []
  }
}
