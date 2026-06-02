import { buildExternalSyncReportKey } from "../../storage/keys"
import { getFilesystemStorage } from "../../storage/resolve-storage.server"

export interface ExternalRealitySyncReport {
  slug: string
  placeId: string
  status: "live" | "fallback"
  reason?: string
  detail?: string
  source?: "api" | "fixture"
  syncedAt: string
  snapshotPath?: string
  previewPath?: string
}

export function resolveExternalRealitySyncReportPath(
  slug: string,
  rootDir: string = process.cwd()
) {
  return getFilesystemStorage(rootDir).resolvePath(buildExternalSyncReportKey(slug))
}

export function readExternalRealitySyncReport(
  slug: string,
  rootDir: string = process.cwd()
): ExternalRealitySyncReport | null {
  const result = getFilesystemStorage(rootDir).readJson<ExternalRealitySyncReport>(
    buildExternalSyncReportKey(slug)
  )

  return result.ok ? result.data : null
}

export function writeExternalRealitySyncReport(
  report: ExternalRealitySyncReport,
  rootDir: string = process.cwd()
) {
  const writeResult = getFilesystemStorage(rootDir).writeJson(
    buildExternalSyncReportKey(report.slug),
    report
  )

  if (!writeResult.ok) {
    throw new Error(`Failed to write external reality sync report for slug: ${report.slug}`)
  }

  return writeResult.path
}
