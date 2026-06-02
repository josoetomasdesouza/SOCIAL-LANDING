import { runOperationalAiParityChecks } from "../../lib/runtime/appointment/operational-ai/parity"

function main() {
  const result = runOperationalAiParityChecks()

  if (!result.ok) {
    console.error("FAIL appointment operational ai parity")
    for (const error of result.errors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  console.log("PASS appointment operational ai fixture primitives")
  console.log("PASS appointment operational ai id preservation")
  console.log("PASS appointment operational ai drift rejection")
  console.log(JSON.stringify(result.snapshot))
}

main()
