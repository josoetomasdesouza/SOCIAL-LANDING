/**
 * Surface cement prototype captures.
 *
 * Usage:
 *   pnpm dev
 *   node scripts/visual/product-surface-cement-capture.mjs
 */
import { execSync } from "node:child_process"
import { cp, mkdir, unlink, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { chromium } from "playwright"

const OUT = join(process.cwd(), "docs/audit/product-surface-cement")
const VIEWPORT = { width: 390, height: 844 }
const BASE_PATH = "/demo?composer-layout=v2"

const PROTOTYPE_FILES = [
  "app/globals.css",
  "app/demo/page.tsx",
  "components/business/business-social-landing.tsx",
  "components/business/business-feed-drawer.tsx",
  "lib/ui/surface-cement.ts",
]

function buildUrl(surfaceCement) {
  const params = new URLSearchParams({
    "composer-layout": "v2",
  })
  if (surfaceCement) {
    params.set("surface-cement", "on")
  } else {
    params.set("surface-cement", "off")
  }
  return `http://localhost:3000/demo?${params.toString()}`
}

async function dismissDebugChrome(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[aria-label="Toggle passive event debug panel"]').forEach((node) => {
      node.remove()
    })
  })
}

async function openAppointment(page, surfaceCement) {
  await page.goto(buildUrl(surfaceCement), { waitUntil: "networkidle" })
  await page.getByRole("button", { name: /agendamento/i }).click()
  await page.waitForTimeout(900)
  await dismissDebugChrome(page)
}

async function captureIdle(page, path) {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(400)
  await page.screenshot({ path, fullPage: false })
}

async function captureEngaged(page, path) {
  const input = page.locator('[data-conversation-composer="true"] input[type="text"]')
  await input.click()
  await input.fill("Vocês abrem sábado?")
  await input.press("Enter")
  await page.waitForTimeout(2400)
  await page.screenshot({ path, fullPage: false })
}

async function captureDrawerOpen(page, path) {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  const postCard = page.locator('[data-section="tutoriais-e-tendencias"] article, [data-section="videos"] article').first()
  if (await postCard.count()) {
    await postCard.click()
  } else {
    await page.locator("article").first().click()
  }
  await page.waitForTimeout(1200)
  await page.screenshot({ path, fullPage: false })
}

async function captureComposerOverFeed(page, path) {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(400)
  await page.screenshot({ path, fullPage: false })
}

async function captureSet(label, surfaceCement) {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: VIEWPORT })
  const dir = join(OUT, label)
  await mkdir(dir, { recursive: true })

  await openAppointment(page, surfaceCement)
  await captureIdle(page, join(dir, "01-idle-390.png"))
  await captureComposerOverFeed(page, join(dir, "04-composer-over-feed-390.png"))

  await openAppointment(page, surfaceCement)
  await captureEngaged(page, join(dir, "02-engaged-390.png"))

  await openAppointment(page, surfaceCement)
  await captureDrawerOpen(page, join(dir, "03-drawer-open-390.png"))

  await browser.close()
}

async function backupFiles() {
  await mkdir(join(OUT, ".backup"), { recursive: true })
  for (const file of PROTOTYPE_FILES) {
    try {
      const name = file.split("/").pop()
      await cp(file, join(OUT, ".backup", name))
    } catch {
      // optional
    }
  }
}

async function restoreFiles() {
  for (const file of PROTOTYPE_FILES) {
    const name = file.split("/").pop()
    try {
      await cp(join(OUT, ".backup", name), file)
    } catch {
      // optional
    }
  }
}

function checkoutMainFiles() {
  execSync(`git checkout main -- ${PROTOTYPE_FILES.filter((f) => f !== "lib/ui/surface-cement.ts").map((f) => `"${f}"`).join(" ")}`, {
    stdio: "inherit",
  })
}

await mkdir(OUT, { recursive: true })
await backupFiles()

try {
  console.log("Capturing BEFORE (surface-cement off)…")
  checkoutMainFiles()
  try {
    await unlink("lib/ui/surface-cement.ts")
  } catch {
    // absent on main
  }
  await new Promise((r) => setTimeout(r, 3500))
  await captureSet("before", false)

  console.log("Capturing AFTER (surface-cement on)…")
  await restoreFiles()
  await new Promise((r) => setTimeout(r, 3500))
  await captureSet("after", true)

  console.log("Building side-by-side engaged comparison page…")
  const compareHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Surface cement — before/after</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; background: #111; color: #eee; }
    h1 { font-size: 14px; font-weight: 600; padding: 16px 20px 8px; }
    .row { display: flex; gap: 12px; padding: 0 20px 24px; flex-wrap: wrap; }
    figure { margin: 0; }
    figcaption { font-size: 12px; opacity: 0.75; margin-bottom: 6px; }
    img { width: 390px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); }
  </style>
</head>
<body>
  <h1>Surface cement prototype — 390×844</h1>
  <div class="row">
    <figure><figcaption>Before — idle</figcaption><img src="before/01-idle-390.png" alt="before idle" /></figure>
    <figure><figcaption>After — idle</figcaption><img src="after/01-idle-390.png" alt="after idle" /></figure>
  </div>
  <div class="row">
    <figure><figcaption>Before — engaged</figcaption><img src="before/02-engaged-390.png" alt="before engaged" /></figure>
    <figure><figcaption>After — engaged</figcaption><img src="after/02-engaged-390.png" alt="after engaged" /></figure>
  </div>
  <div class="row">
    <figure><figcaption>Before — drawer</figcaption><img src="before/03-drawer-open-390.png" alt="before drawer" /></figure>
    <figure><figcaption>After — drawer</figcaption><img src="after/03-drawer-open-390.png" alt="after drawer" /></figure>
  </div>
  <div class="row">
    <figure><figcaption>Before — composer over feed</figcaption><img src="before/04-composer-over-feed-390.png" alt="before composer" /></figure>
    <figure><figcaption>After — composer over feed</figcaption><img src="after/04-composer-over-feed-390.png" alt="after composer" /></figure>
  </div>
</body>
</html>`
  await writeFile(join(OUT, "compare.html"), compareHtml)

  await writeFile(
    join(OUT, "manifest.json"),
    JSON.stringify(
      {
        viewport: VIEWPORT,
        flag: "surface-cement=on|off",
        url: BASE_PATH,
        captures: ["01-idle", "02-engaged", "03-drawer-open", "04-composer-over-feed"],
      },
      null,
      2
    )
  )
} finally {
  await restoreFiles()
}

console.log(`Captures saved to ${OUT}`)
console.log(`Open ${join(OUT, "compare.html")} for side-by-side review.`)
