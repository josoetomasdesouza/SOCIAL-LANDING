import { copyFileSync, existsSync, mkdirSync, readdirSync, renameSync } from "node:fs"
import { basename } from "node:path"

import {
  parseBackupFilename,
  resolveAppointmentBackupDir,
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
}

export function listAppointmentLiveBackups(
  slug: string,
  rootDir: string = process.cwd()
): AppointmentLiveBackupEntry[] {
  const backupDir = resolveAppointmentBackupDir(rootDir)

  if (!existsSync(backupDir)) {
    return []
  }

  return readdirSync(backupDir)
    .map((filename) => {
      const parsed = parseBackupFilename(filename)

      if (!parsed || parsed.slug !== slug) {
        return null
      }

      return {
        filename,
        path: resolveAppointmentLiveBackupPath(slug, parsed.timestamp, rootDir),
        timestamp: parsed.timestamp,
      }
    })
    .filter((entry): entry is AppointmentLiveBackupEntry => entry !== null)
    .sort((left, right) => right.timestamp.localeCompare(left.timestamp))
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
  if (!to) {
    const latest = resolveLatestAppointmentLiveBackup(slug, rootDir)

    if (!latest) {
      throw new Error(`No live backup found for slug: ${slug}`)
    }

    return latest
  }

  if (existsSync(to)) {
    return {
      path: to,
      filename: basename(to),
      timestamp: parseBackupFilename(basename(to))?.timestamp ?? "",
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
  const livePath = resolveAppointmentLiveDocumentPath(options.slug, rootDir)
  const backupEntry = resolveRollbackBackupTarget(options.slug, options.to, rootDir)

  if (!existsSync(backupEntry.path)) {
    throw new Error(`Backup document not found: ${backupEntry.path}`)
  }

  const preRollbackBackupPath = existsSync(livePath)
    ? resolveAppointmentLiveBackupPath(
        options.slug,
        new Date().toISOString().replace(/:/g, "-"),
        rootDir
      )
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

  if (preRollbackBackupPath) {
    mkdirSync(resolveAppointmentBackupDir(rootDir), { recursive: true })
    copyFileSync(livePath, preRollbackBackupPath)
  }

  const tempLivePath = `${livePath}.rollback.tmp`
  copyFileSync(backupEntry.path, tempLivePath)
  renameSync(tempLivePath, livePath)

  return {
    slug: options.slug,
    dryRun: false,
    livePath,
    backupPath: backupEntry.path,
    preRollbackBackupPath,
  }
}
