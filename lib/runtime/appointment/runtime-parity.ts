import { buildAppointmentRuntimeSeedBundle } from "./mock-adapter"
import { loadAppointmentRuntimeFromRuntimeStore } from "./load"
import {
  projectBundleToBusinessConfig,
  projectBundleToLegacyContent,
} from "./legacy-projection"
import { getAppointmentRuntimeBundleDiffErrors } from "./bundle-compare"
import { buildAppointmentRuntimeBundleFromMock } from "./mock-adapter"
import { validateAppointmentRuntimeBundle } from "./validate"
import { APPOINTMENT_PILOT_SLUG } from "./types"

export function runAppointmentRuntimeStoreParityChecks() {
  const errors: string[] = []
  const expectedSeed = buildAppointmentRuntimeSeedBundle({ slug: APPOINTMENT_PILOT_SLUG })
  const loadedRuntime = loadAppointmentRuntimeFromRuntimeStore(APPOINTMENT_PILOT_SLUG)

  errors.push(
    ...validateAppointmentRuntimeBundle(loadedRuntime, APPOINTMENT_PILOT_SLUG).errors,
    ...getAppointmentRuntimeBundleDiffErrors(
      expectedSeed,
      loadedRuntime,
      "seed-builder",
      "runtime-store"
    )
  )

  const mockBundle = buildAppointmentRuntimeBundleFromMock({ slug: APPOINTMENT_PILOT_SLUG })
  const mockProjected = projectBundleToBusinessConfig(mockBundle)
  const runtimeProjected = projectBundleToBusinessConfig(loadedRuntime)
  const mockContent = projectBundleToLegacyContent(mockBundle)
  const runtimeContent = projectBundleToLegacyContent(loadedRuntime)

  if (mockProjected.name !== runtimeProjected.name) {
    errors.push("runtime projection name mismatch vs mock adapter")
  }

  if (mockProjected.whatsapp !== runtimeProjected.whatsapp) {
    errors.push("runtime projection whatsapp mismatch vs mock adapter")
  }

  if (JSON.stringify(mockContent.stories) !== JSON.stringify(runtimeContent.stories)) {
    errors.push("runtime projection stories mismatch vs mock adapter")
  }

  if (mockContent.videos.length !== runtimeContent.videos.length) {
    errors.push("runtime projection videos count mismatch vs mock adapter")
  }

  if (loadedRuntime.meta.source !== "runtime") {
    errors.push("runtime store bundle meta.source must be runtime")
  }

  return {
    ok: errors.length === 0,
    errors,
    snapshot: {
      slug: loadedRuntime.meta.slug,
      source: loadedRuntime.meta.source,
      professionals: loadedRuntime.professionals.length,
      services: loadedRuntime.services.length,
      stories: loadedRuntime.feed.stories.length,
      feedSections: loadedRuntime.feed.sections.length,
    },
  }
}
