import assert from "node:assert/strict"
import { rmSync } from "node:fs"
import { join } from "node:path"

import { projectBusinessRuntimeToSocialLanding } from "@/lib/runtime/business/projections/social-landing"
import {
  createBusinessRuntimeDraft,
  loadBusinessRuntimeDraft,
  updateBusinessRuntimeDraft,
} from "@/lib/runtime/business/drafts/storage.server"

const rootDir = join(process.cwd(), ".review/business-runtime-editor-smoke")

function cleanup() {
  rmSync(rootDir, { recursive: true, force: true })
}

function main() {
  cleanup()

  const created = createBusinessRuntimeDraft(
    {
      name: "Editor QA",
      businessModel: "restaurant",
      description: "Draft inicial do editor.",
      primaryColor: "#EA580C",
    },
    {
      rootDir,
      draftId: "editor-qa-draft",
      now: "2026-06-16T00:00:00.000Z",
    }
  )

  const edited = updateBusinessRuntimeDraft(
    created.draftId,
    {
      ...created.runtime,
      slug: "editor-qa-slug",
      business: {
        ...created.runtime.business,
        name: "Editor QA Atualizado",
        description: "Descrição salva pelo editor.",
      },
      brand: {
        ...created.runtime.brand,
        name: "Editor QA Atualizado",
        description: "Descrição salva pelo editor.",
      },
      services: [
        {
          id: "service-1",
          name: "Prato QA",
          description: "Servico editado no editor.",
          price: 42,
        },
      ],
      hours: {
        summary: "Seg-Sex: 10h-18h",
      },
      channels: {
        whatsapp: "5511999999999",
        instagram: "@editorqa",
        website: "https://editorqa.example",
      },
      location: {
        address: "Rua QA, 123",
      },
      knowledge: {
        ...created.runtime.knowledge,
        faq: [
          {
            id: "faq-1",
            question: "Funciona após refresh?",
            answer: "Sim, o draft é recarregado do storage.",
          },
        ],
      },
    },
    {
      rootDir,
      now: "2026-06-16T00:05:00.000Z",
    }
  )

  const reloaded = loadBusinessRuntimeDraft(created.draftId, { rootDir })
  assert.ok(reloaded, "edited draft must reload by draftId")
  assert.equal(reloaded.runtime.status, "draft")
  assert.equal(reloaded.runtime.slug, "editor-qa-slug")
  assert.equal(reloaded.runtime.business.name, "Editor QA Atualizado")
  assert.equal(reloaded.runtime.services[0]?.name, "Prato QA")
  assert.equal(reloaded.runtime.hours.summary, "Seg-Sex: 10h-18h")
  assert.equal(reloaded.runtime.channels.website, "https://editorqa.example")
  assert.equal(reloaded.runtime.knowledge.faq?.[0]?.question, "Funciona após refresh?")

  const projection = projectBusinessRuntimeToSocialLanding(reloaded.runtime)
  assert.equal(projection.config.name, "Editor QA Atualizado")
  assert.equal(projection.config.description, "Descrição salva pelo editor.")
  assert.equal(projection.config.openingHours, "Seg-Sex: 10h-18h")
  assert.ok(
    projection.sections.some((section) =>
      section.posts?.some((post) => post.title === "Prato QA")
    ),
    "projection must include edited service"
  )

  cleanup()

  console.log("PASS business runtime editor draft flow")
  console.log(
    JSON.stringify({
      draftId: edited.draftId,
      slug: reloaded.runtime.slug,
      status: reloaded.runtime.status,
      projectedSections: projection.sections.length,
    })
  )
}

main()
