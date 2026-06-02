import { existsSync, readFileSync } from "node:fs"

import {
  buildRuntimeDraftKey,
  buildRuntimeLiveKey,
} from "../../storage/keys"
import { getFilesystemStorage } from "../../storage/resolve-storage.server"
import type { AppointmentRuntimeBundle } from "../types"

function readBundleFromStorageKey(
  key: string,
  rootDir: string = process.cwd()
): AppointmentRuntimeBundle {
  const result = getFilesystemStorage(rootDir).readJson<AppointmentRuntimeBundle>(key)

  if (!result.ok || !result.data) {
    throw new Error(`Failed to read appointment runtime document: ${result.path}`)
  }

  return result.data
}

function resolveStorageKeyFromPath(path: string, rootDir: string = process.cwd()): string | null {
  const storageRoot = getFilesystemStorage(rootDir).storageRoot

  if (!path.startsWith(storageRoot)) {
    return null
  }

  const relative = path.slice(storageRoot.length + 1)

  if (relative.endsWith(".draft.json")) {
    return buildRuntimeDraftKey(relative.replace(".draft.json", ""))
  }

  const liveMatch = /^(.+)\.v1\.json$/.exec(relative)

  if (liveMatch) {
    return buildRuntimeLiveKey(liveMatch[1])
  }

  return null
}

export function appointmentRuntimeDocumentExists(
  path: string,
  rootDir: string = process.cwd()
): boolean {
  const key = resolveStorageKeyFromPath(path, rootDir)

  if (key) {
    return getFilesystemStorage(rootDir).exists(key)
  }

  return existsSync(path)
}

export function readAppointmentRuntimeDocument(
  path: string,
  rootDir: string = process.cwd()
): AppointmentRuntimeBundle {
  const key = resolveStorageKeyFromPath(path, rootDir)

  if (key) {
    return readBundleFromStorageKey(key, rootDir)
  }

  const raw = readFileSync(path, "utf8")
  return JSON.parse(raw) as AppointmentRuntimeBundle
}

export function readAppointmentRuntimeDocumentByKey(
  key: string,
  rootDir?: string
): AppointmentRuntimeBundle | null {
  const result = getFilesystemStorage(rootDir).readJson<AppointmentRuntimeBundle>(key)
  return result.ok ? result.data : null
}

export function writeAppointmentRuntimeDocumentByKey(
  key: string,
  bundle: AppointmentRuntimeBundle,
  rootDir?: string,
  options?: { dryRun?: boolean; backup?: boolean; backupKey?: string }
) {
  return getFilesystemStorage(rootDir).writeJson(key, bundle, options)
}

export function appointmentRuntimeKeyExists(key: string, rootDir?: string): boolean {
  return getFilesystemStorage(rootDir).exists(key)
}
