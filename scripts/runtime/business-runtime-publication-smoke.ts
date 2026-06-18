import assert from "node:assert/strict"
import { readdirSync, readFileSync, rmSync, statSync } from "node:fs"
import { join } from "node:path"

import { projectBusinessRuntimeToSocialLanding } from "@/lib/runtime/business/projections/social-landing"
import {
  createBusinessRuntimeDraft,
  loadBusinessRuntimeDraft,
  updateBusinessRuntimeDraft,
} from "@/lib/runtime/business/drafts/storage.server"
import {
  listBusinessRuntimePublications,
  loadBusinessRuntimePublication,
  publishBusinessRuntimeDraft,
  validateBusinessRuntimePublicationSlug,
} from "@/lib/runtime/business/publication"

const rootDir = join(process.cwd(), ".review/business-runtime-publication-smoke")

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
    join(process.cwd(), "lib/runtime/business/publication"),
    join(process.cwd(), "app/api/business-runtime/publications"),
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

  assert.deepEqual(validateBusinessRuntimePublicationSlug(""), ["slug is required"])
  assert.deepEqual(
    validateBusinessRuntimePublicationSlug("Invalid Slug"),
    ["slug must use lowercase letters, numbers and hyphens only"]
  )

  const created = createBusinessRuntimeDraft(
    {
      name: "Public QA",
      businessModel: "restaurant",
      description: "Draft para publicação.",
      primaryColor: "#EA580C",
    },
    {
      rootDir,
      draftId: "public-qa-draft",
      now: "2026-06-16T00:00:00.000Z",
    }
  )

  const firstPublish = publishBusinessRuntimeDraft(created.draftId, {
    rootDir,
    now: "2026-06-16T00:01:00.000Z",
  })

  assert.equal(firstPublish.publication.slug, "public-qa-draft")
  assert.equal(firstPublish.publication.runtime.status, "published")
  assert.equal(firstPublish.publication.runtime.slug, "public-qa-draft")

  const loaded = loadBusinessRuntimePublication("public-qa-draft", { rootDir })
  assert.ok(loaded, "publication must load by slug")
  assert.equal(loaded.runtime.status, "published")
  assert.equal(loadBusinessRuntimePublication("missing-publication", { rootDir }), null)

  const draftAfterPublish = loadBusinessRuntimeDraft(created.draftId, { rootDir })
  assert.ok(draftAfterPublish, "draft must keep publication metadata")
  assert.equal(draftAfterPublish.runtime.status, "draft")
  assert.equal(draftAfterPublish.publishedSlug, "public-qa-draft")
  assert.equal(draftAfterPublish.lastPublishedAt, "2026-06-16T00:01:00.000Z")
  assert.equal(draftAfterPublish.publicationVersion, 1)

  updateBusinessRuntimeDraft(
    created.draftId,
    {
      ...created.runtime,
      brand: {
        ...created.runtime.brand,
        description: "Publicado novamente.",
      },
      business: {
        ...created.runtime.business,
        description: "Publicado novamente.",
      },
      services: [
        {
          id: "service-public",
          name: "Oferta publicada",
          description: "Serviço publicado no live runtime.",
          price: 55,
        },
      ],
    },
    {
      rootDir,
      now: "2026-06-16T00:02:00.000Z",
    }
  )

  const republish = publishBusinessRuntimeDraft(created.draftId, {
    rootDir,
    now: "2026-06-16T00:03:00.000Z",
  })
  assert.equal(republish.publication.runtime.brand.description, "Publicado novamente.")
  assert.ok(republish.backupKey, "republish must create backup for previous live runtime")

  const draftAfterRepublish = loadBusinessRuntimeDraft(created.draftId, { rootDir })
  assert.ok(draftAfterRepublish, "draft must keep republish metadata")
  assert.equal(draftAfterRepublish.publishedSlug, "public-qa-draft")
  assert.equal(draftAfterRepublish.lastPublishedAt, "2026-06-16T00:03:00.000Z")
  assert.equal(draftAfterRepublish.publicationVersion, 2)

  const projection = projectBusinessRuntimeToSocialLanding(republish.publication.runtime)
  assert.equal(projection.config.name, "Public QA")
  assert.ok(
    projection.sections.some((section) =>
      section.posts?.some((post) => post.title === "Oferta publicada")
    ),
    "published runtime projection must include live service"
  )

  updateBusinessRuntimeDraft(
    created.draftId,
    {
      ...republish.publication.runtime,
      slug: "public-qa-renamed",
    },
    {
      rootDir,
      now: "2026-06-16T00:03:30.000Z",
    }
  )

  assert.throws(
    () => publishBusinessRuntimeDraft(created.draftId, { rootDir }),
    /published slug cannot be changed/
  )

  const invalidDraft = createBusinessRuntimeDraft(
    {
      name: "Invalid Slug Draft",
      businessModel: "restaurant",
    },
    {
      rootDir,
      draftId: "invalid-slug-draft",
      now: "2026-06-16T00:03:45.000Z",
    }
  )
  updateBusinessRuntimeDraft(
    invalidDraft.draftId,
    {
      ...invalidDraft.runtime,
      slug: "invalid slug",
    },
    {
      rootDir,
      now: "2026-06-16T00:03:50.000Z",
    }
  )

  assert.throws(
    () => publishBusinessRuntimeDraft(invalidDraft.draftId, { rootDir }),
    /slug must use lowercase letters, numbers and hyphens only/
  )

  const conflictDraft = createBusinessRuntimeDraft(
    {
      name: "Conflicting Draft",
      businessModel: "restaurant",
    },
    {
      rootDir,
      draftId: "conflict-draft",
      now: "2026-06-16T00:04:00.000Z",
    }
  )
  updateBusinessRuntimeDraft(
    conflictDraft.draftId,
    {
      ...conflictDraft.runtime,
      slug: "public-qa-draft",
    },
    {
      rootDir,
      now: "2026-06-16T00:05:00.000Z",
    }
  )

  assert.throws(
    () => publishBusinessRuntimeDraft(conflictDraft.draftId, { rootDir }),
    /slug already published by another draft/
  )

  const publications = listBusinessRuntimePublications({ rootDir })
  assert.equal(publications.length, 1)
  assert.equal(publications[0]?.slug, "public-qa-draft")
  assertNoForbiddenDependencies()

  cleanup()

  console.log("PASS business runtime publication flow")
  console.log(
    JSON.stringify({
      slug: republish.publication.slug,
      status: republish.publication.runtime.status,
      publications: publications.length,
      hasBackup: Boolean(republish.backupKey),
    })
  )
}

main()
