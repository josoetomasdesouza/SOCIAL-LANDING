import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

import type { ExternalRealitySnapshot } from "./types"

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
  return join(rootDir, "data/runtime/appointment/external", `${slug}.snapshot.json`)
}

export function readExternalRealityFileCache(
  slug: string,
  rootDir: string = process.cwd()
): ExternalRealitySnapshot | null {
  const cachePath = resolveExternalRealitySnapshotCachePath(slug, rootDir)

  try {
    const raw = readFileSync(cachePath, "utf8")
    const parsed = JSON.parse(raw) as ExternalRealitySnapshot
    return parsed
  } catch {
    return null
  }
}

export function writeExternalRealityFileCache(
  slug: string,
  snapshot: ExternalRealitySnapshot,
  rootDir: string = process.cwd()
) {
  const cachePath = resolveExternalRealitySnapshotCachePath(slug, rootDir)
  mkdirSync(dirname(cachePath), { recursive: true })
  writeFileSync(cachePath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8")
}
