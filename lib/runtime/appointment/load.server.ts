import { resolveAppointmentExternalRealityEnabled } from "./external-reality/apply-runtime-overlay"
import { applyExternalRealityRuntimeOverlay } from "./external-reality/apply-runtime-overlay.server"
import {
  loadAppointmentRuntimeFromMock,
  loadAppointmentRuntimeFromRuntimeStore as loadAppointmentRuntimeLiveFromRuntimeStore,
  resolveAppointmentRuntimeMode,
} from "./load"
import { loadAppointmentRuntimeDraftFromDisk } from "./publication/load-draft.server"
import { isAppointmentPublicationDraftPreviewEnabled } from "./publication/preview"
import type { AppointmentRuntimeBundle } from "./types"
import { APPOINTMENT_PILOT_SLUG } from "./types"
import { assertAppointmentRuntimeBundle } from "./validate"

function applyExternalRealityOverlayIfEnabled(
  bundle: AppointmentRuntimeBundle,
  slug: string
): AppointmentRuntimeBundle {
  if (!resolveAppointmentExternalRealityEnabled()) {
    return bundle
  }

  return applyExternalRealityRuntimeOverlay(bundle, slug)
}

function loadAppointmentRuntimeDraftPreviewIfEnabled(
  slug: string = APPOINTMENT_PILOT_SLUG
): AppointmentRuntimeBundle | null {
  if (!isAppointmentPublicationDraftPreviewEnabled()) {
    return null
  }

  return loadAppointmentRuntimeDraftFromDisk(slug)
}

export { resolveAppointmentRuntimeMode } from "./load"

export function loadAppointmentRuntimeFromRuntimeStore(
  slug: string = APPOINTMENT_PILOT_SLUG
): AppointmentRuntimeBundle {
  const previewDraft = loadAppointmentRuntimeDraftPreviewIfEnabled(slug)
  const bundle = previewDraft ?? loadAppointmentRuntimeLiveFromRuntimeStore(slug)
  const withOverlay = applyExternalRealityOverlayIfEnabled(bundle, slug)

  assertAppointmentRuntimeBundle(withOverlay, slug)
  return withOverlay
}

export function loadAppointmentRuntime(slug: string = APPOINTMENT_PILOT_SLUG): AppointmentRuntimeBundle {
  const mode = resolveAppointmentRuntimeMode()

  if (mode === "runtime") {
    return loadAppointmentRuntimeFromRuntimeStore(slug)
  }

  return loadAppointmentRuntimeFromMock(slug)
}
