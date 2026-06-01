import { buildAppointmentRuntimeBundleFromMock } from "./mock-adapter"
import type { AppointmentRuntimeBundle, AppointmentRuntimeMode } from "./types"
import { APPOINTMENT_PILOT_SLUG } from "./types"
import { assertAppointmentRuntimeBundle } from "./validate"

const RUNTIME_JSON_NOT_READY =
  "WS-14A Etapa 2: runtime JSON bundle load is not implemented yet. Use mock mode."

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
  void slug
  throw new Error(RUNTIME_JSON_NOT_READY)
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
    runtimeJsonReady: false,
    uiWired: false,
  }
}
