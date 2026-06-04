/**
 * WS-19A Phase 1 — deterministic rule-kernel stub eval runner.
 * Entry: pnpm qa:kernel-stub
 */
import { spawnSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const core = path.join(ROOT, "scripts/convergence/ws19a-kernel-eval-runner-core.ts")

const result = spawnSync("npx", ["--yes", "tsx", core], {
  cwd: ROOT,
  stdio: "inherit",
  env: { ...process.env, FORCE_COLOR: "1" },
})

process.exit(result.status ?? 1)
