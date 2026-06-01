import { runAppointmentRuntimeParityChecks } from "../../lib/runtime/appointment/parity-checks"
import {
  EXTERNAL_REALITY_PROVIDER_GOOGLE_PLACES,
  normalizeExternalRealitySnapshot,
  validateExternalRealitySnapshot,
  validateRuntimeExternalMeta,
} from "../../lib/runtime/appointment/external-reality"
import { runAppointmentRuntimeStoreParityChecks } from "../../lib/runtime/appointment/runtime-parity"
import {
  loadAppointmentRuntime,
  resolveAppointmentRuntimeMode,
} from "../../lib/runtime/appointment/load"
import { APPOINTMENT_PILOT_SLUG } from "../../lib/runtime/appointment/types"

const externalFixture = normalizeExternalRealitySnapshot({
  provider: EXTERNAL_REALITY_PROVIDER_GOOGLE_PLACES,
  placeId: "ChIJ-smoke-fixture",
  fetchedAt: "2026-05-24T12:00:00.000Z",
  place: {
    displayName: "Barba Negra",
    formattedAddress: "Rua Augusta, Lisboa",
    googleMapsUri: "https://maps.google.com/?q=Barba+Negra",
    location: { lat: 38.7223, lng: -9.1393 },
  },
  hours: {
    openNow: true,
    weekdayDescriptions: ["Monday: 10:00 AM – 8:00 PM"],
  },
  rating: {
    average: 4.6,
    total: 128,
  },
  reviews: [
    {
      id: "review-smoke-1",
      author: "João",
      rating: 5,
      text: "Ambiente excelente.",
      relativeTime: "2 weeks ago",
    },
    {
      id: "review-smoke-2",
      author: "Maria",
      rating: 4,
      text: "Corte impecável.",
    },
    {
      id: "review-smoke-extra",
      author: "Extra",
      rating: 5,
      text: "Should be trimmed by normalize.",
    },
    {
      id: "review-smoke-overflow",
      author: "Overflow",
      rating: 5,
      text: "Should be trimmed by normalize.",
    },
  ],
})

const externalValidation = validateExternalRealitySnapshot(externalFixture)

if (!externalValidation.ok) {
  console.error("FAIL external reality snapshot schema")
  for (const error of externalValidation.errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

if (externalFixture.reviews.length !== 3) {
  console.error("FAIL external reality snapshot — reviews must normalize to max 3")
  process.exit(1)
}

const externalMetaValidation = validateRuntimeExternalMeta({
  provider: EXTERNAL_REALITY_PROVIDER_GOOGLE_PLACES,
  placeId: externalFixture.placeId,
  syncedAt: externalFixture.fetchedAt,
  status: "live",
})

if (!externalMetaValidation.ok) {
  console.error("FAIL runtime external meta schema")
  for (const error of externalMetaValidation.errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log("PASS external reality snapshot schema")
console.log(
  JSON.stringify({
    provider: externalFixture.provider,
    placeId: externalFixture.placeId,
    reviewCount: externalFixture.reviews.length,
    openNow: externalFixture.hours.openNow,
  })
)

const adapterResult = runAppointmentRuntimeParityChecks()

if (!adapterResult.ok) {
  console.error("FAIL appointment runtime adapter parity")
  for (const error of adapterResult.errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log("PASS appointment runtime adapter parity")
console.log(JSON.stringify(adapterResult.snapshot))

const runtimeResult = runAppointmentRuntimeStoreParityChecks()

if (!runtimeResult.ok) {
  console.error("FAIL appointment runtime store parity")
  for (const error of runtimeResult.errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log("PASS appointment runtime store parity")
console.log(JSON.stringify(runtimeResult.snapshot))

const previousMode = process.env.NEXT_PUBLIC_APPOINTMENT_RUNTIME
process.env.NEXT_PUBLIC_APPOINTMENT_RUNTIME = "runtime"

if (resolveAppointmentRuntimeMode() !== "runtime") {
  console.error("FAIL appointment runtime mode resolution")
  process.exit(1)
}

const runtimeModeBundle = loadAppointmentRuntime(APPOINTMENT_PILOT_SLUG)

if (runtimeModeBundle.meta.source !== "runtime") {
  console.error("FAIL appointment runtime mode load — expected meta.source=runtime")
  process.exit(1)
}

if (previousMode === undefined) {
  delete process.env.NEXT_PUBLIC_APPOINTMENT_RUNTIME
} else {
  process.env.NEXT_PUBLIC_APPOINTMENT_RUNTIME = previousMode
}

console.log("PASS appointment runtime mode env load")
console.log(
  JSON.stringify({
    slug: runtimeModeBundle.meta.slug,
    source: runtimeModeBundle.meta.source,
  })
)
