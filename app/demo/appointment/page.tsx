"use client"

import { EventDebugPanel } from "@/components/dev/event-debug-panel"
import { PassiveEventProvider } from "@/components/dev/passive-event-provider"
import { AppointmentFeed } from "@/components/business/appointment/appointment-feed"

export default function AppointmentDemoPage() {
  return (
    <PassiveEventProvider>
      <div className="min-h-screen">
        <AppointmentFeed />
      </div>
      <EventDebugPanel />
    </PassiveEventProvider>
  )
}
