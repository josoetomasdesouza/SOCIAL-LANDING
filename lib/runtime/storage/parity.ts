import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { createFilesystemStorage } from "./resolve-storage.server"
import {
  buildExternalSnapshotKey,
  buildExternalSyncReportKey,
  buildRuntimeBackupKey,
  buildRuntimeDraftKey,
  buildRuntimeLiveKey,
  formatBackupTimestamp,
} from "./keys"

export function runFilesystemStorageParityChecks() {
  const errors: string[] = []
  const slug = "parity-slug"
  const workspaceDir = mkdtempSync(join(tmpdir(), "filesystem-storage-parity-"))

  try {
    const adapter = createFilesystemStorage(workspaceDir)
    const liveKey = buildRuntimeLiveKey(slug)
    const draftKey = buildRuntimeDraftKey(slug)
    const snapshotKey = buildExternalSnapshotKey(slug)
    const syncReportKey = buildExternalSyncReportKey(slug)
    const payload = { marker: "storage-parity", version: 1 }

    const initialWrite = adapter.writeJson(liveKey, payload)

    if (!initialWrite.ok || initialWrite.dryRun) {
      errors.push("writeJson must persist live document")
    }

    const readBack = adapter.readJson<typeof payload>(liveKey)

    if (!readBack.ok || readBack.data?.marker !== "storage-parity") {
      errors.push("readJson must round-trip live document")
    }

    const backupTimestamp = formatBackupTimestamp()
    const backupKey = buildRuntimeBackupKey(slug, backupTimestamp)
    const backupResult = adapter.backup(liveKey, backupKey)

    if (!backupResult.ok) {
      errors.push("backup must copy live to backup key")
    }

    const updatedPayload = { marker: "storage-parity-updated", version: 1 }
    const overwrite = adapter.writeJson(liveKey, updatedPayload, {
      backup: true,
      backupKey: buildRuntimeBackupKey(slug, formatBackupTimestamp(new Date(Date.now() + 1000))),
    })

    if (!overwrite.ok || !overwrite.backupPath) {
      errors.push("writeJson with backup must create backup before overwrite")
    }

    const liveBeforeRestore = adapter.readJson<{ marker: string }>(liveKey)

    if (liveBeforeRestore.data?.marker !== "storage-parity-updated") {
      errors.push("overwrite must update live content")
    }

    const restoreResult = adapter.restore(backupKey, liveKey)

    if (!restoreResult.ok) {
      errors.push("restore must copy backup to live key")
    }

    const restored = adapter.readJson<{ marker: string }>(liveKey)

    if (restored.data?.marker !== "storage-parity") {
      errors.push("restore must revert live to backup content")
    }

    const draftWrite = adapter.writeJson(draftKey, { ...payload, draft: true })

    if (!draftWrite.ok || !adapter.exists(draftKey)) {
      errors.push("draft key must be writable")
    }

    const snapshotWrite = adapter.writeJson(snapshotKey, { provider: "google-places", placeId: "test" })

    if (!snapshotWrite.ok || !adapter.exists(snapshotKey)) {
      errors.push("external snapshot key must be writable")
    }

    const syncWrite = adapter.writeJson(syncReportKey, { slug, status: "live", syncedAt: new Date().toISOString() })

    if (!syncWrite.ok || !adapter.exists(syncReportKey)) {
      errors.push("external sync-report key must be writable")
    }

    const deleteResult = adapter.delete(draftKey)

    if (!deleteResult.deleted || adapter.exists(draftKey)) {
      errors.push("delete must remove draft key")
    }

    const dryRun = adapter.writeJson(liveKey, { marker: "dry-run" }, { dryRun: true })

    if (!dryRun.ok || dryRun.dryRun !== true) {
      errors.push("dryRun must skip disk write")
    }

    const diskAfterDryRun = readFileSync(adapter.resolvePath(liveKey), "utf8")

    if (!diskAfterDryRun.includes("storage-parity")) {
      errors.push("dryRun must leave existing live document intact")
    }

    const listedBackups = adapter.list(`runtime/${slug}/backup`)

    if (listedBackups.length < 1) {
      errors.push("list must return runtime backup keys")
    }

    return {
      ok: errors.length === 0,
      errors,
      snapshot: {
        workspaceDir: workspaceDir.replace(tmpdir(), "<tmp>"),
        liveKey,
        backupCount: listedBackups.length,
      },
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
    return {
      ok: false,
      errors,
      snapshot: {},
    }
  } finally {
    rmSync(workspaceDir, { recursive: true, force: true })
  }
}
