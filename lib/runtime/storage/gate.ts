import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { getAppointmentRuntimeSeedDocument } from "../appointment/runtime-store"
import { APPOINTMENT_PILOT_SLUG } from "../appointment/types"
import {
  readExternalRealityMergedPreview,
  writeExternalRealityMergedPreview,
} from "../appointment/external-reality/merged-preview"
import { readExternalRealityFileCache, writeExternalRealityFileCache } from "../appointment/external-reality/snapshot-cache"
import {
  readExternalRealitySyncReport,
  writeExternalRealitySyncReport,
} from "../appointment/external-reality/sync-report"
import type { ExternalRealitySnapshot } from "../appointment/external-reality/types"
import { initAppointmentDraft } from "../appointment/publication/draft-init"
import {
  readAppointmentRuntimeDocumentByKey,
  writeAppointmentRuntimeDocumentByKey,
} from "../appointment/publication/load-document"
import { promoteAppointmentDraft } from "../appointment/publication/promote"
import { listAppointmentLiveBackups, rollbackAppointmentLive } from "../appointment/publication/rollback"
import {
  buildExternalMergedPreviewKey,
  buildExternalSnapshotKey,
  buildExternalSyncReportKey,
  buildRuntimeDraftKey,
  buildRuntimeLiveKey,
} from "./keys"
import { getFilesystemStorage } from "./resolve-storage.server"
import { runFilesystemStorageParityChecks } from "./parity"
import type { AppointmentRuntimeBundle } from "../appointment/types"

function prepareLiveSeedForSlug(
  seed: AppointmentRuntimeBundle,
  slug: string
): AppointmentRuntimeBundle {
  const bundle = structuredClone(seed)

  bundle.meta.slug = slug
  bundle.establishment.slug = slug
  bundle.establishment.id = `establishment-${slug}`

  return bundle
}

function runStoragePublicationIntegrationChecks() {
  const errors: string[] = []
  const slug = "storage-gate-slug"
  const liveSeed = getAppointmentRuntimeSeedDocument(APPOINTMENT_PILOT_SLUG)

  if (!liveSeed) {
    return {
      ok: false,
      errors: ["publication integration: missing live seed"],
      snapshot: {},
    }
  }

  const workspaceDir = mkdtempSync(join(tmpdir(), "appointment-storage-publication-"))

  try {
    const storage = getFilesystemStorage(workspaceDir)
    const liveKey = buildRuntimeLiveKey(slug)
    const draftKey = buildRuntimeDraftKey(slug)

    const liveForGate = prepareLiveSeedForSlug(liveSeed, slug)
    const seedWrite = writeAppointmentRuntimeDocumentByKey(liveKey, liveForGate, workspaceDir)

    if (!seedWrite.ok) {
      errors.push("publication integration: failed to seed live via adapter")
    }

    const initResult = initAppointmentDraft({
      slug,
      rootDir: workspaceDir,
      force: true,
    })

    if (!storage.exists(draftKey)) {
      errors.push("publication integration: draft-init must create draft key")
    }

    const dryRun = promoteAppointmentDraft({
      slug,
      rootDir: workspaceDir,
      dryRun: true,
    })

    if (dryRun.validationErrors.length > 0) {
      errors.push(...dryRun.validationErrors.map((error) => `publication dry-run: ${error}`))
    }

    const draft = readAppointmentRuntimeDocumentByKey(draftKey, workspaceDir)

    if (!draft) {
      errors.push("publication integration: draft must be readable by key")
    } else {
      draft.operational = {
        ...draft.operational,
        liveState: "STORAGE-GATE-PROMOTE",
      }
      writeAppointmentRuntimeDocumentByKey(draftKey, draft, workspaceDir)
    }

    const backupsBefore = listAppointmentLiveBackups(slug, workspaceDir).length
    const promoteResult = promoteAppointmentDraft({
      slug,
      rootDir: workspaceDir,
      dryRun: false,
    })

    if (promoteResult.validationErrors.length > 0) {
      errors.push(...promoteResult.validationErrors.map((error) => `publication promote: ${error}`))
    }

    const liveAfterPromote = readAppointmentRuntimeDocumentByKey(liveKey, workspaceDir)

    if (liveAfterPromote?.operational.liveState !== "STORAGE-GATE-PROMOTE") {
      errors.push("publication integration: promote must persist draft operational state to live")
    }

    const backupsAfter = listAppointmentLiveBackups(slug, workspaceDir).length

    if (backupsAfter <= backupsBefore) {
      errors.push("publication integration: promote must create live backup")
    }

    const rollbackResult = rollbackAppointmentLive({
      slug,
      rootDir: workspaceDir,
      dryRun: false,
    })

    if (rollbackResult.dryRun) {
      errors.push("publication integration: rollback execute must not be dry-run")
    }

    const liveAfterRollback = readAppointmentRuntimeDocumentByKey(liveKey, workspaceDir)

    if (liveAfterRollback?.operational.liveState === "STORAGE-GATE-PROMOTE") {
      errors.push("publication integration: rollback must restore pre-promote live")
    }

    return {
      ok: errors.length === 0,
      errors,
      snapshot: {
        slug,
        derivedFrom: initResult.derivedFrom,
        backupCount: backupsAfter,
      },
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
    return { ok: false, errors, snapshot: {} }
  } finally {
    rmSync(workspaceDir, { recursive: true, force: true })
  }
}

function runStorageExternalIntegrationChecks() {
  const errors: string[] = []
  const slug = "storage-gate-slug"
  const workspaceDir = mkdtempSync(join(tmpdir(), "appointment-storage-external-"))

  try {
    const storage = getFilesystemStorage(workspaceDir)
    const snapshotKey = buildExternalSnapshotKey(slug)
    const syncReportKey = buildExternalSyncReportKey(slug)
    const mergedPreviewKey = buildExternalMergedPreviewKey(slug)
    const liveSeed = getAppointmentRuntimeSeedDocument(APPOINTMENT_PILOT_SLUG)

    if (!liveSeed) {
      return {
        ok: false,
        errors: ["external integration: missing live seed"],
        snapshot: {},
      }
    }

    const snapshot: ExternalRealitySnapshot = {
      provider: "google-places",
      placeId: "ChIJ-storage-gate",
      fetchedAt: new Date().toISOString(),
      place: {
        displayName: "Storage Gate Place",
        formattedAddress: "Rua Teste 1",
        location: { lat: -23.5, lng: -46.6 },
      },
      hours: { openNow: true },
      rating: {},
      reviews: [],
    }

    writeExternalRealityFileCache(slug, snapshot, workspaceDir)

    if (!storage.exists(snapshotKey)) {
      errors.push("external integration: snapshot key must exist after write")
    }

    const readSnapshot = readExternalRealityFileCache(slug, workspaceDir)

    if (readSnapshot?.place.displayName !== "Storage Gate Place") {
      errors.push("external integration: snapshot must round-trip via adapter")
    }

    writeExternalRealitySyncReport(
      {
        slug,
        placeId: snapshot.placeId,
        status: "live",
        syncedAt: snapshot.fetchedAt,
        snapshotPath: storage.resolvePath(snapshotKey),
      },
      workspaceDir
    )

    if (!storage.exists(syncReportKey)) {
      errors.push("external integration: sync-report key must exist after write")
    }

    const readReport = readExternalRealitySyncReport(slug, workspaceDir)

    if (readReport?.status !== "live" || !readReport.snapshotPath) {
      errors.push("external integration: sync-report must round-trip via adapter")
    }

    writeExternalRealityMergedPreview(slug, liveSeed, workspaceDir)

    if (!storage.exists(mergedPreviewKey)) {
      errors.push("external integration: merged-preview key must exist after write")
    }

    const readPreview = readExternalRealityMergedPreview(slug, workspaceDir)

    if (readPreview?.meta.slug !== liveSeed.meta.slug) {
      errors.push("external integration: merged-preview must round-trip via adapter")
    }

    return {
      ok: errors.length === 0,
      errors,
      snapshot: {
        slug,
        snapshotKey,
        syncReportKey,
        mergedPreviewKey,
      },
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
    return { ok: false, errors, snapshot: {} }
  } finally {
    rmSync(workspaceDir, { recursive: true, force: true })
  }
}

export function runAppointmentStorageGateChecks() {
  const errors: string[] = []

  const coreResult = runFilesystemStorageParityChecks()

  if (!coreResult.ok) {
    errors.push(...coreResult.errors.map((error) => `core adapter: ${error}`))
  }

  const publicationResult = runStoragePublicationIntegrationChecks()

  if (!publicationResult.ok) {
    errors.push(...publicationResult.errors.map((error) => `publication: ${error}`))
  }

  const externalResult = runStorageExternalIntegrationChecks()

  if (!externalResult.ok) {
    errors.push(...externalResult.errors.map((error) => `external: ${error}`))
  }

  return {
    ok: errors.length === 0,
    errors,
    snapshot: {
      core: coreResult.snapshot,
      publication: publicationResult.snapshot,
      external: externalResult.snapshot,
    },
  }
}
