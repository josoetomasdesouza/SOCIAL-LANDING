import { syncExternalReality } from "../../lib/runtime/appointment/external-reality/sync-external-reality"

function hasFlag(flag: string) {
  return process.argv.includes(flag)
}

async function main() {
  const mergePreview = hasFlag("--merge-preview")
  const useFixture = hasFlag("--fixture")

  const report = await syncExternalReality({
    mergePreview,
    useFixture,
  })

  console.log(JSON.stringify(report, null, 2))

  if (report.status === "fallback") {
    process.exit(0)
  }
}

main().catch((error) => {
  console.error("FAIL runtime:appointment:sync-external")
  console.error(error)
  process.exit(1)
})
