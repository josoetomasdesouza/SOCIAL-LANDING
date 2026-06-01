import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { APPOINTMENT_PILOT_SLUG } from "../types"
import {
  resolveExternalRealityMergedPreviewPath,
  syncExternalReality,
} from "./sync-external-reality"
import { resolveExternalRealitySyncReportPath } from "./sync-report"
import { resolveExternalRealitySnapshotCachePath } from "./snapshot-cache"
import type { ExternalRealitySnapshot } from "./types"
import { validateExternalRealitySnapshot } from "./validate"
import {
  mapGooglePlacesDetailsToExternalRealitySnapshot,
  type GooglePlacesPlaceDetailsPayload,
} from "./google-places-map"

function createTempSyncDir() {
  return mkdtempSync(join(tmpdir(), "ws16a-sync-"))
}

export async function runExternalRealitySyncParityChecks() {
  const errors: string[] = []
  const tempDir = createTempSyncDir()

  try {
    const previousApiKey = process.env.GOOGLE_PLACES_API_KEY
    const previousPlaceId = process.env.APPOINTMENT_EXTERNAL_PLACE_ID
    delete process.env.GOOGLE_PLACES_API_KEY
    delete process.env.APPOINTMENT_EXTERNAL_PLACE_ID

    const missingKeyReport = await syncExternalReality({
      slug: APPOINTMENT_PILOT_SLUG,
      placeId: "ChIJ-fixture-barba-negra",
      rootDir: tempDir,
    })

    if (missingKeyReport.status !== "fallback" || missingKeyReport.reason !== "missing-api-key") {
      errors.push("sync without api key must fallback with missing-api-key")
    }

    const snapshotPath = resolveExternalRealitySnapshotCachePath(APPOINTMENT_PILOT_SLUG, tempDir)

    try {
      readFileSync(snapshotPath, "utf8")
      errors.push("sync fallback must not write snapshot cache")
    } catch {
      // expected
    }

    const missingPlaceReport = await syncExternalReality({
      slug: APPOINTMENT_PILOT_SLUG,
      placeId: "",
      rootDir: tempDir,
    })

    if (missingPlaceReport.status !== "fallback" || missingPlaceReport.reason !== "missing-place-id") {
      errors.push("sync without place id must fallback with missing-place-id")
    }

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

    const fixtureDir = createTempSyncDir()

    try {
      const fixtureReport = await syncExternalReality({
        slug: APPOINTMENT_PILOT_SLUG,
        placeId: "ChIJ-fixture-barba-negra",
        rootDir: fixtureDir,
        useFixture: true,
        mergePreview: true,
      })

      if (fixtureReport.status !== "live" || fixtureReport.source !== "fixture") {
        errors.push("fixture sync must produce live snapshot")
      }

      const cachedSnapshot = JSON.parse(
        readFileSync(
          resolveExternalRealitySnapshotCachePath(APPOINTMENT_PILOT_SLUG, fixtureDir),
          "utf8"
        )
      ) as ExternalRealitySnapshot

      const snapshotValidation = validateExternalRealitySnapshot(cachedSnapshot)

      if (!snapshotValidation.ok) {
        errors.push("fixture sync snapshot must validate")
      }

      if (cachedSnapshot.reviews.length !== 3) {
        errors.push("fixture sync snapshot must cap reviews at 3")
      }

      const previewPath = resolveExternalRealityMergedPreviewPath(
        APPOINTMENT_PILOT_SLUG,
        fixtureDir
      )

      try {
        readFileSync(previewPath, "utf8")
      } catch {
        errors.push("fixture sync with mergePreview must write merged preview")
      }

      const reportPath = resolveExternalRealitySyncReportPath(APPOINTMENT_PILOT_SLUG, fixtureDir)
      const report = JSON.parse(readFileSync(reportPath, "utf8")) as {
        status: string
        snapshotPath?: string
      }

      if (report.status !== "live" || !report.snapshotPath) {
        errors.push("fixture sync must write sync report with snapshotPath")
      }
    } finally {
      rmSync(fixtureDir, { recursive: true, force: true })
    }

    const mockDir = createTempSyncDir()

    try {
      const fixturePath = join(
        process.cwd(),
        "lib/runtime/appointment/external-reality/fixtures/google-places-barba-negra.json"
      )
      const payload = JSON.parse(readFileSync(fixturePath, "utf8")) as GooglePlacesPlaceDetailsPayload

      const mockFetch: typeof fetch = async () =>
        new Response(JSON.stringify(payload), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })

      const mockReport = await syncExternalReality({
        slug: APPOINTMENT_PILOT_SLUG,
        placeId: "ChIJ-fixture-barba-negra",
        apiKey: "test-key",
        rootDir: mockDir,
        fetchImpl: mockFetch,
      })

      if (mockReport.status !== "live" || mockReport.source !== "api") {
        errors.push("mock api sync must produce live snapshot")
      }

      const mapped = mapGooglePlacesDetailsToExternalRealitySnapshot(
        "ChIJ-fixture-barba-negra",
        payload,
        mockReport.syncedAt
      )

      const cached = JSON.parse(
        readFileSync(resolveExternalRealitySnapshotCachePath(APPOINTMENT_PILOT_SLUG, mockDir), "utf8")
      ) as ExternalRealitySnapshot

      if (cached.place.displayName !== mapped.place.displayName) {
        errors.push("mock api sync must persist normalized snapshot")
      }
    } finally {
      rmSync(mockDir, { recursive: true, force: true })
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }

  return {
    ok: errors.length === 0,
    errors,
    snapshot: {
      fallbackReason: "missing-api-key",
      fixtureReviewCap: 3,
    },
  }
}
