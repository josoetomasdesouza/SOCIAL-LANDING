import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { buildAppointmentRuntimeSeedBundle } from "../../lib/runtime/appointment/mock-adapter"
import { APPOINTMENT_PILOT_SLUG } from "../../lib/runtime/appointment/types"

const slug = APPOINTMENT_PILOT_SLUG
const outputPath = join(process.cwd(), "data/runtime/appointment/barba-negra.v1.json")
const bundle = buildAppointmentRuntimeSeedBundle({ slug })

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8")

console.log(`Wrote ${outputPath}`)
console.log(
  JSON.stringify({
    slug: bundle.meta.slug,
    source: bundle.meta.source,
    professionals: bundle.professionals.length,
    services: bundle.services.length,
    stories: bundle.feed.stories.length,
  })
)
