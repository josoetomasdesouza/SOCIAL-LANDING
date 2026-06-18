import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import assert from "node:assert/strict"

import {
  BUSINESS_RUNTIME_VERSION,
  type BusinessRuntime,
} from "@/lib/runtime/business"
import { projectAppointmentRuntimeToBusinessRuntime } from "@/lib/runtime/business/adapters/appointment"
import { businessRuntimeFixtures } from "@/lib/runtime/business/fixtures"
import { projectBusinessRuntimeToSocialLanding } from "@/lib/runtime/business/projections/social-landing"
import { buildAppointmentRuntimeSeedBundle } from "@/lib/runtime/appointment"

const REQUIRED_RUNTIME_KEYS = [
  "business",
  "brand",
  "services",
  "team",
  "hours",
  "location",
  "channels",
  "policies",
  "knowledge",
  "vertical",
  "slug",
  "status",
] as const

const ALLOWED_STATUSES = new Set(["draft", "published", "archived"])

function assertBusinessRuntimeShape(runtime: BusinessRuntime) {
  assert.equal(runtime.version, BUSINESS_RUNTIME_VERSION)
  assert.ok(runtime.slug, "BusinessRuntime must have slug")
  assert.ok(ALLOWED_STATUSES.has(runtime.status), `Invalid runtime status: ${runtime.status}`)

  for (const key of REQUIRED_RUNTIME_KEYS) {
    assert.ok(key in runtime, `Missing BusinessRuntime key: ${key}`)
  }

  assert.ok(runtime.business.id, "business.id is required")
  assert.ok(runtime.business.name, "business.name is required")
  assert.ok(runtime.brand.name, "brand.name is required")
  assert.ok(runtime.brand.description, "brand.description is required")
  assert.ok(runtime.brand.primaryColor, "brand.primaryColor is required")
  assert.ok(Array.isArray(runtime.services), "services must be an array")
  assert.ok(Array.isArray(runtime.team), "team must be an array")
  assert.ok(Array.isArray(runtime.knowledge.highlights), "knowledge.highlights must be an array")
}

function assertRenderableProjection(runtime: BusinessRuntime) {
  const projection = projectBusinessRuntimeToSocialLanding(runtime)

  assert.ok(projection.config.model, "projection config.model is required")
  assert.equal(projection.config.name, runtime.brand.name)
  assert.ok(projection.config.logo, "projection config.logo is required")
  assert.ok(projection.config.coverImage, "projection config.coverImage is required")
  assert.ok(projection.stories.length > 0, "projection must include stories")
  assert.ok(projection.sections.length > 0, "projection must include sections")

  for (const story of projection.stories) {
    assert.ok(story.id, "story.id is required")
    assert.ok(story.name, "story.name is required")
    assert.ok(story.image, "story.image is required")
  }
}

function collectFiles(dir: string): string[] {
  const entries = readdirSync(dir)
  return entries.flatMap((entry) => {
    const path = join(dir, entry)
    const stats = statSync(path)
    return stats.isDirectory() ? collectFiles(path) : [path]
  })
}

function assertNoEnterpriseDependencies() {
  const runtimeDir = join(process.cwd(), "lib/runtime/business")
  const files = collectFiles(runtimeDir).filter((file) => file.endsWith(".ts"))
  const forbiddenPatterns = [
    "@/lib/db",
    "drizzle",
    "postgres",
    "identity",
    "BookingPort",
    "@/lib/integrations",
    "analytics",
  ]

  for (const file of files) {
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

function assertCoreDoesNotImportAppointment() {
  const coreDir = join(process.cwd(), "lib/runtime/business/core")
  const files = collectFiles(coreDir).filter((file) => file.endsWith(".ts"))

  for (const file of files) {
    const source = readFileSync(file, "utf8")
    assert.equal(
      source.includes("@/lib/runtime/appointment") || source.includes("AppointmentRuntime"),
      false,
      `BusinessRuntime core must not import or mention Appointment: ${file}`
    )
  }
}

function assertAppointmentMappingDecisions(runtime: BusinessRuntime) {
  const decisions = new Map(
    runtime.meta.mappingNotes?.map((note) => [note.sourcePath, note.decision])
  )

  assert.equal(decisions.get("professionals.rating/reviewCount/availability"), "map-now")
  assert.equal(decisions.get("styles"), "map-now")
  assert.equal(decisions.get("arrival"), "map-now")
  assert.equal(decisions.get("operational.liveState"), "map-now")
  assert.equal(decisions.get("feed.metadata"), "map-now")
  assert.equal(decisions.get("meta.external"), "preserve-in-meta")
  assert.equal(decisions.get("meta.publication"), "preserve-in-meta")
}

function main() {
  for (const fixture of businessRuntimeFixtures) {
    assertBusinessRuntimeShape(fixture)
    assertRenderableProjection(fixture)
  }

  const appointmentBundle = buildAppointmentRuntimeSeedBundle()
  const projectedAppointment = projectAppointmentRuntimeToBusinessRuntime(appointmentBundle)

  assertBusinessRuntimeShape(projectedAppointment)
  assertRenderableProjection(projectedAppointment)
  assert.equal(projectedAppointment.slug, appointmentBundle.establishment.slug)
  assert.equal(projectedAppointment.services.length, appointmentBundle.services.length)
  assert.equal(projectedAppointment.team.length, appointmentBundle.professionals.length)
  assert.equal(projectedAppointment.meta.source, "adapter")
  assertAppointmentMappingDecisions(projectedAppointment)

  assertNoEnterpriseDependencies()
  assertCoreDoesNotImportAppointment()

  console.log("PASS business runtime shape + fixtures")
  console.log(
    JSON.stringify({
      version: BUSINESS_RUNTIME_VERSION,
      fixtureCount: businessRuntimeFixtures.length,
      verticals: businessRuntimeFixtures.map((fixture) => fixture.vertical),
      coreImportsAppointment: false,
      appointmentServices: projectedAppointment.services.length,
      appointmentTeam: projectedAppointment.team.length,
    })
  )
}

main()
