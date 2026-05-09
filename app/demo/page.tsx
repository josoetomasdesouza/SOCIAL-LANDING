"use client"

import { useState } from "react"
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
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { BusinessType } from "@/lib/business-types"

const businessNames: Record<BusinessType, string> = {
  appointment: "Barbearia",
  ecommerce: "Loja Online",
  courses: "Cursos",
  restaurant: "Restaurante",
  realestate: "Imobiliaria",
  professionals: "Profissional",
  events: "Eventos",
  gym: "Academia",
  health: "Clinica",
  influencer: "Influencer",
  personal: "Pessoal",
  institutional: "Institucional",
}

export default function DemoPage() {
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null)
  
  if (!selectedType) {
    return <BusinessSelector onSelect={setSelectedType} />
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
    <div className="min-h-screen bg-background">
      {/* Demo controls - compact overlay that does not cover model CTAs */}
      <div className="fixed left-3 top-20 z-[60] rounded-full border border-border/60 bg-background/95 shadow-lg backdrop-blur-xl">
        <div className="h-10 flex items-center gap-1 px-1.5">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1.5 rounded-full px-3"
            onClick={() => setSelectedType(null)}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Link
            href="/"
            className="hidden sm:block px-3 text-sm text-muted-foreground hover:text-foreground"
          >
            Ver /
          </Link>
        </div>
      </div>
      
      {/* Business Feed */}
      <main>
        {renderBusinessFeed()}
      </main>
    </div>
  )
}
