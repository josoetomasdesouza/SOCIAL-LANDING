import assert from "node:assert/strict"
import { readdirSync, readFileSync, rmSync, statSync } from "node:fs"
import { join } from "node:path"

import {
  createBusinessRuntimeDraft,
  deleteBusinessRuntimeDraft,
  listBusinessRuntimeDrafts,
  loadBusinessRuntimeDraft,
  updateBusinessRuntimeDraft,
} from "@/lib/runtime/business/drafts/storage.server"

const rootDir = join(process.cwd(), ".review/business-runtime-drafts-smoke")

function cleanup() {
  rmSync(rootDir, { recursive: true, force: true })
}

function collectFiles(dir: string): string[] {
  const entries = readdirSync(dir)
  return entries.flatMap((entry) => {
    const path = join(dir, entry)
    const stats = statSync(path)
    return stats.isDirectory() ? collectFiles(path) : [path]
  })
}

function assertNoForbiddenDependencies() {
  const roots = [
    join(process.cwd(), "lib/runtime/business/drafts"),
    join(process.cwd(), "app/api/business-runtime"),
  ]
  const forbiddenPatterns = [
    "@/lib/db",
    "drizzle",
    "postgres",
    "identity",
    "BookingPort",
    "@/lib/integrations",
    "analytics",
  ]

  for (const file of roots.flatMap(collectFiles).filter((path) => /\.(ts|tsx)$/.test(path))) {
    const source = readFileSync(file, "utf8")
    for (const pattern of forbiddenPatterns) {
      assert.equal(
        source.includes(pattern),
        false,
        `Forbidden dependency "${pattern}" found in ${file}`
      )
    }
  }
}

function main() {
  cleanup()

  const created = createBusinessRuntimeDraft(
    {
      name: "Studio QA",
      businessModel: "beauty",
      description: "Draft QA de beleza.",
      website: "https://studioqa.example",
      primaryColor: "#D946EF",
      socialLinks: {
        instagram: "@studioqa",
        whatsapp: "5511999999999",
      },
    },
    {
      rootDir,
      draftId: "studio-qa-draft",
      now: "2026-06-16T00:00:00.000Z",
    }
  )

  assert.equal(created.draftId, "studio-qa-draft")
  assert.equal(created.runtime.status, "draft")
  assert.equal(created.runtime.vertical, "beauty")
  assert.equal(created.runtime.channels.website, "https://studioqa.example")

  const loaded = loadBusinessRuntimeDraft("studio-qa-draft", { rootDir })
  assert.ok(loaded, "draft must be loadable by id")
  assert.equal(loaded.runtime.business.name, "Studio QA")

  const updated = updateBusinessRuntimeDraft(
    "studio-qa-draft",
    {
      ...loaded.runtime,
      status: "published",
      brand: {
        ...loaded.runtime.brand,
        description: "Draft QA atualizado.",
      },
    },
    {
      rootDir,
      now: "2026-06-16T00:01:00.000Z",
    }
  )

  assert.equal(updated.runtime.status, "draft", "draft updates must stay draft")
  assert.equal(updated.runtime.brand.description, "Draft QA atualizado.")

  const listed = listBusinessRuntimeDrafts({ rootDir })
  assert.equal(listed.length, 1)
  assert.equal(listed[0]?.draftId, "studio-qa-draft")
  assert.equal(listed[0]?.status, "draft")

  const deleted = deleteBusinessRuntimeDraft("studio-qa-draft", { rootDir })
  assert.equal(deleted.deleted, true)
  assert.equal(loadBusinessRuntimeDraft("studio-qa-draft", { rootDir }), null)
  assert.equal(listBusinessRuntimeDrafts({ rootDir }).length, 0)
  assertNoForbiddenDependencies()

  cleanup()

  console.log("PASS business runtime draft storage CRUD")
  console.log(
    JSON.stringify({
      draftId: created.draftId,
      vertical: created.runtime.vertical,
      status: created.runtime.status,
      storage: "filesystem",
    })
  )
}

main()
