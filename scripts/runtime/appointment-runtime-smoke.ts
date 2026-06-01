import { runAppointmentRuntimeParityChecks } from "../../lib/runtime/appointment/parity-checks"

const result = runAppointmentRuntimeParityChecks()

if (!result.ok) {
  console.error("FAIL appointment runtime parity")
  for (const error of result.errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log("PASS appointment runtime adapter parity")
console.log(JSON.stringify(result.snapshot))
