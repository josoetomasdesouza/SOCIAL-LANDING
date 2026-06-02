import { APPOINTMENT_PILOT_SLUG } from "../../lib/runtime/appointment/types"
import { promoteAppointmentDraft } from "../../lib/runtime/appointment/publication/promote"

function hasFlag(flag: string) {
  return process.argv.includes(flag)
}

function readArg(prefix: string) {
  const match = process.argv.find((arg) => arg.startsWith(`${prefix}=`))
  return match?.slice(prefix.length + 1)
}

function main() {
  const slug = readArg("--slug") ?? APPOINTMENT_PILOT_SLUG
  const dryRun = !hasFlag("--execute")

  const result = promoteAppointmentDraft({
    slug,
    dryRun,
  })

  if (result.validationErrors.length > 0) {
    console.error("FAIL appointment draft promote — validation errors")
    for (const error of result.validationErrors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  console.log(
    JSON.stringify(
      {
        status: dryRun ? "dry-run" : "executed",
        slug: result.slug,
        draftPath: result.draftPath,
        livePath: result.livePath,
        backupPath: result.backupPath,
        note: dryRun
          ? "Dry-run only. Pass --execute for real promote (creates backup when live exists)."
          : "Live document updated. Rebuild/restart required for runtime-store import refresh.",
      },
      null,
      2
    )
  )
}

main()
