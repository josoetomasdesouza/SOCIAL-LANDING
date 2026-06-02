import { existsSync } from "node:fs"
import { basename } from "node:path"

import {
  backupFilenameToKey,
  buildRuntimeBackupKey,
  buildRuntimeLiveKey,
  formatBackupTimestamp,
  parseBackupFilename,
  resolveStorageKeyFromFilesystemPath,
} from "../../storage/keys"
import { getFilesystemStorage } from "../../storage/resolve-storage.server"
import { listBackupKeysForSlug } from "../../storage/filesystem-adapter"
import {
  resolveAppointmentLiveBackupPath,
  resolveAppointmentLiveDocumentPath,
} from "./paths"

export interface RollbackAppointmentLiveOptions {
  slug: string
  rootDir?: string
  to?: string
  dryRun?: boolean
}

export interface RollbackAppointmentLiveResult {
  slug: string
  dryRun: boolean
  livePath: string
  backupPath: string
  preRollbackBackupPath: string | null
}

export interface AppointmentLiveBackupEntry {
  filename: string
  path: string
  timestamp: string
  key: string
}

export function listAppointmentLiveBackups(
  slug: string,
  rootDir: string = process.cwd()
): AppointmentLiveBackupEntry[] {
  const storage = getFilesystemStorage(rootDir)

  return listBackupKeysForSlug(storage, slug).map((key) => {
    const path = storage.resolvePath(key)
    const filename = basename(path)
    const parsed = parseBackupFilename(filename)

    return {
      filename,
      path,
      timestamp: parsed?.timestamp ?? "",
      key,
    }
  })
}

export function resolveLatestAppointmentLiveBackup(
  slug: string,
  rootDir: string = process.cwd()
): AppointmentLiveBackupEntry | null {
  const backups = listAppointmentLiveBackups(slug, rootDir)
  return backups[0] ?? null
}

export function resolveAppointmentLiveBackupByTimestamp(
  slug: string,
  timestamp: string,
  rootDir: string = process.cwd()
): AppointmentLiveBackupEntry | null {
  const backups = listAppointmentLiveBackups(slug, rootDir)

  return (
    backups.find(
      (entry) => entry.timestamp === timestamp || entry.filename.includes(timestamp)
    ) ?? null
  )
}

function resolveRollbackBackupTarget(
  slug: string,
  to: string | undefined,
  rootDir: string
): AppointmentLiveBackupEntry {
  const storage = getFilesystemStorage(rootDir)

  if (!to) {
    const latest = resolveLatestAppointmentLiveBackup(slug, rootDir)

    if (!latest) {
      throw new Error(`No live backup found for slug: ${slug}`)
    }

    return latest
  }

  if (storage.exists(to)) {
    const filename = basename(storage.resolvePath(to))
    const key = to

    return {
      path: storage.resolvePath(key),
      filename,
      timestamp: parseBackupFilename(filename)?.timestamp ?? "",
      key,
    }
  }

  if (existsSync(to)) {
    const storageRoot = storage.storageRoot
    const keyFromPath = resolveStorageKeyFromFilesystemPath(to, storageRoot)
    const filename = basename(to)
    const key = keyFromPath ?? backupFilenameToKey(filename)

    if (!key) {
      throw new Error(`Invalid backup path: ${to}`)
    }

    return {
      path: keyFromPath ? storage.resolvePath(key) : to,
      filename,
      timestamp: parseBackupFilename(filename)?.timestamp ?? "",
      key,
    }
  }

  const byTimestamp = resolveAppointmentLiveBackupByTimestamp(slug, to, rootDir)

  if (!byTimestamp) {
    throw new Error(`No live backup found for slug ${slug} matching timestamp: ${to}`)
  }

  return byTimestamp
}

export function rollbackAppointmentLive(
  options: RollbackAppointmentLiveOptions
): RollbackAppointmentLiveResult {
  const rootDir = options.rootDir ?? process.cwd()
  const dryRun = options.dryRun ?? false
  const storage = getFilesystemStorage(rootDir)
  const liveKey = buildRuntimeLiveKey(options.slug)
  const livePath = resolveAppointmentLiveDocumentPath(options.slug, rootDir)
  const backupEntry = resolveRollbackBackupTarget(options.slug, options.to, rootDir)

  if (!storage.exists(backupEntry.key)) {
    throw new Error(`Backup document not found: ${backupEntry.path}`)
  }

  const preRollbackTimestamp = formatBackupTimestamp()
  const preRollbackBackupKey = storage.exists(liveKey)
    ? buildRuntimeBackupKey(options.slug, preRollbackTimestamp)
    : null
  const preRollbackBackupPath = preRollbackBackupKey
    ? resolveAppointmentLiveBackupPath(options.slug, preRollbackTimestamp, rootDir)
    : null

  if (dryRun) {
    return {
      slug: options.slug,
      dryRun: true,
      livePath,
      backupPath: backupEntry.path,
      preRollbackBackupPath,
    }
  }

  if (preRollbackBackupKey) {
    storage.backup(liveKey, preRollbackBackupKey)
  }

  const restoreResult = storage.restore(backupEntry.key, liveKey)

  if (!restoreResult.ok) {
    throw new Error(`Rollback failed for slug: ${options.slug}`)
  }

  return {
    slug: options.slug,
    dryRun: false,
    livePath,
    backupPath: backupEntry.path,
    preRollbackBackupPath: restoreResult.backupPath ?? preRollbackBackupPath,
  }
}
