/**
 * Default passive listeners — DEV logging only.
 */

import { subscribeToEvents } from "./event-bus"
import type { SocialLandingEvent } from "./event-types"

let devLoggerUnsubscribe: (() => void) | null = null

export function isDevEventLoggingEnabled(): boolean {
  return process.env.NODE_ENV === "development"
}

function formatDevEventLog(event: SocialLandingEvent): string {
  const trace = event.traceId ? ` trace=${event.traceId}` : ""
  return `[passive-event] ${event.type} @ ${event.timestamp} src=${event.source}${trace}`
}

export function registerDevEventLogger(): () => void {
  if (!isDevEventLoggingEnabled()) {
    return () => undefined
  }

  if (devLoggerUnsubscribe) {
    return devLoggerUnsubscribe
  }

  devLoggerUnsubscribe = subscribeToEvents((event) => {
    console.debug(formatDevEventLog(event), event.payload)
  })

  return devLoggerUnsubscribe
}

export function unregisterDevEventLogger(): void {
  devLoggerUnsubscribe?.()
  devLoggerUnsubscribe = null
}

/** Idempotent — safe to call from client providers */
export function ensureDevEventLoggerRegistered(): void {
  if (typeof window === "undefined") {
    return
  }
  registerDevEventLogger()
}
