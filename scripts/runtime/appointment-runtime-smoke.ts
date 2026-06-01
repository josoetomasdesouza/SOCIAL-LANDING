import { runAppointmentRuntimeParityChecks } from "../../lib/runtime/appointment/parity-checks"
import { runAppointmentRuntimeStoreParityChecks } from "../../lib/runtime/appointment/runtime-parity"
import {
  loadAppointmentRuntime,
  resolveAppointmentRuntimeMode,
} from "../../lib/runtime/appointment/load"
import { APPOINTMENT_PILOT_SLUG } from "../../lib/runtime/appointment/types"

const adapterResult = runAppointmentRuntimeParityChecks()

if (!adapterResult.ok) {
  console.error("FAIL appointment runtime adapter parity")
  for (const error of adapterResult.errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log("PASS appointment runtime adapter parity")
console.log(JSON.stringify(adapterResult.snapshot))

const runtimeResult = runAppointmentRuntimeStoreParityChecks()

if (!runtimeResult.ok) {
  console.error("FAIL appointment runtime store parity")
  for (const error of runtimeResult.errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log("PASS appointment runtime store parity")
console.log(JSON.stringify(runtimeResult.snapshot))

const previousMode = process.env.NEXT_PUBLIC_APPOINTMENT_RUNTIME
process.env.NEXT_PUBLIC_APPOINTMENT_RUNTIME = "runtime"

if (resolveAppointmentRuntimeMode() !== "runtime") {
  console.error("FAIL appointment runtime mode resolution")
  process.exit(1)
}

const runtimeModeBundle = loadAppointmentRuntime(APPOINTMENT_PILOT_SLUG)

if (runtimeModeBundle.meta.source !== "runtime") {
  console.error("FAIL appointment runtime mode load — expected meta.source=runtime")
  process.exit(1)
}

if (previousMode === undefined) {
  delete process.env.NEXT_PUBLIC_APPOINTMENT_RUNTIME
} else {
  process.env.NEXT_PUBLIC_APPOINTMENT_RUNTIME = previousMode
}

console.log("PASS appointment runtime mode env load")
console.log(
  JSON.stringify({
    slug: runtimeModeBundle.meta.slug,
    source: runtimeModeBundle.meta.source,
  })
)
