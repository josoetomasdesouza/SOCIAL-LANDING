/**
 * In-memory ring buffer for passive event replay (DEV / tests).
 * No persistence — lightweight by design.
 */

import type { SocialLandingEvent } from "./event-types"

const DEFAULT_BUFFER_SIZE = 200

let buffer: SocialLandingEvent[] = []
let maxBufferSize = DEFAULT_BUFFER_SIZE

export function configureEventReplayBuffer(size: number): void {
  maxBufferSize = Math.max(1, size)
  if (buffer.length > maxBufferSize) {
    buffer = buffer.slice(-maxBufferSize)
  }
}

export function appendToEventReplayBuffer(event: SocialLandingEvent): void {
  buffer.push(event)
  if (buffer.length > maxBufferSize) {
    buffer = buffer.slice(-maxBufferSize)
  }
}

export function getEventReplayTimeline(): readonly SocialLandingEvent[] {
  return buffer
}

export function getEventReplayByType(type: SocialLandingEvent["type"]): SocialLandingEvent[] {
  return buffer.filter((event) => event.type === type)
}

export function getEventReplayByTraceId(traceId: string): SocialLandingEvent[] {
  return buffer.filter((event) => event.traceId === traceId)
}

export function clearEventReplayBuffer(): void {
  buffer = []
}

export function replayEventsToListener(
  listener: (event: SocialLandingEvent) => void,
  options?: { fromIndex?: number; types?: SocialLandingEvent["type"][] }
): number {
  const fromIndex = options?.fromIndex ?? 0
  const types = options?.types ? new Set(options.types) : null
  let replayed = 0

  for (let index = fromIndex; index < buffer.length; index += 1) {
    const event = buffer[index]
    if (types && !types.has(event.type)) {
      continue
    }
    listener(event)
    replayed += 1
  }

  return replayed
}
