import { runOperationalAiParityChecks } from "../../lib/runtime/appointment/operational-ai/parity"

async function main() {
  const result = await runOperationalAiParityChecks()

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
  console.log("PASS appointment operational ai draft write round-trip")
  console.log("PASS appointment operational ai parser envelope")
  if (result.snapshot.llmProviderSkipped) {
    console.log("SKIP appointment operational ai llm provider — env not configured")
  } else {
    console.log("PASS appointment operational ai llm provider opt-in")
  }
  console.log(JSON.stringify(result.snapshot))
}

void main()
