import { FileSystemStorageAdapter } from "./filesystem-adapter"
import { resolveAppointmentStorageRoot } from "./keys"

const adapterCache = new Map<string, FileSystemStorageAdapter>()

export function getFilesystemStorage(rootDir: string = process.cwd()): FileSystemStorageAdapter {
  const storageRoot = resolveAppointmentStorageRoot(rootDir)
  const cached = adapterCache.get(storageRoot)

  if (cached) {
    return cached
  }

  const adapter = new FileSystemStorageAdapter({ storageRoot })
  adapterCache.set(storageRoot, adapter)
  return adapter
}

export function createFilesystemStorage(storageRoot: string): FileSystemStorageAdapter {
  return new FileSystemStorageAdapter({ storageRoot })
}

export function clearFilesystemStorageCache() {
  adapterCache.clear()
}
