import { buildAppointmentRuntimeBundleFromMock } from "./mock-adapter"
import { getAppointmentRuntimeSeedDocument, hasAppointmentRuntimeSeed } from "./runtime-store"
import type { AppointmentRuntimeBundle } from "./types"
import { APPOINTMENT_PILOT_SLUG } from "./types"
import { assertAppointmentRuntimeBundle } from "./validate"
import { resolveAppointmentRuntimeMode } from "./load"

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

export function loadAppointmentRuntimeForFeed(
  slug: string = APPOINTMENT_PILOT_SLUG
): AppointmentRuntimeBundle {
  const mode = resolveAppointmentRuntimeMode()

  if (mode === "runtime") {
    const bundle = loadAppointmentRuntimeLiveFromRuntimeStore(slug)

    assertAppointmentRuntimeBundle(bundle, slug)
    return bundle
  }

  const bundle = buildAppointmentRuntimeBundleFromMock({
    slug,
    source: "mock-fallback",
  })

  assertAppointmentRuntimeBundle(bundle, slug)
  return bundle
}
