/**
 * Passive event bus — observational only.
 *
 * Guarantees:
 * - Synchronous emit (no await, no microtasks for side effects)
 * - Listeners cannot mutate the envelope
 * - Failures in listeners are swallowed in dev log only
 * - Does NOT replace React state or Tier 1 logic
 */

import type { EmitEventInput, SocialLandingEvent, SocialLandingEventType } from "./event-types"
import { appendToEventReplayBuffer } from "./event-replay"

export type EventListener = (event: SocialLandingEvent) => void

const listeners = new Set<EventListener>()

let emitCount = 0

export function isPassiveEventBusEnabled(): boolean {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_DISABLE_EVENT_BUS === "true") {
    return false
  }
  return true
}

export function subscribeToEvents(listener: EventListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getPassiveEventEmitCount(): number {
  return emitCount
}

export function emitPassiveEvent<T extends SocialLandingEventType>(
  input: EmitEventInput<T>
): SocialLandingEvent | null {
  if (!isPassiveEventBusEnabled()) {
    return null
  }

  const event = {
    type: input.type,
    payload: input.payload,
    timestamp: input.timestamp ?? new Date().toISOString(),
    source: input.source ?? "unknown",
    traceId: input.traceId,
  } as SocialLandingEvent

  emitCount += 1
  appendToEventReplayBuffer(event)

  for (const listener of listeners) {
    try {
      listener(event)
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[event-bus] listener error (swallowed):", error)
      }
    }
  }

  return event
}

/** Alias for explicit observational intent */
export const observeEvent = emitPassiveEvent

export function clearPassiveEventListeners(): void {
  listeners.clear()
}
