import { buildAppointmentRuntimeBundleFromMock } from "./mock-adapter"
import { resolveAppointmentExternalRealityEnabled } from "./external-reality/apply-runtime-overlay"
import { isAppointmentPublicationDraftPreviewEnabled } from "./publication/preview"
import { getAppointmentRuntimeSeedDocument, hasAppointmentRuntimeSeed } from "./runtime-store"
import type { AppointmentRuntimeBundle, AppointmentRuntimeMode } from "./types"
import { APPOINTMENT_PILOT_SLUG } from "./types"
import { assertAppointmentRuntimeBundle } from "./validate"

export { resolveAppointmentExternalRealityEnabled } from "./external-reality/apply-runtime-overlay"
export {
  isAppointmentPublicationDraftPreviewEnabled,
  resolveAppointmentPublicationPreviewMode,
} from "./publication/preview"

function applyExternalRealityOverlayIfEnabled(
  bundle: AppointmentRuntimeBundle,
  slug: string
): AppointmentRuntimeBundle {
  if (!resolveAppointmentExternalRealityEnabled()) {
    return bundle
  }

  if (typeof window !== "undefined") {
    return bundle
  }

  const { applyExternalRealityRuntimeOverlay } =
    require("./external-reality/apply-runtime-overlay.server") as typeof import("./external-reality/apply-runtime-overlay.server")

  return applyExternalRealityRuntimeOverlay(bundle, slug)
}

function loadAppointmentRuntimeLiveFromRuntimeStore(
  slug: string = APPOINTMENT_PILOT_SLUG
): AppointmentRuntimeBundle {
  if (!hasAppointmentRuntimeSeed(slug)) {
    throw new Error(`Unknown appointment runtime seed: ${slug}`)
  }

  const document = getAppointmentRuntimeSeedDocument(slug)

  if (!document) {
    throw new Error(`Missing appointment runtime seed document: ${slug}`)
  }

  return {
    ...structuredClone(document),
    meta: {
      ...document.meta,
      source: "runtime",
      slug,
    },
  }
}

function loadAppointmentRuntimeDraftPreviewIfEnabled(
  slug: string = APPOINTMENT_PILOT_SLUG
): AppointmentRuntimeBundle | null {
  if (!isAppointmentPublicationDraftPreviewEnabled()) {
    return null
  }

  if (typeof window !== "undefined") {
    return null
  }

  const { loadAppointmentRuntimeDraftFromDisk } =
    require("./publication/load-draft.server") as typeof import("./publication/load-draft.server")

  return loadAppointmentRuntimeDraftFromDisk(slug)
}

export function resolveAppointmentRuntimeMode(): AppointmentRuntimeMode {
  const raw = process.env.NEXT_PUBLIC_APPOINTMENT_RUNTIME?.trim().toLowerCase()

  if (raw === "runtime") {
    return "runtime"
  }

  return "mock"
}

export function loadAppointmentRuntimeFromMock(
  slug: string = APPOINTMENT_PILOT_SLUG
): AppointmentRuntimeBundle {
  const bundle = buildAppointmentRuntimeBundleFromMock({
    slug,
    source: "mock-fallback",
  })

  assertAppointmentRuntimeBundle(bundle, slug)
  return bundle
}

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

export function getAppointmentRuntimeReadiness() {
  return {
    mode: resolveAppointmentRuntimeMode(),
    pilotSlug: APPOINTMENT_PILOT_SLUG,
    runtimeJsonReady: hasAppointmentRuntimeSeed(APPOINTMENT_PILOT_SLUG),
    uiWired: true,
    externalRealityOverlayEnabled: resolveAppointmentExternalRealityEnabled(),
    publicationPreviewMode: isAppointmentPublicationDraftPreviewEnabled() ? "draft" : "live",
  }
}
