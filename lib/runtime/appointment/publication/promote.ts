import type { AppointmentRuntimeBundle } from "../types"
import {
  buildRuntimeBackupKey,
  buildRuntimeDraftKey,
  buildRuntimeLiveKey,
  formatBackupTimestamp,
} from "../../storage/keys"
import { getFilesystemStorage } from "../../storage/resolve-storage.server"
import {
  readAppointmentRuntimeDocumentByKey,
  writeAppointmentRuntimeDocumentByKey,
} from "./load-document"
import {
  resolveAppointmentDraftDocumentPath,
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
  const storage = getFilesystemStorage(rootDir)
  const draftKey = buildRuntimeDraftKey(options.slug)
  const liveKey = buildRuntimeLiveKey(options.slug)
  const draftPath = resolveAppointmentDraftDocumentPath(options.slug, rootDir)
  const livePath = resolveAppointmentLiveDocumentPath(options.slug, rootDir)

  if (!storage.exists(draftKey)) {
    throw new Error(`Draft document not found: ${draftPath}`)
  }

  const draft = readAppointmentRuntimeDocumentByKey(draftKey, rootDir)

  if (!draft) {
    throw new Error(`Draft document not readable: ${draftPath}`)
  }

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
  const backupKey = storage.exists(liveKey)
    ? buildRuntimeBackupKey(options.slug, formatBackupTimestamp())
    : undefined
  const backupPath = backupKey ? storage.resolvePath(backupKey) : null

  const writeResult = writeAppointmentRuntimeDocumentByKey(liveKey, normalizedLive, rootDir, {
    dryRun,
    backup: Boolean(backupKey),
    backupKey,
  })

  if (!writeResult.ok) {
    throw new Error(`Promote failed for live key: ${liveKey}`)
  }

  return {
    slug: options.slug,
    dryRun,
    draftPath,
    livePath,
    backupPath: writeResult.backupPath ?? backupPath,
    validationErrors: [],
  }
}

export function assertPromoteAppointmentDraft(options: PromoteAppointmentDraftOptions) {
  const draft = readAppointmentRuntimeDocumentByKey(
    buildRuntimeDraftKey(options.slug),
    options.rootDir
  )

  if (!draft) {
    throw new Error(`Missing draft for slug: ${options.slug}`)
  }

  assertAppointmentDraftBundle(draft, options.slug)
}
