"use client"

import { useEffect, useRef, useState } from "react"
import { EventDebugPanel } from "@/components/dev/event-debug-panel"
import { PassiveEventProvider } from "@/components/dev/passive-event-provider"
import { observeFeedVerticalChanged } from "@/lib/events/instrumentation"
import { BusinessSelector } from "@/components/business/business-selector"
import { AppointmentFeed } from "@/components/business/appointment/appointment-feed"
import { EcommerceFeed } from "@/components/business/ecommerce/ecommerce-feed"
import { CoursesFeed } from "@/components/business/courses/courses-feed"
import { RestaurantFeed } from "@/components/business/restaurant/restaurant-feed"
import { RealEstateFeed } from "@/components/business/realestate/realestate-feed"
import { ProfessionalsFeed } from "@/components/business/professionals/professionals-feed"
import { EventsFeed } from "@/components/business/events/events-feed"
import { GymFeed } from "@/components/business/gym/gym-feed"
import { HealthFeed } from "@/components/business/health/health-feed"
import { InfluencerFeed } from "@/components/business/influencer/influencer-feed"
import { PersonalFeed } from "@/components/business/personal/personal-feed"
import { InstitutionalFeed } from "@/components/business/institutional/institutional-feed"
import { syncComposerLayoutOverrideFromUrl } from "@/lib/ui/composer-layout"
import { syncSurfaceCementOverrideFromUrl } from "@/lib/ui/surface-cement"
import { COMPOSER_SURFACE_OVERRIDE_STORAGE_KEY } from "@/lib/ui/composer-surface-material"
import type { BusinessType } from "@/lib/business-types"

function syncComposerSurfaceOverrideFromUrl() {
  if (typeof window === "undefined") {
    return
  }

  const mode = new URLSearchParams(window.location.search).get("composer-smoke")
  if (mode === "smoke-fume" || mode === "smoke-subtle" || mode === "off") {
    window.localStorage.setItem(COMPOSER_SURFACE_OVERRIDE_STORAGE_KEY, mode)
  }
}

function syncComposerExperimentOverridesFromUrl() {
  syncComposerSurfaceOverrideFromUrl()
  syncComposerLayoutOverrideFromUrl()
  syncSurfaceCementOverrideFromUrl()
}

export default function DemoPage() {
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null)
  const previousVerticalRef = useRef<BusinessType | null>(null)

  useEffect(() => {
    syncComposerExperimentOverridesFromUrl()
  }, [])

  useEffect(() => {
    if (!selectedType) {
      return
    }
    observeFeedVerticalChanged({
      from: previousVerticalRef.current,
      to: selectedType,
      source: "demo",
    })
    previousVerticalRef.current = selectedType
  }, [selectedType])
  
  if (!selectedType) {
    return (
      <PassiveEventProvider>
        <BusinessSelector onSelect={setSelectedType} />
        <EventDebugPanel />
      </PassiveEventProvider>
    )
  }

  const renderBusinessFeed = () => {
    switch (selectedType) {
      case "appointment":
        return <AppointmentFeed />
      case "ecommerce":
        return <EcommerceFeed />
      case "courses":
        return <CoursesFeed />
      case "restaurant":
        return <RestaurantFeed />
      case "realestate":
        return <RealEstateFeed />
      case "professionals":
        return <ProfessionalsFeed />
      case "events":
        return <EventsFeed />
      case "gym":
        return <GymFeed />
      case "health":
        return <HealthFeed />
      case "influencer":
        return <InfluencerFeed />
      case "personal":
        return <PersonalFeed />
      case "institutional":
        return <InstitutionalFeed />
      default:
        return null
    }
  }
  
  return (
    <PassiveEventProvider>
      <div className="min-h-screen bg-background">
        {/* Business Feed */}
        {renderBusinessFeed()}
      </div>
      <EventDebugPanel />
    </PassiveEventProvider>
  )
}
