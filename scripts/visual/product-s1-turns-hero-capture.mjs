/**
 * Product S1 — turns + hero refinement captures.
 *
 * Usage:
 *   pnpm dev
 *   node scripts/visual/product-s1-turns-hero-capture.mjs
 */
import { execSync } from "node:child_process"
import { cp, mkdir, unlink, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { chromium } from "playwright"

const BASE = process.env.PRODUCT_S1_BASE_URL ?? "http://localhost:3000/demo?composer-layout=v2"
const OUT = join(process.cwd(), "docs/audit/product-s1-turns-hero")
const VIEWPORT = { width: 390, height: 844 }

async function openAppointment(page) {
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: /agendamento/i }).click()
  await page.waitForTimeout(900)
}

async function dismissDebugChrome(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[aria-label="Toggle passive event debug panel"]').forEach((node) => {
      node.remove()
    })
  })
}

async function sendFirstMessage(page) {
  const input = page.locator('[data-conversation-composer="true"] input[type="text"]')
  await input.click()
  await input.fill("Vocês abrem sábado?")
  await input.press("Enter")
  await page.waitForTimeout(2400)
}

const S1_FILES_ON_MAIN = [
  "components/business/appointment/appointment-operational-hero.tsx",
  "components/business/conversational-ai.tsx",
]

const S1_NEW_FILE = "lib/ui/conversation-turn-editorial.ts"

async function backupFiles() {
  await mkdir(join(OUT, ".backup"), { recursive: true })
  for (const file of [...S1_FILES_ON_MAIN, S1_NEW_FILE]) {
    try {
      const name = file.split("/").pop()
      await cp(file, join(OUT, ".backup", name))
    } catch {
      // new file may not exist in before state
    }
  }
}

async function restoreFiles() {
  for (const file of [...S1_FILES_ON_MAIN, S1_NEW_FILE]) {
    const name = file.split("/").pop()
    await cp(join(OUT, ".backup", name), file)
  }
}

function checkoutMainFiles() {
  execSync(`git checkout main -- ${S1_FILES_ON_MAIN.map((f) => `"${f}"`).join(" ")}`, {
    stdio: "inherit",
  })
}

async function captureSet(label) {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: VIEWPORT })
  const dir = join(OUT, label)
  await mkdir(dir, { recursive: true })

  await openAppointment(page)
  await dismissDebugChrome(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(dir, "idle-390.png"), fullPage: false })

  await openAppointment(page)
  await dismissDebugChrome(page)
  await sendFirstMessage(page)
  await page.screenshot({ path: join(dir, "engaged-390.png"), fullPage: false })

  await openAppointment(page)
  await dismissDebugChrome(page)
  await sendFirstMessage(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(700)
  await page.screenshot({ path: join(dir, "engaged-scroll-up-hero-390.png"), fullPage: false })

  await browser.close()
}

await mkdir(OUT, { recursive: true })
await backupFiles()

try {
  console.log("Capturing BEFORE (main @ e50778c files)…")
  checkoutMainFiles()
  try {
    await unlink(S1_NEW_FILE)
  } catch {
    // already absent
  }
  await new Promise((r) => setTimeout(r, 3500))
  await captureSet("before")

  console.log("Capturing AFTER (S1)…")
  await restoreFiles()
  await new Promise((r) => setTimeout(r, 3500))
  await captureSet("after")
} finally {
  await restoreFiles()
}

await writeFile(
  join(OUT, "manifest.json"),
  JSON.stringify({ viewport: VIEWPORT, url: BASE, sprint: "S1" }, null, 2)
)

console.log(`S1 captures saved to ${OUT}`)
