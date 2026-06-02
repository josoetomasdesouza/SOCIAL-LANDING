import { join } from "node:path"

import { APPOINTMENT_LIVE_VERSION } from "./types"

export function resolveAppointmentRuntimeRoot(rootDir: string = process.cwd()): string {
  return join(rootDir, "data/runtime/appointment")
}

export function resolveAppointmentLiveDocumentPath(
  slug: string,
  rootDir: string = process.cwd()
): string {
  return join(resolveAppointmentRuntimeRoot(rootDir), `${slug}.${APPOINTMENT_LIVE_VERSION}.json`)
}

export function resolveAppointmentDraftDocumentPath(
  slug: string,
  rootDir: string = process.cwd()
): string {
  return join(resolveAppointmentRuntimeRoot(rootDir), `${slug}.draft.json`)
}

export function resolveAppointmentBackupDir(rootDir: string = process.cwd()): string {
  return join(resolveAppointmentRuntimeRoot(rootDir), "backups")
}

export function formatBackupTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace(/:/g, "-")
}

export function resolveAppointmentLiveBackupPath(
  slug: string,
  timestamp: string,
  rootDir: string = process.cwd()
): string {
  return join(resolveAppointmentBackupDir(rootDir), `${slug}.${APPOINTMENT_LIVE_VERSION}.${timestamp}.backup.json`)
}

export function parseBackupFilename(filename: string): { slug: string; timestamp: string } | null {
  const match = /^(.+)\.v1\.(.+)\.backup\.json$/.exec(filename)

  if (!match) {
    return null
  }

  return {
    slug: match[1],
    timestamp: match[2],
  }
}
