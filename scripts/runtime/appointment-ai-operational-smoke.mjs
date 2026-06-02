import { spawnSync } from "node:child_process"

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

run("pnpm", ["typecheck"])
run("npx", ["--yes", "tsx", "scripts/runtime/appointment-ai-operational-smoke.ts"])
