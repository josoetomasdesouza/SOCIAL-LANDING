import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

import { getAppointmentRuntimeSeedDocument } from "../runtime-store"
import { APPOINTMENT_PILOT_SLUG } from "../types"
import { initAppointmentDraft } from "./draft-init"
import { readAppointmentRuntimeDocument } from "./load-document"
import { resolveAppointmentDraftDocumentPath, resolveAppointmentLiveDocumentPath } from "./paths"
import { isAppointmentPublicationDraftPreviewEnabled, resolveAppointmentPublicationPreviewMode } from "./preview"
import { promoteAppointmentDraft } from "./promote"
import { listAppointmentLiveBackups, rollbackAppointmentLive } from "./rollback"
import { validateAppointmentDraftBundle, validateAppointmentLiveBundle } from "./validate-draft"
import { loadAppointmentRuntimeDraftFromDisk } from "./load-draft.server"

export function runAppointmentPublicationParityChecks() {
  const errors: string[] = []
  const slug = APPOINTMENT_PILOT_SLUG
  const liveSeed = getAppointmentRuntimeSeedDocument(slug)

  if (!liveSeed) {
    errors.push("runtime store live seed missing for publication parity")
    return { ok: false, errors, snapshot: {} }
  }

  const liveValidation = validateAppointmentLiveBundle(liveSeed, slug)

  if (!liveValidation.ok) {
    errors.push(...liveValidation.errors.map((error) => `live seed: ${error}`))
  }

  if (resolveAppointmentPublicationPreviewMode() !== "live") {
    errors.push("publication preview must default to live in smoke environment")
  }

  if (isAppointmentPublicationDraftPreviewEnabled()) {
    errors.push("publication draft preview must be OFF by default")
  }

  const workspaceDir = mkdtempSync(join(tmpdir(), "appointment-publication-parity-"))

  try {
    const livePath = resolveAppointmentLiveDocumentPath(slug, workspaceDir)
    mkdirSync(dirname(livePath), { recursive: true })
    writeFileSync(livePath, `${JSON.stringify(liveSeed, null, 2)}\n`, "utf8")

    const initResult = initAppointmentDraft({
      slug,
      rootDir: workspaceDir,
      force: true,
    })

    const draftPath = resolveAppointmentDraftDocumentPath(slug, workspaceDir)

    if (!existsSync(draftPath)) {
      errors.push("draft-init did not create draft document")
    }

    const draft = readAppointmentRuntimeDocument(draftPath)
    const draftValidation = validateAppointmentDraftBundle(draft, slug)

    if (!draftValidation.ok) {
      errors.push(...draftValidation.errors.map((error) => `draft-init: ${error}`))
    }

    if (draft.meta.publication?.derivedFrom !== "live") {
      errors.push("draft-init must mark derivedFrom=live when copied from live")
    }

    const invalidDraft = structuredClone(draft)
    invalidDraft.meta.publication = {
      publicationState: "live",
      draftUpdatedAt: new Date().toISOString(),
    }

    const invalidValidation = validateAppointmentDraftBundle(invalidDraft, slug)

    if (invalidValidation.ok) {
      errors.push("validate must reject draft with publicationState=live")
    }

    const liveBeforePromote = readFileSync(livePath, "utf8")
    const dryRunResult = promoteAppointmentDraft({
      slug,
      rootDir: workspaceDir,
      dryRun: true,
    })

    if (dryRunResult.validationErrors.length > 0) {
      errors.push(...dryRunResult.validationErrors.map((error) => `promote dry-run: ${error}`))
    }

    const liveAfterDryRun = readFileSync(livePath, "utf8")

    if (liveBeforePromote !== liveAfterDryRun) {
      errors.push("promote dry-run must not mutate live document")
    }

    if (!dryRunResult.backupPath) {
      errors.push("promote dry-run must resolve backup path when live exists")
    }

    draft.operational = {
      ...draft.operational,
      liveState: "PROMOTED-DRAFT-MARKER",
    }
    writeFileSync(draftPath, `${JSON.stringify(draft, null, 2)}\n`, "utf8")

    const backupsBeforeExecute = listAppointmentLiveBackups(slug, workspaceDir).length

    const executeResult = promoteAppointmentDraft({
      slug,
      rootDir: workspaceDir,
      dryRun: false,
    })

    if (executeResult.validationErrors.length > 0) {
      errors.push(...executeResult.validationErrors.map((error) => `promote execute: ${error}`))
    }

    const backupsAfterExecute = listAppointmentLiveBackups(slug, workspaceDir).length

    if (backupsAfterExecute <= backupsBeforeExecute) {
      errors.push("promote execute must create a live backup")
    }

    const promotedLive = readAppointmentRuntimeDocument(livePath)
    const promotedLiveValidation = validateAppointmentLiveBundle(promotedLive, slug)

    if (!promotedLiveValidation.ok) {
      errors.push(...promotedLiveValidation.errors.map((error) => `promoted live: ${error}`))
    }

    if (promotedLive.meta.publication) {
      errors.push("promoted live must strip meta.publication draft fields")
    }

    const promotedMarker = promotedLive.operational.liveState
    const backupTimestamp = executeResult.backupPath
      ? listAppointmentLiveBackups(slug, workspaceDir)[0]?.timestamp
      : null

    if (!backupTimestamp) {
      errors.push("promote execute must expose backup timestamp for rollback")
    } else {
      const rollbackDryRun = rollbackAppointmentLive({
        slug,
        rootDir: workspaceDir,
        to: backupTimestamp,
        dryRun: true,
      })

      if (!rollbackDryRun.backupPath) {
        errors.push("rollback dry-run must resolve backup by timestamp")
      }

      rollbackAppointmentLive({
        slug,
        rootDir: workspaceDir,
        to: backupTimestamp,
        dryRun: false,
      })

      const restoredLive = readAppointmentRuntimeDocument(livePath)

      if (restoredLive.operational.liveState !== liveSeed.operational.liveState) {
        errors.push("rollback execute must restore pre-promote live content")
      }

      if (restoredLive.operational.liveState === promotedMarker && promotedMarker !== liveSeed.operational.liveState) {
        errors.push("rollback execute must undo promote marker change")
      }
    }

    const previewDraft = structuredClone(draft)
    previewDraft.operational = {
      ...previewDraft.operational,
      liveState: "PREVIEW-DRAFT-MARKER",
    }
    writeFileSync(draftPath, `${JSON.stringify(previewDraft, null, 2)}\n`, "utf8")

    const loadedDraftPreview = loadAppointmentRuntimeDraftFromDisk(slug, workspaceDir)

    if (!loadedDraftPreview) {
      errors.push("draft preview loader must read draft document from disk")
    } else if (loadedDraftPreview.operational.liveState !== "PREVIEW-DRAFT-MARKER") {
      errors.push("draft preview loader must surface draft operational content")
    }

    if (loadedDraftPreview?.meta.publication) {
      errors.push("draft preview loader must strip meta.publication from runtime bundle")
    }

    const previousPreviewEnv = process.env.APPOINTMENT_PUBLICATION_PREVIEW
    process.env.APPOINTMENT_PUBLICATION_PREVIEW = "draft"

    if (resolveAppointmentPublicationPreviewMode() !== "draft") {
      errors.push("preview env APPOINTMENT_PUBLICATION_PREVIEW=draft must resolve to draft mode")
    }

    if (previousPreviewEnv === undefined) {
      delete process.env.APPOINTMENT_PUBLICATION_PREVIEW
    } else {
      process.env.APPOINTMENT_PUBLICATION_PREVIEW = previousPreviewEnv
    }

    if (resolveAppointmentPublicationPreviewMode() !== "live") {
      errors.push("preview env unset must default to live mode")
    }

    return {
      ok: errors.length === 0,
      errors,
      snapshot: {
        slug,
        liveValid: liveValidation.ok,
        draftInitPath: initResult.draftPath.replace(workspaceDir, "<tmp>"),
        derivedFrom: initResult.derivedFrom,
        previewDefault: resolveAppointmentPublicationPreviewMode(),
        dryRunBackupResolved: Boolean(dryRunResult.backupPath),
        backupCount: backupsAfterExecute,
      },
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
    return {
      ok: false,
      errors,
      snapshot: {},
    }
  } finally {
    rmSync(workspaceDir, { recursive: true, force: true })
  }
}

export function runAppointmentPublicationPathParityChecks(rootDir: string = process.cwd()) {
  const errors: string[] = []
  const slug = APPOINTMENT_PILOT_SLUG
  const livePath = resolveAppointmentLiveDocumentPath(slug, rootDir)

  if (!existsSync(livePath)) {
    errors.push(`committed live document missing: ${livePath}`)
  } else {
    const live = readAppointmentRuntimeDocument(livePath)
    const liveValidation = validateAppointmentLiveBundle(live, slug)

    if (!liveValidation.ok) {
      errors.push(...liveValidation.errors.map((error) => `committed live: ${error}`))
    }
  }

  const draftPath = resolveAppointmentDraftDocumentPath(slug, rootDir)

  if (existsSync(draftPath)) {
    const draft = readAppointmentRuntimeDocument(draftPath)
    const draftValidation = validateAppointmentDraftBundle(draft, slug)

    if (!draftValidation.ok) {
      errors.push(...draftValidation.errors.map((error) => `local draft: ${error}`))
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    snapshot: {
      livePath,
      draftPresent: existsSync(draftPath),
    },
  }
}
