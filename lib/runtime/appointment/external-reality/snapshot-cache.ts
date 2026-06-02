import type { ExternalRealitySnapshot } from "./types"
import { buildExternalSnapshotKey } from "../../storage/keys"
import { getFilesystemStorage } from "../../storage/resolve-storage.server"

interface MemoryCacheEntry {
  snapshot: ExternalRealitySnapshot
  expiresAt: number
}

const memoryCache = new Map<string, MemoryCacheEntry>()

export function readExternalRealityMemoryCache(
  placeId: string,
  now: number = Date.now()
): ExternalRealitySnapshot | null {
  const entry = memoryCache.get(placeId)

  if (!entry) {
    return null
  }

  if (entry.expiresAt <= now) {
    memoryCache.delete(placeId)
    return null
  }

  return entry.snapshot
}

export function writeExternalRealityMemoryCache(
  placeId: string,
  snapshot: ExternalRealitySnapshot,
  ttlMs: number,
  now: number = Date.now()
) {
  memoryCache.set(placeId, {
    snapshot,
    expiresAt: now + ttlMs,
  })
}

export function clearExternalRealityMemoryCache(placeId?: string) {
  if (placeId) {
    memoryCache.delete(placeId)
    return
  }

  memoryCache.clear()
}

export function resolveExternalRealitySnapshotCachePath(
  slug: string,
  rootDir: string = process.cwd()
): string {
  return getFilesystemStorage(rootDir).resolvePath(buildExternalSnapshotKey(slug))
}

export function readExternalRealityFileCache(
  slug: string,
  rootDir: string = process.cwd()
): ExternalRealitySnapshot | null {
  const result = getFilesystemStorage(rootDir).readJson<ExternalRealitySnapshot>(
    buildExternalSnapshotKey(slug)
  )

  return result.ok ? result.data : null
}

export function writeExternalRealityFileCache(
  slug: string,
  snapshot: ExternalRealitySnapshot,
  rootDir: string = process.cwd()
) {
  const writeResult = getFilesystemStorage(rootDir).writeJson(buildExternalSnapshotKey(slug), snapshot)

  if (!writeResult.ok) {
    throw new Error(`Failed to write external reality snapshot for slug: ${slug}`)
  }

  return writeResult.path
}
