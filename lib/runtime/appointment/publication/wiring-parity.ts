import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

import { getAppointmentRuntimeReadiness } from "../load"
import { loadAppointmentRuntimeFromRuntimeStore } from "../load.server"
import { getAppointmentRuntimeSeedDocument } from "../runtime-store"
import { APPOINTMENT_PILOT_SLUG } from "../types"
import { initAppointmentDraft } from "./draft-init"
import { loadAppointmentRuntimeDraftFromDisk } from "./load-draft.server"
import { resolveAppointmentDraftDocumentPath } from "./paths"
import {
  isAppointmentPublicationDraftPreviewEnabled,
  resolveAppointmentPublicationPreviewMode,
} from "./preview"

export function runAppointmentPublicationWiringParityChecks() {
  const errors: string[] = []
  const slug = APPOINTMENT_PILOT_SLUG
  const liveSeed = getAppointmentRuntimeSeedDocument(slug)

  if (!liveSeed) {
    errors.push("runtime store live seed missing for publication wiring parity")
    return { ok: false, errors, snapshot: {} }
  }

  const previousPreviewEnv = process.env.APPOINTMENT_PUBLICATION_PREVIEW

  if (resolveAppointmentPublicationPreviewMode() !== "live") {
    errors.push("publication wiring smoke must start with preview OFF")
  }

  const readinessOff = getAppointmentRuntimeReadiness()

  if (readinessOff.publicationPreviewMode !== "live") {
    errors.push("readiness must report publicationPreviewMode=live when preview OFF")
  }

  const liveBundleOff = loadAppointmentRuntimeFromRuntimeStore(slug)

  if (liveBundleOff.operational.liveState !== liveSeed.operational.liveState) {
    errors.push("preview OFF must load committed live seed content")
  }

  const draftPath = resolveAppointmentDraftDocumentPath(slug)
  let draftPrepared = existsSync(draftPath)

  if (!draftPrepared) {
    try {
      initAppointmentDraft({ slug, force: true })
      draftPrepared = existsSync(draftPath)
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
    }
  }

  if (!draftPrepared) {
    errors.push("publication wiring requires a local draft document")
  } else {
    process.env.APPOINTMENT_PUBLICATION_PREVIEW = "draft"

    if (!isAppointmentPublicationDraftPreviewEnabled()) {
      errors.push("preview env APPOINTMENT_PUBLICATION_PREVIEW=draft must enable draft preview")
    }

    const readinessOn = getAppointmentRuntimeReadiness()

    if (readinessOn.publicationPreviewMode !== "draft") {
      errors.push("readiness must report publicationPreviewMode=draft when preview ON")
    }

    const previewBundle = loadAppointmentRuntimeFromRuntimeStore(slug)
    const diskDraft = loadAppointmentRuntimeDraftFromDisk(slug)

    if (!diskDraft) {
      errors.push("draft disk loader must read local draft for preview ON comparison")
    } else if (previewBundle.operational.liveState !== diskDraft.operational.liveState) {
      errors.push("preview ON must load draft content server-side via runtime store path")
    }

    if (previewBundle.meta.publication) {
      errors.push("preview ON runtime bundle must not expose meta.publication")
    }
  }

  if (previousPreviewEnv === undefined) {
    delete process.env.APPOINTMENT_PUBLICATION_PREVIEW
  } else {
    process.env.APPOINTMENT_PUBLICATION_PREVIEW = previousPreviewEnv
  }

  const liveBundleReset = loadAppointmentRuntimeFromRuntimeStore(slug)

  if (liveBundleReset.operational.liveState !== liveSeed.operational.liveState) {
    errors.push("preview OFF after unset must restore live runtime content")
  }

  const workspaceDir = mkdtempSync(join(tmpdir(), "appointment-publication-wiring-"))

  try {
    const isolatedDraftPath = resolveAppointmentDraftDocumentPath(slug, workspaceDir)
    mkdirSync(dirname(isolatedDraftPath), { recursive: true })

    const isolatedDraft = structuredClone(liveSeed)
    isolatedDraft.meta = {
      source: "runtime",
      slug,
      updatedAt: new Date().toISOString(),
      publication: {
        publicationState: "draft",
        derivedFrom: "live",
        draftUpdatedAt: new Date().toISOString(),
      },
    }
    isolatedDraft.operational = {
      ...isolatedDraft.operational,
      liveState: "WIRING-ISOLATED-DRAFT",
    }

    writeFileSync(isolatedDraftPath, `${JSON.stringify(isolatedDraft, null, 2)}\n`, "utf8")

    const isolatedPreview = loadAppointmentRuntimeDraftFromDisk(slug, workspaceDir)

    if (isolatedPreview?.operational.liveState !== "WIRING-ISOLATED-DRAFT") {
      errors.push("isolated draft preview loader must honor workspace rootDir")
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
  } finally {
    rmSync(workspaceDir, { recursive: true, force: true })
  }

  return {
    ok: errors.length === 0,
    errors,
    snapshot: {
      slug,
      previewDefault: "live",
      draftPresent: draftPrepared,
      liveStateOff: liveBundleOff.operational.liveState,
    },
  }
}
