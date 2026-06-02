import { copyFileSync, existsSync, mkdirSync, renameSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

import type { AppointmentRuntimeBundle } from "../types"
import { readAppointmentRuntimeDocument } from "./load-document"
import {
  formatBackupTimestamp,
  resolveAppointmentDraftDocumentPath,
  resolveAppointmentLiveBackupPath,
  resolveAppointmentLiveDocumentPath,
} from "./paths"
import { assertAppointmentDraftBundle, validateAppointmentDraftBundle } from "./validate-draft"

export interface PromoteAppointmentDraftOptions {
  slug: string
  rootDir?: string
  dryRun?: boolean
}

export interface PromoteAppointmentDraftResult {
  slug: string
  dryRun: boolean
  draftPath: string
  livePath: string
  backupPath: string | null
  validationErrors: string[]
}

export function normalizeDraftForLivePromotion(draft: AppointmentRuntimeBundle): AppointmentRuntimeBundle {
  const live = structuredClone(draft)
  const updatedAt = new Date().toISOString()

  live.meta = {
    source: "runtime",
    slug: live.meta.slug,
    updatedAt,
    ...(live.meta.external ? { external: live.meta.external } : {}),
  }

  return live
}

export function promoteAppointmentDraft(
  options: PromoteAppointmentDraftOptions
): PromoteAppointmentDraftResult {
  const rootDir = options.rootDir ?? process.cwd()
  const dryRun = options.dryRun ?? false
  const draftPath = resolveAppointmentDraftDocumentPath(options.slug, rootDir)
  const livePath = resolveAppointmentLiveDocumentPath(options.slug, rootDir)

  if (!existsSync(draftPath)) {
    throw new Error(`Draft document not found: ${draftPath}`)
  }

  const draft = readAppointmentRuntimeDocument(draftPath)
  const validation = validateAppointmentDraftBundle(draft, options.slug)

  if (!validation.ok) {
    return {
      slug: options.slug,
      dryRun,
      draftPath,
      livePath,
      backupPath: null,
      validationErrors: validation.errors,
    }
  }

  const normalizedLive = normalizeDraftForLivePromotion(draft)
  const backupPath = existsSync(livePath)
    ? resolveAppointmentLiveBackupPath(options.slug, formatBackupTimestamp(), rootDir)
    : null

  if (dryRun) {
    return {
      slug: options.slug,
      dryRun: true,
      draftPath,
      livePath,
      backupPath,
      validationErrors: [],
    }
  }

  if (existsSync(livePath) && !backupPath) {
    throw new Error(`Promote requires a live backup path when ${livePath} exists`)
  }

  if (backupPath) {
    mkdirSync(dirname(backupPath), { recursive: true })
    copyFileSync(livePath, backupPath)
  }

  const tempLivePath = `${livePath}.promote.tmp`
  mkdirSync(dirname(livePath), { recursive: true })
  writeFileSync(tempLivePath, `${JSON.stringify(normalizedLive, null, 2)}\n`, "utf8")
  renameSync(tempLivePath, livePath)

  return {
    slug: options.slug,
    dryRun: false,
    draftPath,
    livePath,
    backupPath,
    validationErrors: [],
  }
}

export function assertPromoteAppointmentDraft(options: PromoteAppointmentDraftOptions) {
  const draftPath = resolveAppointmentDraftDocumentPath(options.slug, options.rootDir ?? process.cwd())
  const draft = readAppointmentRuntimeDocument(draftPath)
  assertAppointmentDraftBundle(draft, options.slug)
}
