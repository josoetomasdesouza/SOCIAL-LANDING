import { existsSync } from "node:fs"

import { readAppointmentRuntimeDocument } from "../../lib/runtime/appointment/publication/load-document"
import { resolveAppointmentDraftDocumentPath, resolveAppointmentLiveDocumentPath } from "../../lib/runtime/appointment/publication/paths"
import {
  validateAppointmentDraftBundle,
  validateAppointmentLiveBundle,
} from "../../lib/runtime/appointment/publication/validate-draft"
import { APPOINTMENT_PILOT_SLUG } from "../../lib/runtime/appointment/types"

function readArg(prefix: string) {
  const match = process.argv.find((arg) => arg.startsWith(`${prefix}=`))
  return match?.slice(prefix.length + 1)
}

function main() {
  const slug = readArg("--slug") ?? APPOINTMENT_PILOT_SLUG
  const livePath = resolveAppointmentLiveDocumentPath(slug)
  const draftPath = resolveAppointmentDraftDocumentPath(slug)
  const results: Array<{ target: string; ok: boolean; errors: string[] }> = []

  if (!existsSync(livePath)) {
    console.error(`FAIL live document missing: ${livePath}`)
    process.exit(1)
  }

  const live = readAppointmentRuntimeDocument(livePath)
  const liveValidation = validateAppointmentLiveBundle(live, slug)
  results.push({
    target: "live",
    ok: liveValidation.ok,
    errors: liveValidation.errors,
  })

  if (!existsSync(draftPath)) {
    console.log(
      JSON.stringify(
        {
          status: liveValidation.ok ? "ok" : "fail",
          slug,
          results,
          draft: {
            present: false,
            skipped: true,
          },
        },
        null,
        2
      )
    )
    process.exit(liveValidation.ok ? 0 : 1)
  }

  const draft = readAppointmentRuntimeDocument(draftPath)
  const draftValidation = validateAppointmentDraftBundle(draft, slug)
  results.push({
    target: "draft",
    ok: draftValidation.ok,
    errors: draftValidation.errors,
  })

  const ok = results.every((result) => result.ok)

  console.log(
    JSON.stringify(
      {
        status: ok ? "ok" : "fail",
        slug,
        results,
        draft: {
          present: true,
          path: draftPath,
        },
      },
      null,
      2
    )
  )

  if (!ok) {
    process.exit(1)
  }
}

main()
