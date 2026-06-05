/**
 * Product S2 — envelope + floor captures.
 * Usage: pnpm dev && node scripts/visual/product-s2-envelope-capture.mjs
 */
import { execSync } from "node:child_process"
import { cp, mkdir, unlink, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { chromium } from "playwright"

const BASE = process.env.PRODUCT_S2_BASE_URL ?? "http://localhost:3000/demo?composer-layout=v2"
const OUT = join(process.cwd(), "docs/audit/product-s2-envelope-floor")
const VIEWPORT = { width: 390, height: 844 }

const MAIN_FILES = [
  "components/business/conversational-ai.tsx",
  "components/business/business-social-landing.tsx",
  "components/business/composer-feed-thread-junction.tsx",
]

const NEW_FILE = "lib/ui/conversation-room-envelope.ts"

async function openAppointment(page) {
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: /agendamento/i }).click()
  await page.waitForTimeout(900)
}

async function dismissDebugChrome(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[aria-label="Toggle passive event debug panel"]').forEach((n) => n.remove())
  })
}

async function sendFirstMessage(page) {
  const input = page.locator('[data-conversation-composer="true"] input[type="text"]')
  await input.click()
  await input.fill("Vocês abrem sábado?")
  await input.press("Enter")
  await page.waitForTimeout(2400)
}

async function backupFiles() {
  await mkdir(join(OUT, ".backup"), { recursive: true })
  for (const file of [...MAIN_FILES, NEW_FILE]) {
    try {
      await cp(file, join(OUT, ".backup", file.split("/").pop()))
    } catch {
      // new file optional
    }
  }
}

async function restoreFiles() {
  for (const file of MAIN_FILES) {
    await cp(join(OUT, ".backup", file.split("/").pop()), file)
  }
  try {
    await cp(join(OUT, ".backup", "conversation-room-envelope.ts"), NEW_FILE)
  } catch {
    // absent before
  }
}

function checkoutMain() {
  execSync(`git checkout main -- ${MAIN_FILES.map((f) => `"${f}"`).join(" ")}`, { stdio: "inherit" })
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
  await browser.close()
}

await mkdir(OUT, { recursive: true })
await backupFiles()
try {
  checkoutMain()
  try {
    await unlink(NEW_FILE)
  } catch {
    // ok
  }
  await new Promise((r) => setTimeout(r, 3500))
  await captureSet("before")
  await restoreFiles()
  await new Promise((r) => setTimeout(r, 3500))
  await captureSet("after")
} finally {
  await restoreFiles()
}
await writeFile(join(OUT, "manifest.json"), JSON.stringify({ sprint: "S2", url: BASE, viewport: VIEWPORT }, null, 2))
console.log(`S2 captures → ${OUT}`)
