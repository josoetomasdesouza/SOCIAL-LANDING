import assert from "node:assert/strict"
import { readdirSync, readFileSync, rmSync, statSync } from "node:fs"
import { join } from "node:path"

import {
  applyBusinessOperationalAiToDraft,
  collectBusinessRuntimeChangedPaths,
  validateBusinessOperationalAiOutput,
} from "@/lib/runtime/business/operational-ai"
import type {
  BusinessOperationalAiKind,
  BusinessOperationalAiPatch,
} from "@/lib/runtime/business/operational-ai"
import {
  appointmentBusinessRuntimeFixture,
  beautyBusinessRuntimeFixture,
  restaurantBusinessRuntimeFixture,
} from "@/lib/runtime/business/fixtures"
import {
  createBusinessRuntimeDraft,
  loadBusinessRuntimeDraft,
  updateBusinessRuntimeDraft,
} from "@/lib/runtime/business/drafts/storage.server"
import type { BusinessRuntime } from "@/lib/runtime/business"

const rootDir = join(process.cwd(), ".review/business-runtime-operational-ai-smoke")

const CASES: Array<{
  draftId: string
  runtime: BusinessRuntime
  kind: BusinessOperationalAiKind
  expectedPathPrefix: string
}> = [
  {
    draftId: "op-ai-appointment",
    runtime: appointmentBusinessRuntimeFixture,
    kind: "brand_voice",
    expectedPathPrefix: "brand.",
  },
  {
    draftId: "op-ai-beauty",
    runtime: beautyBusinessRuntimeFixture,
    kind: "services",
    expectedPathPrefix: "services[",
  },
  {
    draftId: "op-ai-restaurant",
    runtime: restaurantBusinessRuntimeFixture,
    kind: "operations",
    expectedPathPrefix: "policies.",
  },
]

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
    join(process.cwd(), "lib/runtime/business/operational-ai"),
    join(process.cwd(), "app/api/business-runtime/drafts"),
  ]
  const forbiddenPatterns = [
    "@/lib/db",
    "drizzle",
    "postgres",
    "identity",
    "BookingPort",
    "@/lib/integrations",
    "analytics",
    "@/lib/runtime/appointment",
    "AppointmentRuntime",
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

function seedDraft(draftId: string, runtime: BusinessRuntime) {
  const created = createBusinessRuntimeDraft(
    {
      name: runtime.business.name,
      businessModel: runtime.vertical,
      description: runtime.business.description,
      primaryColor: runtime.brand.primaryColor,
    },
    {
      rootDir,
      draftId,
      now: "2026-06-18T00:00:00.000Z",
    }
  )

  return updateBusinessRuntimeDraft(
    created.draftId,
    {
      ...runtime,
      slug: created.runtime.slug,
      status: "draft",
      meta: {
        ...runtime.meta,
        source: "manual",
        updatedAt: "2026-06-18T00:00:00.000Z",
      },
    },
    {
      rootDir,
      now: "2026-06-18T00:00:00.000Z",
    }
  )
}

function assertForbiddenPathBlocked(runtime: BusinessRuntime) {
  const invalidPatch = {
    slug: "novo-slug-proibido",
  } as BusinessOperationalAiPatch
  const invalidRuntime = {
    ...runtime,
    slug: "novo-slug-proibido",
  }
  const validation = validateBusinessOperationalAiOutput({
    baseRuntime: runtime,
    mergedRuntime: invalidRuntime,
    patch: invalidPatch,
    kind: "full_draft",
  })

  assert.equal(validation.ok, false)
  assert.ok(
    validation.errors.some((error) => error.includes("slug")),
    "slug mutation must be blocked"
  )
}

function main() {
  cleanup()

  const examples: Record<string, { kind: string; changedPaths: string[] }> = {}

  for (const item of CASES) {
    const seeded = seedDraft(item.draftId, item.runtime)
    const result = applyBusinessOperationalAiToDraft(item.draftId, {
      rootDir,
      kind: item.kind,
      operatorBrief: `QA ${item.kind}`,
      now: "2026-06-18T00:05:00.000Z",
    })
    const reloaded = loadBusinessRuntimeDraft(item.draftId, { rootDir })

    assert.ok(result.ai.validation.ok, `${item.draftId} AI validation must pass`)
    assert.ok(reloaded, `${item.draftId} must reload after AI apply`)
    assert.equal(reloaded.runtime.status, "draft")
    assert.equal(reloaded.updatedAt, "2026-06-18T00:05:00.000Z")

    const changedPaths = collectBusinessRuntimeChangedPaths(seeded.runtime, reloaded.runtime)
      .filter((path) => path !== "meta.updatedAt")
    assert.ok(
      changedPaths.some((path) => path.startsWith(item.expectedPathPrefix)),
      `${item.draftId} must change expected ${item.expectedPathPrefix} path`
    )

    examples[item.runtime.vertical] = {
      kind: item.kind,
      changedPaths,
    }
  }

  assertForbiddenPathBlocked(beautyBusinessRuntimeFixture)
  assertNoForbiddenDependencies()

  cleanup()

  console.log("PASS business runtime operational AI flow")
  console.log(JSON.stringify(examples, null, 2))
}

main()
