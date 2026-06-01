import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { loadAppointmentRuntimeFromRuntimeStore } from "../load"
import { APPOINTMENT_PILOT_SLUG } from "../types"
import { resolveAppointmentExternalRealityEnabled } from "./apply-runtime-overlay"
import { applyExternalRealityRuntimeOverlay } from "./apply-runtime-overlay.server"
import { mapGooglePlacesDetailsToExternalRealitySnapshot } from "./google-places-map"
import { preservedEditorialFieldsMatch } from "./merge-into-bundle"
import {
  readExternalRealityFileCache,
  writeExternalRealityFileCache,
} from "./snapshot-cache"
import type { ExternalRealitySyncReport } from "./sync-report"
import { resolveExternalRealitySyncReportPath } from "./sync-report"
import type { ExternalRealitySnapshot } from "./types"

function writeSyncReport(report: ExternalRealitySyncReport, rootDir: string) {
  writeFileSync(
    resolveExternalRealitySyncReportPath(report.slug, rootDir),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8"
  )
}

function loadFixtureSnapshot(): ExternalRealitySnapshot {
  const fixturePath = join(
    process.cwd(),
    "lib/runtime/appointment/external-reality/fixtures/google-places-barba-negra.json"
  )
  const payload = JSON.parse(readFileSync(fixturePath, "utf8"))

  return mapGooglePlacesDetailsToExternalRealitySnapshot(
    "ChIJ-fixture-barba-negra",
    payload,
    new Date().toISOString()
  )
}

export function runExternalRealityOverlayParityChecks() {
  const errors: string[] = []
  const base = loadAppointmentRuntimeFromRuntimeStore(APPOINTMENT_PILOT_SLUG)
  const previousExternalEnv = process.env.NEXT_PUBLIC_APPOINTMENT_EXTERNAL_REALITY
  delete process.env.NEXT_PUBLIC_APPOINTMENT_EXTERNAL_REALITY

  if (resolveAppointmentExternalRealityEnabled()) {
    errors.push("external reality overlay must default to env off")
  }

  const envOffOverlay = applyExternalRealityRuntimeOverlay(base, APPOINTMENT_PILOT_SLUG)

  if (JSON.stringify(envOffOverlay) !== JSON.stringify(base)) {
    errors.push("env off must leave runtime bundle unchanged")
  }

  if (envOffOverlay.meta.external) {
    errors.push("env off must not set meta.external")
  }

  const tempDir = mkdtempSync(join(tmpdir(), "ws16a-overlay-"))

  try {
    process.env.NEXT_PUBLIC_APPOINTMENT_EXTERNAL_REALITY = "1"

    const missingSnapshotOverlay = applyExternalRealityRuntimeOverlay(base, APPOINTMENT_PILOT_SLUG, {
      rootDir: tempDir,
    })

    if (JSON.stringify(missingSnapshotOverlay) !== JSON.stringify(base)) {
      errors.push("missing snapshot must noop when env on")
    }

    const snapshot = loadFixtureSnapshot()
    writeExternalRealityFileCache(APPOINTMENT_PILOT_SLUG, snapshot, tempDir)
    writeSyncReport(
      {
        slug: APPOINTMENT_PILOT_SLUG,
        placeId: snapshot.placeId,
        status: "fallback",
        reason: "missing-api-key",
        syncedAt: snapshot.fetchedAt,
      },
      tempDir
    )

    const fallbackOverlay = applyExternalRealityRuntimeOverlay(base, APPOINTMENT_PILOT_SLUG, {
      rootDir: tempDir,
    })

    if (fallbackOverlay.establishment.contact.address !== base.establishment.contact.address) {
      errors.push("fallback sync report must noop perceptivo on runtime fields")
    }

    if (fallbackOverlay.meta.external?.status !== "fallback") {
      errors.push("fallback sync report must set meta.external.status=fallback")
    }

    writeSyncReport(
      {
        slug: APPOINTMENT_PILOT_SLUG,
        placeId: snapshot.placeId,
        status: "live",
        syncedAt: snapshot.fetchedAt,
        snapshotPath: readExternalRealityFileCache(APPOINTMENT_PILOT_SLUG, tempDir)
          ? "present"
          : undefined,
      },
      tempDir
    )

    const liveOverlay = applyExternalRealityRuntimeOverlay(base, APPOINTMENT_PILOT_SLUG, {
      rootDir: tempDir,
    })

    if (!preservedEditorialFieldsMatch(base, liveOverlay)) {
      errors.push("live overlay must preserve editorial grammar fields")
    }

    if (liveOverlay.operational.placeHint !== base.operational.placeHint) {
      errors.push("live overlay must preserve operational.placeHint")
    }

    if (liveOverlay.arrival.drawerTitle !== base.arrival.drawerTitle) {
      errors.push("live overlay must preserve arrival.drawerTitle")
    }

    if (liveOverlay.establishment.contact.address !== snapshot.place.formattedAddress) {
      errors.push("live overlay must enrich establishment.contact.address")
    }

    if (liveOverlay.meta.external?.status !== "live") {
      errors.push("live overlay must set meta.external.status=live")
    }

    const staleSnapshot: ExternalRealitySnapshot = {
      ...snapshot,
      fetchedAt: "2020-01-01T12:00:00.000Z",
    }
    writeExternalRealityFileCache(APPOINTMENT_PILOT_SLUG, staleSnapshot, tempDir)
    writeSyncReport(
      {
        slug: APPOINTMENT_PILOT_SLUG,
        placeId: staleSnapshot.placeId,
        status: "live",
        syncedAt: staleSnapshot.fetchedAt,
      },
      tempDir
    )

    const staleOverlay = applyExternalRealityRuntimeOverlay(base, APPOINTMENT_PILOT_SLUG, {
      rootDir: tempDir,
    })

    if (staleOverlay.establishment.contact.address !== base.establishment.contact.address) {
      errors.push("stale snapshot must noop perceptivo on runtime fields")
    }

    if (staleOverlay.meta.external?.status !== "stale") {
      errors.push("stale snapshot must set meta.external.status=stale")
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true })

    if (previousExternalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_APPOINTMENT_EXTERNAL_REALITY
    } else {
      process.env.NEXT_PUBLIC_APPOINTMENT_EXTERNAL_REALITY = previousExternalEnv
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    snapshot: {
      envDefault: "off",
      livePlaceHint: base.operational.placeHint,
    },
  }
}
