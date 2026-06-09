/**
 * Composer layout version — WS-21 hybrid pilot plumbing (R0).
 *
 * v1 (default): current expansive sheet runtime — zero change when flag absent.
 * v2 (pilot):   thread in-flow + sticky compact shell — wired in R1+ only.
 *
 * Activation (Appointment /demo pilot surface):
 *   /demo?composer-layout=v2   ← required per session (v2 is not sticky via storage)
 *   NEXT_PUBLIC_COMPOSER_LAYOUT=v2
 *
 * Rollback:
 *   /demo  or  /demo?composer-layout=v1
 *   localStorage.removeItem("sl-composer-layout")
 */

export type ComposerLayoutVersion = "v1" | "v2"

/** Production default — current runtime until WS-21 G3. */
export const DEFAULT_COMPOSER_LAYOUT_VERSION: ComposerLayoutVersion = "v1"

export const COMPOSER_LAYOUT_OVERRIDE_STORAGE_KEY = "sl-composer-layout"
export const COMPOSER_LAYOUT_OVERRIDE_QUERY_KEY = "composer-layout"

function normalizeLayoutVersion(value: string | null | undefined): ComposerLayoutVersion | null {
  if (!value || value === "false" || value === "0") {
    return null
  }

  if (value === "v1" || value === "1" || value === "legacy") {
    return "v1"
  }

  if (value === "v2" || value === "2" || value === "hybrid") {
    return "v2"
  }

  return null
}

function readOverrideFromEnv(): ComposerLayoutVersion | null {
  const value = process.env.NEXT_PUBLIC_COMPOSER_LAYOUT
  if (!value) {
    return null
  }

  return normalizeLayoutVersion(value)
}

function readOverrideFromQuery(): ComposerLayoutVersion | null {
  if (typeof window === "undefined") {
    return null
  }

  const value = new URLSearchParams(window.location.search).get(COMPOSER_LAYOUT_OVERRIDE_QUERY_KEY)
  if (value === null) {
    return null
  }

  return normalizeLayoutVersion(value)
}

/** Resolve active layout — env → query → v1 default. Storage is sync-only, not read here. */
export function resolveComposerLayoutVersion(): ComposerLayoutVersion {
  const envOverride = readOverrideFromEnv()
  if (envOverride !== null) {
    return envOverride
  }

  const queryOverride = readOverrideFromQuery()
  if (queryOverride !== null) {
    return queryOverride
  }

  return DEFAULT_COMPOSER_LAYOUT_VERSION
}

/**
 * Product default on /demo: expansive composer (v1).
 * Strips stale `?composer-layout=v2` bookmarks unless env pilot is active.
 * Clears legacy localStorage override (no longer read by resolve).
 */
export function ensureComposerLayoutProductDefault() {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(COMPOSER_LAYOUT_OVERRIDE_STORAGE_KEY)

  const envPilot = readOverrideFromEnv() === "v2"
  if (envPilot) {
    return
  }

  const params = new URLSearchParams(window.location.search)
  if (params.get(COMPOSER_LAYOUT_OVERRIDE_QUERY_KEY) !== "v2") {
    return
  }

  params.delete(COMPOSER_LAYOUT_OVERRIDE_QUERY_KEY)
  const query = params.toString()
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
  window.history.replaceState(null, "", nextUrl)
}

/** Persist query override for /demo pilot — mirrors composer-smoke sync. Not read by resolve. */
export function syncComposerLayoutOverrideFromUrl() {
  if (typeof window === "undefined") {
    return
  }

  const mode = new URLSearchParams(window.location.search).get(COMPOSER_LAYOUT_OVERRIDE_QUERY_KEY)
  if (mode === "v1" || mode === "v2") {
    window.localStorage.setItem(COMPOSER_LAYOUT_OVERRIDE_STORAGE_KEY, mode)
    return
  }

  window.localStorage.removeItem(COMPOSER_LAYOUT_OVERRIDE_STORAGE_KEY)
}

export function isComposerLayoutV2(version: ComposerLayoutVersion = resolveComposerLayoutVersion()) {
  return version === "v2"
}

/** R1 decision point — thread portals to in-flow anchor when true. No-op in R0. */
export function shouldRenderThreadInFlow(version: ComposerLayoutVersion) {
  return version === "v2"
}

/** R1 decision point — sticky shell stays compact-only when true. No-op in R0. */
export function shouldUseStickyShellCompactOnly(version: ComposerLayoutVersion) {
  return version === "v2"
}

/** Shared with `<main>` feed column in business-social-landing. */
export const COMPOSER_FEED_COLUMN_CLASS =
  "mx-auto w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-[600px]" as const

/** Horizontal inset for feed cards and dock capsule. */
export const COMPOSER_FEED_INSET_CLASS = "px-4 sm:px-5" as const
