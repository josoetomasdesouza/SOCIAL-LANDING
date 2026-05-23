"use client"

import { useEffect, useMemo, useState } from "react"
import {
  clearEventDebuggerTimeline,
  getEventDebuggerStats,
  isEventDebuggerAvailable,
  replayEventDebuggerTimeline,
  subscribeToEventDebugger,
  type EventTimelineSnapshot,
} from "@/lib/events/event-debugger"
import type { SocialLandingEventType } from "@/lib/events/event-types"

const FILTER_TYPES: SocialLandingEventType[] = [
  "composer.mode.changed",
  "surface.opened",
  "surface.closed",
  "drawer.opened",
  "drawer.closed",
  "feed.vertical.changed",
  "whatsapp.clicked",
  "user.intent.signal",
]

export function EventDebugPanel() {
  const [open, setOpen] = useState(false)
  const [snapshot, setSnapshot] = useState<EventTimelineSnapshot | null>(null)
  const [filter, setFilter] = useState<SocialLandingEventType | "all">("all")

  const available = isEventDebuggerAvailable()

  useEffect(() => {
    if (!available) return undefined
    return subscribeToEventDebugger(setSnapshot)
  }, [available])

  const stats = useMemo(() => getEventDebuggerStats(), [snapshot])

  if (!available) {
    return null
  }

  const events =
    filter === "all"
      ? snapshot?.events ?? []
      : (snapshot?.events ?? []).filter((event) => event.type === filter)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-4 right-4 z-[120] rounded-full border border-border/60 bg-background/90 px-3 py-2 text-xs font-medium shadow-sm backdrop-blur"
        aria-label="Toggle passive event debug panel"
      >
        Events ({stats.total})
      </button>

      {open && (
        <div className="fixed bottom-16 right-4 z-[120] flex max-h-[50vh] w-[min(92vw,420px)] flex-col overflow-hidden rounded-xl border border-border/60 bg-background/95 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
            <p className="text-xs font-semibold">Passive Event Timeline</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="text-[11px] text-muted-foreground hover:text-foreground"
                onClick={() => replayEventDebuggerTimeline((event) => console.info("[replay]", event))}
              >
                Replay log
              </button>
              <button
                type="button"
                className="text-[11px] text-muted-foreground hover:text-foreground"
                onClick={() => clearEventDebuggerTimeline()}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="border-b border-border/50 px-3 py-2">
            <select
              className="w-full rounded-md border border-border/50 bg-background px-2 py-1 text-xs"
              value={filter}
              onChange={(event) => setFilter(event.target.value as SocialLandingEventType | "all")}
            >
              <option value="all">All types</option>
              {FILTER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-y-auto px-3 py-2 font-mono text-[10px] leading-relaxed">
            {events.length === 0 ? (
              <p className="text-muted-foreground">No events captured yet.</p>
            ) : (
              events
                .slice()
                .reverse()
                .map((event, index) => (
                  <div key={`${event.timestamp}-${event.type}-${index}`} className="mb-2 border-b border-border/30 pb-2">
                    <div className="text-foreground">
                      {event.type} · {event.source}
                    </div>
                    <div className="text-muted-foreground">{event.timestamp}</div>
                    <pre className="mt-1 whitespace-pre-wrap break-all text-[10px]">
                      {JSON.stringify(event.payload, null, 0)}
                    </pre>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </>
  )
}
