/**
 * Burned-cement surface pilot — opt-in texture for feed canvas + drawer test.
 *
 * Production intensity: Medium (baked into CSS — no query param required).
 *
 * Activation:
 *   /demo?surface-cement=on
 *   localStorage.setItem("sl-surface-cement", "on"); location.reload()
 *   NEXT_PUBLIC_SURFACE_CEMENT=on
 *
 * Dev-only intensity override (exploration, not rollout):
 *   /demo?surface-cement=on&surface-cement-intensity=soft|strong
 *
 * Rollback:
 *   /demo?surface-cement=off
 *   localStorage.removeItem("sl-surface-cement")
 */

export const SURFACE_CEMENT_OVERRIDE_STORAGE_KEY = "sl-surface-cement"
export const SURFACE_CEMENT_OVERRIDE_QUERY_KEY = "surface-cement"
export const SURFACE_CEMENT_INTENSITY_QUERY_KEY = "surface-cement-intensity"

/** Dev-only alternates; runtime default is Medium via CSS without any attribute. */
export type SurfaceCementDevIntensity = "soft" | "strong"

function normalizeSurfaceCementFlag(value: string | null | undefined): boolean | null {
  if (!value) {
    return null
  }

  if (value === "off" || value === "0" || value === "false") {
    return false
  }

  if (value === "on" || value === "1" || value === "true" || value === "cement") {
    return true
  }

  return null
}

function readOverrideFromEnv(): boolean | null {
  const value = process.env.NEXT_PUBLIC_SURFACE_CEMENT
  if (!value) {
    return null
  }

  return normalizeSurfaceCementFlag(value)
}

function readOverrideFromQuery(): boolean | null {
  if (typeof window === "undefined") {
    return null
  }

  const value = new URLSearchParams(window.location.search).get(SURFACE_CEMENT_OVERRIDE_QUERY_KEY)
  if (value === null) {
    return null
  }

  return normalizeSurfaceCementFlag(value)
}

function readOverrideFromStorage(): boolean | null {
  if (typeof window === "undefined") {
    return null
  }

  return normalizeSurfaceCementFlag(window.localStorage.getItem(SURFACE_CEMENT_OVERRIDE_STORAGE_KEY))
}

/** env → query → localStorage → off (default). */
export function isSurfaceCementActive(): boolean {
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

  return false
}

/**
 * Dev-only: returns soft/strong when explicitly requested in the URL.
 * Medium is the production default and does not set a data attribute.
 */
export function resolveSurfaceCementDevIntensity(): SurfaceCementDevIntensity | null {
  if (typeof window === "undefined" || !isSurfaceCementActive()) {
    return null
  }

  const value = new URLSearchParams(window.location.search)
    .get(SURFACE_CEMENT_INTENSITY_QUERY_KEY)
    ?.toLowerCase()

  if (value === "soft" || value === "a") {
    return "soft"
  }
  if (value === "strong" || value === "c" || value === "hard") {
    return "strong"
  }

  return null
}

export function syncSurfaceCementOverrideFromUrl() {
  if (typeof window === "undefined") {
    return
  }

  const mode = new URLSearchParams(window.location.search).get(SURFACE_CEMENT_OVERRIDE_QUERY_KEY)
  if (mode === null) {
    return
  }

  const normalized = normalizeSurfaceCementFlag(mode)
  if (normalized === true) {
    window.localStorage.setItem(SURFACE_CEMENT_OVERRIDE_STORAGE_KEY, "on")
  } else if (normalized === false) {
    window.localStorage.setItem(SURFACE_CEMENT_OVERRIDE_STORAGE_KEY, "off")
  }
}
