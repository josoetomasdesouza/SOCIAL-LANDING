import { readFileSync } from "node:fs"

import type { AppointmentRuntimeBundle } from "../types"
import { mergeExternalRealityIntoBundle } from "./merge-into-bundle"
import { resolveAppointmentExternalRealityEnabled } from "./apply-runtime-overlay"
import { readExternalRealityFileCache } from "./snapshot-cache"
import type { ExternalRealitySyncReport } from "./sync-report"
import { resolveExternalRealitySyncReportPath } from "./sync-report"
import type { ExternalRealitySnapshot, ExternalRealitySyncStatus } from "./types"
import { validateExternalRealitySnapshot } from "./validate"

export const EXTERNAL_REALITY_STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000

export function readExternalRealitySyncReport(
  slug: string,
  rootDir: string = process.cwd()
): ExternalRealitySyncReport | null {
  try {
    const raw = readFileSync(resolveExternalRealitySyncReportPath(slug, rootDir), "utf8")
    return JSON.parse(raw) as ExternalRealitySyncReport
  } catch {
    return null
  }
}

export function resolveExternalRealityOverlayStatus(
  snapshot: ExternalRealitySnapshot,
  syncReport: ExternalRealitySyncReport | null,
  now: number = Date.now()
): ExternalRealitySyncStatus {
  if (syncReport?.status === "fallback") {
    return "fallback"
  }

  const fetchedAt = Date.parse(snapshot.fetchedAt)

  if (Number.isFinite(fetchedAt) && now - fetchedAt > EXTERNAL_REALITY_STALE_AFTER_MS) {
    return "stale"
  }

  if (syncReport?.status === "live") {
    return "live"
  }

  return "fallback"
}

export interface ApplyExternalRealityRuntimeOverlayOptions {
  rootDir?: string
}

export function applyExternalRealityRuntimeOverlay(
  base: AppointmentRuntimeBundle,
  slug: string,
  options: ApplyExternalRealityRuntimeOverlayOptions = {}
): AppointmentRuntimeBundle {
  if (!resolveAppointmentExternalRealityEnabled()) {
    return base
  }

  const rootDir = options.rootDir ?? process.cwd()

  try {
    const snapshot = readExternalRealityFileCache(slug, rootDir)

    if (!snapshot) {
      return base
    }

    const validation = validateExternalRealitySnapshot(snapshot)

    if (!validation.ok) {
      return base
    }

    const syncReport = readExternalRealitySyncReport(slug, rootDir)
    const status = resolveExternalRealityOverlayStatus(snapshot, syncReport)

    if (status !== "live") {
      if (status === "fallback" && !syncReport) {
        return base
      }

      return mergeExternalRealityIntoBundle(base, snapshot, {
        status,
        syncedAt: syncReport?.syncedAt ?? snapshot.fetchedAt,
      })
    }

    return mergeExternalRealityIntoBundle(base, snapshot, {
      status: "live",
      syncedAt: syncReport?.syncedAt ?? snapshot.fetchedAt,
    })
  } catch {
    return base
  }
}
