import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

import { createDraftBundleFromMock } from "../../lib/runtime/appointment/publication/draft-init"
import {
  resolveAppointmentDraftDocumentPath,
  resolveAppointmentLiveDocumentPath,
} from "../../lib/runtime/appointment/publication/paths"
import { assertAppointmentDraftBundle } from "../../lib/runtime/appointment/publication/validate-draft"
import { buildAppointmentRuntimeSeedBundle } from "../../lib/runtime/appointment/mock-adapter"
import { APPOINTMENT_PILOT_SLUG } from "../../lib/runtime/appointment/types"

function hasFlag(flag: string) {
  return process.argv.includes(flag)
}

function readArg(prefix: string) {
  const match = process.argv.find((arg) => arg.startsWith(`${prefix}=`))
  return match?.slice(prefix.length + 1)
}

function main() {
  const slug = readArg("--slug") ?? APPOINTMENT_PILOT_SLUG
  const target = readArg("--target") ?? (hasFlag("--live") ? "live" : "draft")
  const force = hasFlag("--force")

  if (target === "live") {
    const livePath = resolveAppointmentLiveDocumentPath(slug)

    if (existsSync(livePath) && !force) {
      console.error(`FAIL seed target=live — ${livePath} already exists (pass --force to overwrite live)`)
      process.exit(1)
    }

    const bundle = buildAppointmentRuntimeSeedBundle({ slug })
    mkdirSync(dirname(livePath), { recursive: true })
    writeFileSync(livePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8")

    console.log(
      JSON.stringify(
        {
          status: "ok",
          target: "live",
          path: livePath,
          slug: bundle.meta.slug,
          professionals: bundle.professionals.length,
          services: bundle.services.length,
          stories: bundle.feed.stories.length,
          note: "Explicit live overwrite — prefer default draft target for operational edits.",
        },
        null,
        2
      )
    )
    return
  }

  const draftPath = resolveAppointmentDraftDocumentPath(slug)

  if (existsSync(draftPath) && !force) {
    console.error(`FAIL seed target=draft — ${draftPath} already exists (pass --force to overwrite draft)`)
    process.exit(1)
  }

  const draft = createDraftBundleFromMock(slug)
  assertAppointmentDraftBundle(draft, slug)

  mkdirSync(dirname(draftPath), { recursive: true })
  writeFileSync(draftPath, `${JSON.stringify(draft, null, 2)}\n`, "utf8")

  console.log(
    JSON.stringify(
      {
        status: "ok",
        target: "draft",
        path: draftPath,
        slug: draft.meta.slug,
        derivedFrom: draft.meta.publication?.derivedFrom ?? "mock-adapter",
        professionals: draft.professionals.length,
        services: draft.services.length,
        stories: draft.feed.stories.length,
        note: "Default seed writes draft only — live remains committed source until promote --execute.",
      },
      null,
      2
    )
  )
}

main()
