import { join } from "node:path"

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
  return join(rootDir, "data/runtime/appointment/external", `${slug}.sync-report.json`)
}
