import { readFileSync } from "node:fs"
import { join } from "node:path"

import { getAppointmentRuntimeSeedDocument } from "../runtime-store"
import type { AppointmentRuntimeBundle } from "../types"
import { APPOINTMENT_PILOT_SLUG } from "../types"
import {
  resolveAppointmentExternalPlaceId,
  resolveGooglePlacesApiKey,
} from "./google-places-config"
import { fetchGooglePlacesPlaceDetails } from "./google-places-client"
import {
  mapGooglePlacesDetailsToExternalRealitySnapshot,
  type GooglePlacesPlaceDetailsPayload,
} from "./google-places-map"
import { mergeExternalRealityIntoBundle } from "./merge-into-bundle"
import {
  resolveExternalRealityMergedPreviewPath,
  writeExternalRealityMergedPreview,
} from "./merged-preview"
import {
  resolveExternalRealitySnapshotCachePath,
  writeExternalRealityFileCache,
} from "./snapshot-cache"
import type { ExternalRealitySyncReport } from "./sync-report"
import { writeExternalRealitySyncReport } from "./sync-report"
import type { ExternalRealitySnapshot } from "./types"
import { validateExternalRealitySnapshot } from "./validate"

export const EXTERNAL_REALITY_GOOGLE_FIXTURE_RELATIVE_PATH =
  "lib/runtime/appointment/external-reality/fixtures/google-places-barba-negra.json"

export type { ExternalRealitySyncReport } from "./sync-report"
export { resolveExternalRealityMergedPreviewPath } from "./merged-preview"

export interface SyncExternalRealityOptions {
  slug?: string
  placeId?: string
  apiKey?: string
  rootDir?: string
  mergePreview?: boolean
  useFixture?: boolean
  fixturePath?: string
  fetchImpl?: typeof fetch
}

function writeSyncReport(report: ExternalRealitySyncReport, rootDir: string) {
  return writeExternalRealitySyncReport(report, rootDir)
}

function loadRuntimeStoreBase(slug: string): AppointmentRuntimeBundle {
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

function loadFixtureSnapshot(
  placeId: string,
  fixturePath: string,
  syncedAt: string
): ExternalRealitySnapshot | null {
  const payload = JSON.parse(readFileSync(fixturePath, "utf8")) as GooglePlacesPlaceDetailsPayload
  const snapshot = mapGooglePlacesDetailsToExternalRealitySnapshot(placeId, payload, syncedAt)
  const validation = validateExternalRealitySnapshot(snapshot)

  if (!validation.ok) {
    return null
  }

  return snapshot
}

function writeMergedPreview(
  slug: string,
  snapshot: ExternalRealitySnapshot,
  rootDir: string
) {
  const base = loadRuntimeStoreBase(slug)
  const merged = mergeExternalRealityIntoBundle(base, snapshot, {
    status: "live",
    syncedAt: snapshot.fetchedAt,
  })

  return writeExternalRealityMergedPreview(slug, merged, rootDir)
}

export async function syncExternalReality(
  options: SyncExternalRealityOptions = {}
): Promise<ExternalRealitySyncReport> {
  const slug = options.slug ?? APPOINTMENT_PILOT_SLUG
  const rootDir = options.rootDir ?? process.cwd()
  let placeId = resolveAppointmentExternalPlaceId(options.placeId) ?? ""

  if (!placeId && options.useFixture) {
    placeId = "ChIJ-fixture-barba-negra"
  }
  const syncedAt = new Date().toISOString()

  const baseReport: ExternalRealitySyncReport = {
    slug,
    placeId,
    status: "fallback",
    syncedAt,
  }

  if (!placeId) {
    const report = {
      ...baseReport,
      reason: "missing-place-id",
    }
    writeSyncReport(report, rootDir)
    return report
  }

  if (options.useFixture) {
    const fixturePath =
      options.fixturePath ??
      join(process.cwd(), EXTERNAL_REALITY_GOOGLE_FIXTURE_RELATIVE_PATH)
    const snapshot = loadFixtureSnapshot(placeId, fixturePath, syncedAt)

    if (!snapshot) {
      const report = {
        ...baseReport,
        reason: "validation-failed",
        detail: "fixture snapshot invalid",
        source: "fixture" as const,
      }
      writeSyncReport(report, rootDir)
      return report
    }

    writeExternalRealityFileCache(slug, snapshot, rootDir)
    const snapshotPath = resolveExternalRealitySnapshotCachePath(slug, rootDir)
    let previewPath: string | undefined

    if (options.mergePreview) {
      previewPath = writeMergedPreview(slug, snapshot, rootDir)
    }

    const report: ExternalRealitySyncReport = {
      slug,
      placeId,
      status: "live",
      source: "fixture",
      syncedAt,
      snapshotPath,
      previewPath,
    }
    writeSyncReport(report, rootDir)
    return report
  }

  const apiKey = resolveGooglePlacesApiKey(options.apiKey)

  if (!apiKey) {
    const report = {
      ...baseReport,
      reason: "missing-api-key",
    }
    writeSyncReport(report, rootDir)
    return report
  }

  const fetchResult = await fetchGooglePlacesPlaceDetails({
    placeId,
    apiKey,
    fetchedAt: syncedAt,
    fetchImpl: options.fetchImpl,
  })

  if (fetchResult.status === "fallback") {
    const report: ExternalRealitySyncReport = {
      slug,
      placeId,
      status: "fallback",
      reason: fetchResult.reason,
      detail: fetchResult.detail,
      source: "api",
      syncedAt,
    }
    writeSyncReport(report, rootDir)
    return report
  }

  writeExternalRealityFileCache(slug, fetchResult.snapshot, rootDir)
  const snapshotPath = resolveExternalRealitySnapshotCachePath(slug, rootDir)
  let previewPath: string | undefined

  if (options.mergePreview) {
    previewPath = writeMergedPreview(slug, fetchResult.snapshot, rootDir)
  }

  const report: ExternalRealitySyncReport = {
    slug,
    placeId,
    status: "live",
    source: "api",
    syncedAt,
    snapshotPath,
    previewPath,
  }
  writeSyncReport(report, rootDir)
  return report
}
