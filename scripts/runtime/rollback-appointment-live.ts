import { APPOINTMENT_PILOT_SLUG } from "../../lib/runtime/appointment/types"
import { rollbackAppointmentLive } from "../../lib/runtime/appointment/publication/rollback"

function hasFlag(flag: string) {
  return process.argv.includes(flag)
}

function readArg(prefix: string) {
  const match = process.argv.find((arg) => arg.startsWith(`${prefix}=`))
  return match?.slice(prefix.length + 1)
}

function main() {
  const slug = readArg("--slug") ?? APPOINTMENT_PILOT_SLUG
  const to = readArg("--to")
  const dryRun = !hasFlag("--execute")

  const result = rollbackAppointmentLive({
    slug,
    to,
    dryRun,
  })

  console.log(
    JSON.stringify(
      {
        status: dryRun ? "dry-run" : "executed",
        slug: result.slug,
        livePath: result.livePath,
        backupPath: result.backupPath,
        preRollbackBackupPath: result.preRollbackBackupPath,
        note: dryRun
          ? "Etapa 1 — dry-run only. Pass --execute for real rollback (Etapa 2 gate)."
          : "Live document restored from backup.",
      },
      null,
      2
    )
  )
}

main()
