import assert from "node:assert/strict"

import { projectBusinessRuntimeToSocialLanding } from "@/lib/runtime/business/projections/social-landing"
import {
  appointmentBusinessRuntimeFixture,
  beautyBusinessRuntimeFixture,
  restaurantBusinessRuntimeFixture,
} from "@/lib/runtime/business/fixtures"

const CASES = [
  {
    name: "appointment",
    runtime: appointmentBusinessRuntimeFixture,
    expectedCta: "Agendar horário",
    expectedServiceTitle: "Serviços para agendar",
    forbiddenServiceTitle: "Cardápio em destaque",
  },
  {
    name: "beauty",
    runtime: beautyBusinessRuntimeFixture,
    expectedCta: "Reservar meu cuidado",
    expectedServiceTitle: "Cuidados e serviços",
    forbiddenServiceTitle: "Serviços para agendar",
  },
  {
    name: "restaurant",
    runtime: restaurantBusinessRuntimeFixture,
    expectedCta: "Pedir ou reservar",
    expectedServiceTitle: "Cardápio em destaque",
    forbiddenServiceTitle: "Serviços para agendar",
  },
] as const

function firstPostDescription(title: string, projection: ReturnType<typeof projectBusinessRuntimeToSocialLanding>) {
  return projection.sections.find((section) => section.title === title)?.posts?.[0]?.description ?? ""
}

function main() {
  const examples: Record<string, { cta: string; serviceSection: string; brandExcerpt: string }> = {}

  for (const item of CASES) {
    const projection = projectBusinessRuntimeToSocialLanding(item.runtime)
    const sectionTitles = projection.sections.map((section) => section.title)
    const ctaSection = projection.sections[0]
    const brandSection = projection.sections.find((section) => section.id === "brand")
    const serviceSection = projection.sections.find((section) => section.id === "services")

    assert.equal(ctaSection?.title, item.expectedCta, `${item.name} must have a vertical-specific CTA`)
    assert.equal(serviceSection?.title, item.expectedServiceTitle, `${item.name} must have a vertical-specific service section`)
    assert.equal(sectionTitles.includes(item.forbiddenServiceTitle), false, `${item.name} must not reuse the wrong vertical fallback`)
    assert.ok(brandSection?.posts?.[0]?.description, `${item.name} must include brand narrative`)
    assert.ok(serviceSection?.posts?.length, `${item.name} must include service/offering content`)
    assert.ok(
      projection.sections.some((section) => section.id === "context"),
      `${item.name} must include operational context`
    )

    examples[item.name] = {
      cta: ctaSection?.title ?? "",
      serviceSection: serviceSection?.title ?? "",
      brandExcerpt: firstPostDescription("Proposta da marca", projection).slice(0, 96),
    }
  }

  assert.notEqual(examples.appointment.cta, examples.beauty.cta)
  assert.notEqual(examples.beauty.cta, examples.restaurant.cta)
  assert.notEqual(examples.appointment.serviceSection, examples.restaurant.serviceSection)

  console.log("PASS business runtime landing quality projection")
  console.log(JSON.stringify(examples, null, 2))
}

main()
