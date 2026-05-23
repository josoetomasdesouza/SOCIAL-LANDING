"use client"

import { useEffect } from "react"
import { ensureDevEventLoggerRegistered } from "@/lib/events/event-listeners"

/**
 * Registers passive DEV event logging once on the client.
 * No UI. No behavior changes.
 */
export function PassiveEventProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ensureDevEventLoggerRegistered()
  }, [])

  return children
}
