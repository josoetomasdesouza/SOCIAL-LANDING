/**
 * WS-21C — engaged perceptual prototype captures (Appointment + composer-layout=v2).
 *
 * Usage:
 *   pnpm dev --port 3003
 *   node scripts/visual/ws21c-engaged-perceptual-capture.mjs
 */
import { execSync } from "node:child_process"
import { cp, mkdir, writeFile } from "node:fs/promises"
import { basename, join } from "node:path"
import { chromium } from "playwright"

const BASE = process.env.WS21C_BASE_URL ?? "http://localhost:3000/demo?composer-layout=v2"
const OUT = join(process.cwd(), ".review/ws21c-engaged-prototype")
const VIEWPORT = { width: 390, height: 844 }

const PROTOTYPE_FILES = [
  "components/business/conversation-selection-context.tsx",
  "components/business/conversational-ai.tsx",
  "components/business/appointment/appointment-operational-hero.tsx",
  "components/business/business-social-landing.tsx",
  "lib/ui/composer-surface-material.ts",
]

async function openAppointment(page) {
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: /agendamento/i }).click()
  await page.waitForTimeout(900)
}

async function captureIdle(page, path) {
  await openAppointment(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(500)
  await page.screenshot({ path, fullPage: false })
}

async function captureEngaged(page, path) {
  await openAppointment(page)
  await page.evaluate(() => {
    document.querySelectorAll('[aria-label="Toggle passive event debug panel"]').forEach((node) => {
      node.remove()
    })
  })
  const input = page.locator('[data-conversation-composer="true"] input[type="text"]')
  await input.click()
  await input.fill("Vocês abrem sábado?")
  await input.press("Enter")
  await page.waitForTimeout(2400)
  await page.screenshot({ path, fullPage: false })
}

async function captureSet(label) {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: VIEWPORT })
  const dir = join(OUT, label)
  await mkdir(dir, { recursive: true })
  await captureIdle(page, join(dir, "idle-390.png"))
  await captureEngaged(page, join(dir, "engaged-390.png"))
  await browser.close()
}

function checkoutFiles(ref) {
  execSync(`git checkout ${ref} -- ${PROTOTYPE_FILES.map((f) => `"${f}"`).join(" ")}`, {
    stdio: "inherit",
    cwd: process.cwd(),
  })
}

async function backupPrototypeFiles() {
  const backups = []
  for (const file of PROTOTYPE_FILES) {
    const backupPath = join(OUT, ".backup", basename(file))
    await mkdir(join(OUT, ".backup"), { recursive: true })
    await cp(file, backupPath)
    backups.push({ file, backupPath })
  }
  return backups
}

async function restorePrototypeFiles(backups) {
  for (const { file, backupPath } of backups) {
    await cp(backupPath, file)
  }
}

console.log("WS-21C capture — waiting for dev server…")
await mkdir(OUT, { recursive: true })
const backups = await backupPrototypeFiles()

try {
  console.log("Capturing BEFORE (main baseline)…")
  checkoutFiles("main")
  await new Promise((r) => setTimeout(r, 3500))
  await captureSet("before")

  console.log("Capturing AFTER (prototype)…")
  await restorePrototypeFiles(backups)
  await new Promise((r) => setTimeout(r, 3500))
  await captureSet("after")
} finally {
  await restorePrototypeFiles(backups)
}

await writeFile(
  join(OUT, "manifest.json"),
  JSON.stringify(
    {
      viewport: VIEWPORT,
      url: BASE,
      capturedAt: new Date().toISOString(),
      files: PROTOTYPE_FILES,
    },
    null,
    2
  )
)

console.log(`Captures saved to ${OUT}`)
