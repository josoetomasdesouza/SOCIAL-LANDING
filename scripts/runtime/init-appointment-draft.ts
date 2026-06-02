import { APPOINTMENT_PILOT_SLUG } from "../../lib/runtime/appointment/types"
import { initAppointmentDraft } from "../../lib/runtime/appointment/publication/draft-init"

function hasFlag(flag: string) {
  return process.argv.includes(flag)
}

function readArg(prefix: string) {
  const match = process.argv.find((arg) => arg.startsWith(`${prefix}=`))
  return match?.slice(prefix.length + 1)
}

function main() {
  const slug = readArg("--slug") ?? APPOINTMENT_PILOT_SLUG
  const fromMock = hasFlag("--from-mock")
  const force = hasFlag("--force")

  const result = initAppointmentDraft({
    slug,
    fromMock,
    force,
  })

  console.log(
    JSON.stringify(
      {
        status: "ok",
        draftPath: result.draftPath,
        slug: result.slug,
        derivedFrom: result.derivedFrom,
      },
      null,
      2
    )
  )
}

main()
