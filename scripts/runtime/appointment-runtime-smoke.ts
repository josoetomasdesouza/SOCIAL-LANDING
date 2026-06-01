import { readFileSync, unlinkSync } from "node:fs"
import { join } from "node:path"

import { runAppointmentRuntimeParityChecks } from "../../lib/runtime/appointment/parity-checks"
import {
  EXTERNAL_REALITY_PROVIDER_GOOGLE_PLACES,
  clearExternalRealityMemoryCache,
  fetchExternalRealitySnapshot,
  fetchGooglePlacesPlaceDetails,
  mapGooglePlacesDetailsToExternalRealitySnapshot,
  normalizeExternalRealitySnapshot,
  resolveExternalRealitySnapshotCachePath,
  validateExternalRealitySnapshot,
  validateRuntimeExternalMeta,
  writeExternalRealityFileCache,
  type GooglePlacesPlaceDetailsPayload,
} from "../../lib/runtime/appointment/external-reality"
import { runAppointmentRuntimeStoreParityChecks } from "../../lib/runtime/appointment/runtime-parity"
import {
  loadAppointmentRuntime,
  resolveAppointmentRuntimeMode,
} from "../../lib/runtime/appointment/load"
import { runExternalRealityMergeParityChecks } from "../../lib/runtime/appointment/external-reality/merge-parity"
import { runExternalRealityOverlayParityChecks } from "../../lib/runtime/appointment/external-reality/overlay-parity"
import { runExternalRealitySyncParityChecks } from "../../lib/runtime/appointment/external-reality/sync-parity"
import { APPOINTMENT_PILOT_SLUG } from "../../lib/runtime/appointment/types"

async function main() {
  const googleFixturePath = join(
    process.cwd(),
    "lib/runtime/appointment/external-reality/fixtures/google-places-barba-negra.json"
  )
  const googleFixture = JSON.parse(
    readFileSync(googleFixturePath, "utf8")
  ) as GooglePlacesPlaceDetailsPayload

  const googleMappedSnapshot = mapGooglePlacesDetailsToExternalRealitySnapshot(
    "ChIJ-fixture-barba-negra",
    googleFixture,
    "2026-05-24T12:00:00.000Z"
  )

  const googleMappedValidation = validateExternalRealitySnapshot(googleMappedSnapshot)

  if (!googleMappedValidation.ok) {
    console.error("FAIL google places map → external reality snapshot")
    for (const error of googleMappedValidation.errors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  if (googleMappedSnapshot.reviews.length !== 3) {
    console.error("FAIL google places map — reviews must cap at 3")
    process.exit(1)
  }

  if (googleMappedSnapshot.place.mapsUri !== googleFixture.googleMapsUri) {
    console.error("FAIL google places map — mapsUri not preserved")
    process.exit(1)
  }

  console.log("PASS google places map → external reality snapshot")
  console.log(
    JSON.stringify({
      placeId: googleMappedSnapshot.placeId,
      displayName: googleMappedSnapshot.place.displayName,
      reviewCount: googleMappedSnapshot.reviews.length,
      ratingAverage: googleMappedSnapshot.rating.average,
    })
  )

  const previousApiKey = process.env.GOOGLE_PLACES_API_KEY
  const previousPlaceId = process.env.APPOINTMENT_EXTERNAL_PLACE_ID
  delete process.env.GOOGLE_PLACES_API_KEY
  delete process.env.APPOINTMENT_EXTERNAL_PLACE_ID

  const missingKeyResult = await fetchExternalRealitySnapshot({
    placeId: "ChIJ-fixture-barba-negra",
  })

  if (missingKeyResult.status !== "fallback" || missingKeyResult.reason !== "missing-api-key") {
    console.error("FAIL external reality fetch — expected missing-api-key fallback")
    process.exit(1)
  }

  console.log("PASS external reality fetch missing-api-key fallback")

  const mockFetch: typeof fetch = async () =>
    new Response(JSON.stringify(googleFixture), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })

  clearExternalRealityMemoryCache("ChIJ-fixture-barba-negra")

  const liveFetchResult = await fetchGooglePlacesPlaceDetails({
    placeId: "ChIJ-fixture-barba-negra",
    apiKey: "test-key",
    fetchedAt: "2026-05-24T12:00:00.000Z",
    fetchImpl: mockFetch,
  })

  if (liveFetchResult.status !== "live") {
    console.error("FAIL google places client mock fetch")
    console.error(JSON.stringify(liveFetchResult))
    process.exit(1)
  }

  clearExternalRealityMemoryCache("ChIJ-fixture-barba-negra")

  const smokeCacheSlug = `${APPOINTMENT_PILOT_SLUG}.smoke`
  writeExternalRealityFileCache(smokeCacheSlug, googleMappedSnapshot)

  const cachedFetchResult = await fetchExternalRealitySnapshot({
    placeId: "ChIJ-fixture-barba-negra",
    apiKey: "test-key",
    slug: smokeCacheSlug,
    useFileCache: false,
    writeFileCache: false,
    fetchImpl: mockFetch,
  })

  if (cachedFetchResult.status !== "live" || cachedFetchResult.source !== "api") {
    console.error("FAIL external reality fetch mock api path")
    process.exit(1)
  }

  clearExternalRealityMemoryCache("ChIJ-fixture-barba-negra")

  const fileCacheResult = await fetchExternalRealitySnapshot({
    placeId: "ChIJ-fixture-barba-negra",
    slug: smokeCacheSlug,
    useMemoryCache: false,
    useFileCache: true,
  })

  if (fileCacheResult.status !== "live" || fileCacheResult.source !== "cache-file") {
    console.error("FAIL external reality file cache read")
    process.exit(1)
  }

  try {
    unlinkSync(resolveExternalRealitySnapshotCachePath(smokeCacheSlug))
  } catch {
    // smoke temp cache cleanup is best-effort
  }

  console.log("PASS google places client mock fetch + file cache")

  if (previousApiKey === undefined) {
    delete process.env.GOOGLE_PLACES_API_KEY
  } else {
    process.env.GOOGLE_PLACES_API_KEY = previousApiKey
  }

  if (previousPlaceId === undefined) {
    delete process.env.APPOINTMENT_EXTERNAL_PLACE_ID
  } else {
    process.env.APPOINTMENT_EXTERNAL_PLACE_ID = previousPlaceId
  }

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

  const mergeResult = runExternalRealityMergeParityChecks()

  if (!mergeResult.ok) {
    console.error("FAIL external reality merge parity")
    for (const error of mergeResult.errors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  console.log("PASS external reality merge parity")
  console.log(JSON.stringify(mergeResult.snapshot))

  const syncResult = await runExternalRealitySyncParityChecks()

  if (!syncResult.ok) {
    console.error("FAIL external reality sync parity")
    for (const error of syncResult.errors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  console.log("PASS external reality sync parity")
  console.log(JSON.stringify(syncResult.snapshot))

  const overlayResult = runExternalRealityOverlayParityChecks()

  if (!overlayResult.ok) {
    console.error("FAIL external reality overlay parity")
    for (const error of overlayResult.errors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  console.log("PASS external reality overlay parity")
  console.log(JSON.stringify(overlayResult.snapshot))

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
}

main().catch((error) => {
  console.error("FAIL appointment runtime smoke")
  console.error(error)
  process.exit(1)
})
