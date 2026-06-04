/**
 * Composer layout version — WS-21 hybrid pilot plumbing (R0).
 *
 * v1 (default): current expansive sheet runtime — zero change when flag absent.
 * v2 (pilot):   thread in-flow + sticky compact shell — wired in R1+ only.
 *
 * Activation (Appointment /demo pilot surface):
 *   /demo?composer-layout=v2
 *   localStorage.setItem("sl-composer-layout", "v2"); location.reload()
 *   NEXT_PUBLIC_COMPOSER_LAYOUT=v2
 *
 * Rollback:
 *   localStorage.setItem("sl-composer-layout", "v1"); location.reload()
 *   or remove query + localStorage key
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

function readOverrideFromStorage(): ComposerLayoutVersion | null {
  if (typeof window === "undefined") {
    return null
  }

  return normalizeLayoutVersion(window.localStorage.getItem(COMPOSER_LAYOUT_OVERRIDE_STORAGE_KEY))
}

/** Resolve active layout — env → query → localStorage → v1 default. */
export function resolveComposerLayoutVersion(): ComposerLayoutVersion {
  const envOverride = readOverrideFromEnv()
  if (envOverride !== null) {
    return envOverride
  }

  const queryOverride = readOverrideFromQuery()
  if (queryOverride !== null) {
    return queryOverride
  }

  const storageOverride = readOverrideFromStorage()
  if (storageOverride !== null) {
    return storageOverride
  }

  return DEFAULT_COMPOSER_LAYOUT_VERSION
}

/** Persist query override for /demo pilot — mirrors composer-smoke sync. */
export function syncComposerLayoutOverrideFromUrl() {
  if (typeof window === "undefined") {
    return
  }

  const mode = new URLSearchParams(window.location.search).get(COMPOSER_LAYOUT_OVERRIDE_QUERY_KEY)
  if (mode === "v1" || mode === "v2") {
    window.localStorage.setItem(COMPOSER_LAYOUT_OVERRIDE_STORAGE_KEY, mode)
  }
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
