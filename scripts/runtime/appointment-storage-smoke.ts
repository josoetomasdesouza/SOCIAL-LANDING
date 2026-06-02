import { runAppointmentStorageGateChecks } from "../../lib/runtime/storage/gate"

function main() {
  const result = runAppointmentStorageGateChecks()

  if (!result.ok) {
    console.error("FAIL appointment storage gate")
    for (const error of result.errors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  console.log("PASS appointment storage core adapter parity")
  console.log("PASS appointment storage publication integration")
  console.log("PASS appointment storage external integration")
  console.log(JSON.stringify(result.snapshot))
}

main()
