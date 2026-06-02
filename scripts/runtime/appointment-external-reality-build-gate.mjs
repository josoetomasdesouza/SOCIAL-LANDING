import { spawnSync } from "node:child_process"

function run(label, env) {
  console.log(`\n--- ${label} ---`)
  const result = spawnSync("pnpm", ["build"], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      ...env,
    },
  })

  if (result.status !== 0) {
    console.error(`FAIL ${label}`)
    process.exit(result.status ?? 1)
  }

  console.log(`PASS ${label}`)
}

run("runtime build", {
  NEXT_PUBLIC_APPOINTMENT_RUNTIME: "runtime",
})

run("runtime + external overlay build", {
  NEXT_PUBLIC_APPOINTMENT_RUNTIME: "runtime",
  NEXT_PUBLIC_APPOINTMENT_EXTERNAL_REALITY: "1",
})
