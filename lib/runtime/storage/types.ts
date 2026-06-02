export type StorageBackendId = "filesystem"

export interface StorageReadResult<T> {
  ok: boolean
  data: T | null
  key: string
  path: string
  error?: string
}

export interface StorageWriteResult {
  ok: boolean
  key: string
  path: string
  dryRun: boolean
  backupKey?: string
  backupPath?: string
  error?: string
}

export interface StorageWriteOptions {
  dryRun?: boolean
  backup?: boolean
  backupKey?: string
  atomic?: boolean
}

export interface StorageDeleteResult {
  ok: boolean
  key: string
  path: string
  deleted: boolean
}

export interface StorageBackupResult {
  ok: boolean
  sourceKey: string
  backupKey: string
  sourcePath: string
  backupPath: string
}

export interface FileSystemStorageAdapterOptions {
  storageRoot: string
}

export interface RuntimeStorageAdapter {
  exists(key: string): boolean
  readJson<T>(key: string): StorageReadResult<T>
  writeJson<T>(key: string, data: T, options?: StorageWriteOptions): StorageWriteResult
  delete(key: string): StorageDeleteResult
  list(prefix: string): string[]
  resolvePath(key: string): string
  backup(sourceKey: string, backupKey: string): StorageBackupResult
  restore(backupKey: string, targetKey: string, options?: Pick<StorageWriteOptions, "dryRun">): StorageWriteResult
}
