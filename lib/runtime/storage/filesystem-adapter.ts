import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs"
import { dirname } from "node:path"

import {
  backupFilenameToKey,
  listRuntimeBackupKeys,
  resolveStorageKeyPath,
} from "./keys"
import type {
  FileSystemStorageAdapterOptions,
  RuntimeStorageAdapter,
  StorageBackupResult,
  StorageDeleteResult,
  StorageReadResult,
  StorageWriteOptions,
  StorageWriteResult,
} from "./types"

function serializeJson(data: unknown): string {
  return `${JSON.stringify(data, null, 2)}\n`
}

export class FileSystemStorageAdapter implements RuntimeStorageAdapter {
  readonly storageRoot: string

  constructor(options: FileSystemStorageAdapterOptions) {
    this.storageRoot = options.storageRoot
  }

  resolvePath(key: string): string {
    const path = resolveStorageKeyPath(key, this.storageRoot)

    if (!path) {
      throw new Error(`Unknown storage key: ${key}`)
    }

    return path
  }

  exists(key: string): boolean {
    try {
      return existsSync(this.resolvePath(key))
    } catch {
      return false
    }
  }

  readJson<T>(key: string): StorageReadResult<T> {
    const path = this.resolvePath(key)

    try {
      if (!existsSync(path)) {
        return {
          ok: false,
          data: null,
          key,
          path,
          error: "not-found",
        }
      }

      const raw = readFileSync(path, "utf8")
      return {
        ok: true,
        data: JSON.parse(raw) as T,
        key,
        path,
      }
    } catch (error) {
      return {
        ok: false,
        data: null,
        key,
        path,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  writeJson<T>(key: string, data: T, options: StorageWriteOptions = {}): StorageWriteResult {
    const path = this.resolvePath(key)
    const dryRun = options.dryRun ?? false
    const atomic = options.atomic ?? true
    let backupKey = options.backupKey
    let backupPath: string | undefined

    if (options.backup && this.exists(key)) {
      if (!backupKey) {
        throw new Error(`backupKey is required when backup=true for ${key}`)
      }

      const backupResult = this.backup(key, backupKey)

      if (!backupResult.ok) {
        return {
          ok: false,
          key,
          path,
          dryRun,
          error: `backup failed for ${key}`,
        }
      }

      backupPath = backupResult.backupPath
    }

    if (dryRun) {
      return {
        ok: true,
        key,
        path,
        dryRun: true,
        backupKey,
        backupPath,
      }
    }

    mkdirSync(dirname(path), { recursive: true })

    if (atomic) {
      const tempPath = `${path}.storage.tmp`
      writeFileSync(tempPath, serializeJson(data), "utf8")
      renameSync(tempPath, path)
    } else {
      writeFileSync(path, serializeJson(data), "utf8")
    }

    return {
      ok: true,
      key,
      path,
      dryRun: false,
      backupKey,
      backupPath,
    }
  }

  delete(key: string): StorageDeleteResult {
    const path = this.resolvePath(key)

    if (!existsSync(path)) {
      return {
        ok: true,
        key,
        path,
        deleted: false,
      }
    }

    unlinkSync(path)

    return {
      ok: true,
      key,
      path,
      deleted: true,
    }
  }

  list(prefix: string): string[] {
    const normalized = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix
    const backupPrefixMatch = /^runtime\/([^/]+)\/backup$/.exec(normalized)

    if (backupPrefixMatch) {
      return listRuntimeBackupKeys(backupPrefixMatch[1], this.storageRoot)
    }

    if (this.exists(normalized)) {
      return [normalized]
    }

    return []
  }

  backup(sourceKey: string, backupKey: string): StorageBackupResult {
    const sourcePath = this.resolvePath(sourceKey)
    const backupPath = this.resolvePath(backupKey)

    if (!existsSync(sourcePath)) {
      return {
        ok: false,
        sourceKey,
        backupKey,
        sourcePath,
        backupPath,
      }
    }

    mkdirSync(dirname(backupPath), { recursive: true })
    copyFileSync(sourcePath, backupPath)

    return {
      ok: true,
      sourceKey,
      backupKey,
      sourcePath,
      backupPath,
    }
  }

  restore(
    backupKey: string,
    targetKey: string,
    options: Pick<StorageWriteOptions, "dryRun"> = {}
  ): StorageWriteResult {
    const backupPath = this.resolvePath(backupKey)
    const targetPath = this.resolvePath(targetKey)
    const dryRun = options.dryRun ?? false

    if (!existsSync(backupPath)) {
      return {
        ok: false,
        key: targetKey,
        path: targetPath,
        dryRun,
        error: `backup not found: ${backupKey}`,
      }
    }

    if (dryRun) {
      return {
        ok: true,
        key: targetKey,
        path: targetPath,
        dryRun: true,
        backupKey,
        backupPath,
      }
    }

    const tempPath = `${targetPath}.restore.tmp`
    mkdirSync(dirname(targetPath), { recursive: true })
    copyFileSync(backupPath, tempPath)
    renameSync(tempPath, targetPath)

    return {
      ok: true,
      key: targetKey,
      path: targetPath,
      dryRun: false,
      backupKey,
      backupPath,
    }
  }
}

export function listBackupKeysForSlug(adapter: FileSystemStorageAdapter, slug: string): string[] {
  return listRuntimeBackupKeys(slug, adapter.storageRoot)
}

export function resolveBackupKeyFromFilename(filename: string): string | null {
  return backupFilenameToKey(filename)
}
