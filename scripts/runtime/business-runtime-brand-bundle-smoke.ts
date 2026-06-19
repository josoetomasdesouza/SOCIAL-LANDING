import assert from "node:assert/strict"
import { rmSync } from "node:fs"
import { join } from "node:path"

import { projectBusinessRuntimeToSocialLanding } from "@/lib/runtime/business/projections/social-landing"
import {
  createBusinessRuntimeDraft,
  loadBusinessRuntimeDraft,
  updateBusinessRuntimeDraft,
} from "@/lib/runtime/business/drafts/storage.server"
import {
  loadBusinessRuntimePublication,
  publishBusinessRuntimeDraft,
} from "@/lib/runtime/business/publication"

const rootDir = join(process.cwd(), ".review/business-runtime-brand-bundle-smoke")

function cleanup() {
  rmSync(rootDir, { recursive: true, force: true })
}

function main() {
  cleanup()

  const created = createBusinessRuntimeDraft(
    {
      name: "Marca Bundle QA",
      businessModel: "beauty",
      description: "Studio de beleza natural para rotina leve.",
      website: "https://marcabundle.example",
      primaryColor: "#D946EF",
      industry: "beleza natural",
      socialLinks: {
        instagram: "@marcabundleqa",
      },
    },
    {
      rootDir,
      draftId: "marca-bundle-qa",
      now: "2026-06-17T00:00:00.000Z",
    }
  )

  assert.equal(created.runtime.brand.name, "Marca Bundle QA")
  assert.equal(created.runtime.brand.description, "Studio de beleza natural para rotina leve.")
  assert.equal(created.runtime.brand.primaryColor, "#D946EF")
  assert.ok(created.runtime.brand.positioning, "brand positioning must be generated")
  assert.ok(created.runtime.brand.toneOfVoice, "brand tone must be generated")
  assert.ok(created.runtime.brand.personality, "brand personality must be generated")
  assert.ok(created.runtime.brand.visualIdentity?.style, "visual style must be generated")
  assert.ok(created.runtime.brand.keywords?.length, "keywords must be generated")
  assert.ok(created.runtime.brand.targetAudience, "target audience must be generated")
  assert.ok(created.runtime.brand.valueProposition, "value proposition must be generated")
  assert.equal(created.runtime.brand.suggestedColors?.primary, "#D946EF")
  assert.equal(created.runtime.brand.dna?.brandName, "Marca Bundle QA")

  const edited = updateBusinessRuntimeDraft(
    created.draftId,
    {
      ...created.runtime,
      brand: {
        ...created.runtime.brand,
        positioning: "Beleza natural com atendimento próximo",
        toneOfVoice: "premium",
        personality: "cuidadosa, humana e clara",
        visualIdentity: {
          ...created.runtime.brand.visualIdentity,
          style: "social-native",
        },
        keywords: ["beleza", "natural", "rotina"],
        targetAudience: "Mulheres que valorizam cuidado natural",
        valueProposition: "Cuidado de beleza natural sem fricção.",
      },
    },
    {
      rootDir,
      now: "2026-06-17T00:01:00.000Z",
    }
  )

  const reloaded = loadBusinessRuntimeDraft(created.draftId, { rootDir })
  assert.ok(reloaded, "draft must reload")
  assert.equal(reloaded.runtime.brand.positioning, "Beleza natural com atendimento próximo")
  assert.deepEqual(reloaded.runtime.brand.keywords, ["beleza", "natural", "rotina"])

  const publication = publishBusinessRuntimeDraft(created.draftId, {
    rootDir,
    now: "2026-06-17T00:02:00.000Z",
  }).publication
  const loadedPublication = loadBusinessRuntimePublication(publication.slug, { rootDir })
  assert.ok(loadedPublication, "publication must reload")
  assert.equal(loadedPublication.runtime.brand.valueProposition, "Cuidado de beleza natural sem fricção.")
  assert.equal(loadedPublication.runtime.brand.dna?.brandName, "Marca Bundle QA")

  const projection = projectBusinessRuntimeToSocialLanding(loadedPublication.runtime)
  assert.equal(projection.config.primaryColor, "#D946EF")
  assert.ok(
    projection.sections.some((section) =>
      section.posts?.some((post) => post.description?.includes("Cuidado de beleza natural"))
    ),
    "projection must use brand bundle context"
  )

  cleanup()

  console.log("PASS business runtime brand bundle flow")
  console.log(
    JSON.stringify({
      draftId: edited.draftId,
      slug: publication.slug,
      keywords: loadedPublication.runtime.brand.keywords?.length ?? 0,
      hasDna: Boolean(loadedPublication.runtime.brand.dna),
    })
  )
}

main()
