"use client"

import { useState } from "react"
import Image from "next/image"
import { Clock, Star, Calendar, Stethoscope, Video, Play, Shield, Newspaper, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BusinessSocialLanding, type BusinessSection } from "../business-social-landing"
import { ActionDrawer } from "../action-drawer"
import { AppointmentCalendar } from "../appointment-calendar"
import { AppointmentConfirmation } from "../checkout-flows"
import { ContextSelectable } from "../context-selectable"
import type { ConversationContextItem } from "../conversational-ai"
import { healthConfig, healthProfessionals, healthServices } from "@/lib/mock-data/health-data"
import { healthContent } from "@/lib/mock-data/business-content"
import type { HealthProfessional } from "@/lib/business-types"

// ========================================
// MODULO: PROFISSIONAIS (OBJETIVO PRINCIPAL)
// ========================================
function ProfessionalsModule({
  onSelectProfessional,
  onToggleConversationContext,
  isInConversation,
}: {
  onSelectProfessional: (prof: HealthProfessional) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  return (
    <div className="space-y-4">
      {healthProfessionals.slice(0, 3).map((prof) => {
        const contextItem = {
          id: `health-professional-${prof.id}`,
          title: prof.name,
          image: prof.avatar,
          subtitle: "Profissional",
        }

        return (
        <ContextSelectable
          key={prof.id}
          as="div"
          onClick={() => onSelectProfessional(prof)}
          onLongPress={() => onToggleConversationContext?.(contextItem)}
          selected={isInConversation?.(contextItem.id) ?? false}
          className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50 hover:border-accent/50 transition-colors text-left"
        >
          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            <Image src={prof.avatar} alt={prof.name} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">{prof.name}</h3>
            <p className="text-sm text-muted-foreground">{prof.specialty}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-sm">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {prof.rating}
              </span>
              {prof.telemedicine && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Video className="w-3 h-3" />
                  Telemedicina
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-accent">R$ {prof.consultationPrice?.toFixed(2).replace(".", ",")}</p>
            <p className="text-xs text-muted-foreground">consulta</p>
          </div>
        </ContextSelectable>
      )})}
    </div>
  )
}

// ========================================
// MODULO: ESPECIALIDADES
// ========================================
function SpecialtiesModule({
  onToggleConversationContext,
  isInConversation,
}: {
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  const specialties = [
    { id: "1", name: "Clinico", icon: "🩺" },
    { id: "2", name: "Cardio", icon: "❤️" },
    { id: "3", name: "Ortopedia", icon: "🦴" },
    { id: "4", name: "Pediatria", icon: "👶" },
  ]
  
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:-mx-5 sm:px-5">
      {specialties.map((spec) => {
        const contextItem = {
          id: `health-specialty-${spec.id}`,
          title: spec.name,
          image: healthConfig.logo,
          subtitle: "Especialidade",
        }

        return (
          <ContextSelectable
            key={spec.id}
            as="div"
            onLongPress={() => onToggleConversationContext?.(contextItem)}
            selected={isInConversation?.(contextItem.id) ?? false}
            className="flex flex-col items-center gap-2 flex-shrink-0 p-4 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors min-w-[80px]"
          >
            <span className="text-2xl">{spec.icon}</span>
            <span className="text-sm font-medium text-foreground">{spec.name}</span>
          </ContextSelectable>
        )
      })}
    </div>
  )
}

// ========================================
// DRAWER: AGENDAR CONSULTA
// ========================================
function ProfessionalDrawer({ 
  professional, 
  isOpen, 
  onClose,
  onSchedule
}: { 
  professional: HealthProfessional | null
  isOpen: boolean
  onClose: () => void
  onSchedule: (date: string, time: string) => void
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  
  if (!professional) return null
  
  return (
    <ActionDrawer isOpen={isOpen} onClose={onClose} title="Agendar Consulta" size="lg">
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
          <div className="relative w-16 h-16 rounded-full overflow-hidden">
            <Image src={professional.avatar} alt={professional.name} fill className="object-cover" />
          </div>
          <div>
            <h3 className="font-semibold">{professional.name}</h3>
            <p className="text-sm text-muted-foreground">{professional.specialty}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{professional.rating} ({professional.reviewCount} avaliacoes)</span>
            </div>
          </div>
        </div>
        
        {professional.bio && (
          <div>
            <h4 className="font-medium mb-2">Sobre</h4>
            <p className="text-sm text-muted-foreground">{professional.bio}</p>
          </div>
        )}
        
        <div>
          <h4 className="font-medium mb-3">Escolha data e horario</h4>
          <AppointmentCalendar
            availability={professional.availability || []}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSelectDate={setSelectedDate}
            onSelectTime={setSelectedTime}
          />
        </div>
        
        <div className="bg-secondary/50 rounded-xl p-4">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-sm text-muted-foreground">Valor da consulta</span>
            <span className="text-xl font-bold text-accent">R$ {professional.consultationPrice?.toFixed(2).replace(".", ",")}</span>
          </div>
          <Button 
            className="w-full h-12"
            disabled={!selectedDate || !selectedTime}
            onClick={() => {
              if (selectedDate && selectedTime) {
                onSchedule(selectedDate, selectedTime)
              }
            }}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Confirmar agendamento
          </Button>
        </div>
      </div>
    </ActionDrawer>
  )
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export function HealthFeed() {
  const [selectedProfessional, setSelectedProfessional] = useState<HealthProfessional | null>(null)
  const [professionalDrawerOpen, setProfessionalDrawerOpen] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [bookedDate, setBookedDate] = useState<string | null>(null)
  const [bookedTime, setBookedTime] = useState<string | null>(null)
  
  const handleSchedule = (date: string, time: string) => {
    setBookedDate(date)
    setBookedTime(time)
    setProfessionalDrawerOpen(false)
    setConfirmationOpen(true)
  }
  
  const sections: BusinessSection[] = [
    {
      id: "professionals",
      title: "Profissionais",
      icon: <Stethoscope className="w-5 h-5 text-accent" />,
      type: "primary-action",
      customContent: (
        <ProfessionalsModule onSelectProfessional={(p) => { setSelectedProfessional(p); setProfessionalDrawerOpen(true) }} />
      )
    },
    {
      id: "specialties",
      title: "Especialidades",
      type: "specific",
      customContent: <SpecialtiesModule />
    },
    {
      id: "videos",
      title: "Dicas de Saude",
      icon: <Play className="w-5 h-5 text-accent" />,
      type: "content",
      posts: healthContent.videos
    },
    {
      id: "reviews",
      title: "Depoimentos",
      icon: <Star className="w-5 h-5 text-accent" />,
      type: "content",
      posts: healthContent.reviews
    },
    {
      id: "news",
      title: "Na Midia",
      icon: <Newspaper className="w-5 h-5 text-accent" />,
      type: "content",
      posts: healthContent.news
    },
    {
      id: "social",
      title: "Nas Redes",
      type: "content",
      posts: healthContent.social
    }
  ]
  
  return (
    <>
      <BusinessSocialLanding
        config={healthConfig}
        stories={healthContent.stories}
        sections={sections}
        footerLinks={[
          { label: "Sobre", href: "#" },
          { label: "Especialidades", href: "#" },
          { label: "Contato", href: "#" },
        ]}
      />
      
      <ProfessionalDrawer
        professional={selectedProfessional}
        isOpen={professionalDrawerOpen}
        onClose={() => setProfessionalDrawerOpen(false)}
        onSchedule={handleSchedule}
      />
      
      <ActionDrawer
        isOpen={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        title="Confirmacao"
        size="md"
      >
        {selectedProfessional && bookedDate && bookedTime && (
          <AppointmentConfirmation
            professionalName={selectedProfessional.name}
            professionalRole={selectedProfessional.specialty}
            professionalAvatar={selectedProfessional.avatar}
            date={bookedDate}
            time={bookedTime}
            onClose={() => {
              setConfirmationOpen(false)
              setSelectedProfessional(null)
            }}
          />
        )}
      </ActionDrawer>
    </>
  )
}
