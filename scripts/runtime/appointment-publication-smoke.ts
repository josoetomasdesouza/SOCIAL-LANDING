import {
  runAppointmentPublicationParityChecks,
  runAppointmentPublicationPathParityChecks,
} from "../../lib/runtime/appointment/publication/parity"
import { runAppointmentPublicationWiringParityChecks } from "../../lib/runtime/appointment/publication/wiring-parity"
import {
  isAppointmentPublicationDraftPreviewEnabled,
  resolveAppointmentPublicationPreviewMode,
} from "../../lib/runtime/appointment/publication/preview"

function main() {
  const pathResult = runAppointmentPublicationPathParityChecks()

  if (!pathResult.ok) {
    console.error("FAIL appointment publication committed live parity")
    for (const error of pathResult.errors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  console.log("PASS appointment publication committed live parity")
  console.log(JSON.stringify(pathResult.snapshot))

  if (resolveAppointmentPublicationPreviewMode() !== "live") {
    console.error("FAIL appointment publication preview default")
    process.exit(1)
  }

  if (isAppointmentPublicationDraftPreviewEnabled()) {
    console.error("FAIL appointment publication preview must stay OFF by default")
    process.exit(1)
  }

  console.log("PASS appointment publication preview default OFF")

  const parityResult = runAppointmentPublicationParityChecks()

  if (!parityResult.ok) {
    console.error("FAIL appointment publication parity")
    for (const error of parityResult.errors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  console.log("PASS appointment publication parity")
  console.log(JSON.stringify(parityResult.snapshot))

  const wiringResult = runAppointmentPublicationWiringParityChecks()

  if (!wiringResult.ok) {
    console.error("FAIL appointment publication wiring parity")
    for (const error of wiringResult.errors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  console.log("PASS appointment publication wiring parity")
  console.log(JSON.stringify(wiringResult.snapshot))
}

main()
