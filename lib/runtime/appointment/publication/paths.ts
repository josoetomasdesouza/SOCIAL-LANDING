import { join } from "node:path"

import {
  buildRuntimeBackupKey,
  formatBackupTimestamp,
  parseBackupFilename,
  resolveAppointmentStorageRoot,
  resolveStorageKeyPath,
  RUNTIME_LIVE_VERSION,
} from "../../storage/keys"
import { buildRuntimeDraftKey, buildRuntimeLiveKey } from "../../storage/keys"

export { formatBackupTimestamp, parseBackupFilename, RUNTIME_LIVE_VERSION as APPOINTMENT_LIVE_VERSION }

export function resolveAppointmentRuntimeRoot(rootDir: string = process.cwd()): string {
  return resolveAppointmentStorageRoot(rootDir)
}

export function resolveAppointmentLiveDocumentPath(
  slug: string,
  rootDir: string = process.cwd()
): string {
  return resolveStorageKeyPath(buildRuntimeLiveKey(slug), resolveAppointmentStorageRoot(rootDir))!
}

export function resolveAppointmentDraftDocumentPath(
  slug: string,
  rootDir: string = process.cwd()
): string {
  return resolveStorageKeyPath(buildRuntimeDraftKey(slug), resolveAppointmentStorageRoot(rootDir))!
}

export function resolveAppointmentBackupDir(rootDir: string = process.cwd()): string {
  return join(resolveAppointmentStorageRoot(rootDir), "backups")
}

export function resolveAppointmentLiveBackupPath(
  slug: string,
  timestamp: string,
  rootDir: string = process.cwd()
): string {
  return resolveStorageKeyPath(
    buildRuntimeBackupKey(slug, timestamp),
    resolveAppointmentStorageRoot(rootDir)
  )!
}

export function buildRuntimeLiveKeyForSlug(slug: string): string {
  return buildRuntimeLiveKey(slug)
}

export function buildRuntimeDraftKeyForSlug(slug: string): string {
  return buildRuntimeDraftKey(slug)
}

export function buildRuntimeBackupKeyForSlug(slug: string, timestamp: string = formatBackupTimestamp()): string {
  return buildRuntimeBackupKey(slug, timestamp)
}
