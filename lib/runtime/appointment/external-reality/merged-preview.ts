import { buildExternalMergedPreviewKey } from "../../storage/keys"
import { getFilesystemStorage } from "../../storage/resolve-storage.server"
import type { AppointmentRuntimeBundle } from "../types"

export function resolveExternalRealityMergedPreviewPath(
  slug: string,
  rootDir: string = process.cwd()
): string {
  return getFilesystemStorage(rootDir).resolvePath(buildExternalMergedPreviewKey(slug))
}

export function readExternalRealityMergedPreview(
  slug: string,
  rootDir: string = process.cwd()
): AppointmentRuntimeBundle | null {
  const result = getFilesystemStorage(rootDir).readJson<AppointmentRuntimeBundle>(
    buildExternalMergedPreviewKey(slug)
  )

  return result.ok ? result.data : null
}

export function writeExternalRealityMergedPreview(
  slug: string,
  bundle: AppointmentRuntimeBundle,
  rootDir: string = process.cwd()
): string {
  const writeResult = getFilesystemStorage(rootDir).writeJson(
    buildExternalMergedPreviewKey(slug),
    bundle
  )

  if (!writeResult.ok) {
    throw new Error(`Failed to write external reality merged preview for slug: ${slug}`)
  }

  return writeResult.path
}
