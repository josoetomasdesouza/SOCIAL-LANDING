/**
 * DEV observability helpers — timeline snapshots without UX impact.
 */

import { subscribeToEvents } from "./event-bus"
import {
  clearEventReplayBuffer,
  getEventReplayTimeline,
  replayEventsToListener,
} from "./event-replay"
import type { SocialLandingEvent, SocialLandingEventType } from "./event-types"

export interface EventTimelineSnapshot {
  readonly events: readonly SocialLandingEvent[]
  readonly total: number
  readonly capturedAt: string
}

export interface EventDebuggerStats {
  readonly total: number
  readonly byType: Readonly<Partial<Record<SocialLandingEventType, number>>>
  readonly lastEvent: SocialLandingEvent | null
}

let debuggerListenerUnsubscribe: (() => void) | null = null
const debuggerSubscribers = new Set<(snapshot: EventTimelineSnapshot) => void>()

function buildStats(events: readonly SocialLandingEvent[]): EventDebuggerStats {
  const byType: Partial<Record<SocialLandingEventType, number>> = {}
  for (const event of events) {
    byType[event.type] = (byType[event.type] ?? 0) + 1
  }
  return {
    total: events.length,
    byType,
    lastEvent: events.length > 0 ? events[events.length - 1] : null,
  }
}

export function getEventDebuggerSnapshot(): EventTimelineSnapshot {
  const events = getEventReplayTimeline()
  return {
    events,
    total: events.length,
    capturedAt: new Date().toISOString(),
  }
}

export function getEventDebuggerStats(): EventDebuggerStats {
  return buildStats(getEventReplayTimeline())
}

export function subscribeToEventDebugger(
  listener: (snapshot: EventTimelineSnapshot) => void
): () => void {
  debuggerSubscribers.add(listener)
  listener(getEventDebuggerSnapshot())

  if (!debuggerListenerUnsubscribe) {
    debuggerListenerUnsubscribe = subscribeToEvents(() => {
      const snapshot = getEventDebuggerSnapshot()
      for (const subscriber of debuggerSubscribers) {
        subscriber(snapshot)
      }
    })
  }

  return () => {
    debuggerSubscribers.delete(listener)
    if (debuggerSubscribers.size === 0 && debuggerListenerUnsubscribe) {
      debuggerListenerUnsubscribe()
      debuggerListenerUnsubscribe = null
    }
  }
}

export function clearEventDebuggerTimeline(): void {
  clearEventReplayBuffer()
  const snapshot = getEventDebuggerSnapshot()
  for (const subscriber of debuggerSubscribers) {
    subscriber(snapshot)
  }
}

export function replayEventDebuggerTimeline(
  listener: (event: SocialLandingEvent) => void,
  options?: { types?: SocialLandingEventType[] }
): number {
  return replayEventsToListener(listener, options)
}

export function isEventDebuggerAvailable(): boolean {
  return process.env.NODE_ENV === "development"
}
