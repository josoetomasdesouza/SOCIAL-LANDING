"use client"

import { useState } from "react"
import Image from "next/image"
import { Clock, Star, Calendar, Briefcase, FileText, Play, Newspaper, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BusinessSocialLanding, type BusinessSection } from "../business-social-landing"
import { ActionDrawer } from "../action-drawer"
import { AppointmentCalendar } from "../appointment-calendar"
import { AppointmentConfirmation } from "../checkout-flows"
import { ContextSelectable } from "../context-selectable"
import type { ConversationContextItem } from "../conversational-ai"
import { ConversationSelectionProvider, useConversationSelectionState } from "../conversation-selection-context"
import { professionalsConfig, professionalServices, professionalAvailability } from "@/lib/mock-data/professionals-data"
import { professionalsContent } from "@/lib/mock-data/business-content"
import type { ProfessionalService } from "@/lib/business-types"

// ========================================
// MODULO: SERVICOS (OBJETIVO PRINCIPAL)
// ========================================
function ServicesModule({
  onSelectService,
  onToggleConversationContext,
  isInConversation,
}: {
  onSelectService: (service: ProfessionalService) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  return (
    <div className="space-y-3">
      {professionalServices.slice(0, 4).map((service) => {
        const contextItem = {
          id: `professional-service-${service.id}`,
          title: service.name,
          image: professionalsConfig.logo,
          subtitle: "Servico",
        }

        return (
        <ContextSelectable
          key={service.id}
          as="div"
          onClick={() => onSelectService(service)}
          onLongPress={() => onToggleConversationContext?.(contextItem)}
          selected={isInConversation?.(contextItem.id) ?? false}
          className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border/50 hover:border-accent/50 transition-colors text-left"
        >
          <div className="flex-1">
            <h3 className="font-medium">{service.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{service.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs gap-1">
                <Clock className="w-3 h-3" />
                {service.duration}
              </Badge>
            </div>
          </div>
          <div className="text-right ml-4">
            <p className="font-bold text-accent">R$ {service.price.toFixed(2).replace(".", ",")}</p>
          </div>
        </ContextSelectable>
      )})}
    </div>
  )
}

// ========================================
// MODULO: AREAS DE ATUACAO
// ========================================
function AreasModule({
  onToggleConversationContext,
  isInConversation,
}: {
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  const areas = [
    { id: "1", name: "Consultoria", icon: "💼" },
    { id: "2", name: "Contratos", icon: "📄" },
    { id: "3", name: "Defesa", icon: "⚖️" },
    { id: "4", name: "Assessoria", icon: "🤝" },
  ]

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:-mx-5 sm:px-5">
      {areas.map((area) => {
        const contextItem = {
          id: `professional-area-${area.id}`,
          title: area.name,
          image: professionalsConfig.logo,
          subtitle: "Area",
        }

        return (
          <ContextSelectable
            key={area.id}
            as="div"
            onLongPress={() => onToggleConversationContext?.(contextItem)}
            selected={isInConversation?.(contextItem.id) ?? false}
            className="flex flex-col items-center gap-2 flex-shrink-0 p-4 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors min-w-[90px]"
          >
            <span className="text-2xl">{area.icon}</span>
            <span className="text-sm font-medium text-foreground">{area.name}</span>
          </ContextSelectable>
        )
      })}
    </div>
  )
}

// ========================================
// DRAWER: AGENDAR CONSULTA
// ========================================
function ServiceDrawer({ 
  service, 
  isOpen, 
  onClose,
  onSchedule,
  onToggleConversationContext,
  isInConversation,
}: { 
  service: ProfessionalService | null
  isOpen: boolean
  onClose: () => void
  onSchedule: (date: string, time: string) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  
  if (!service) return null

  const serviceContextItem = {
    id: `professional-service-${service.id}`,
    title: service.name,
    image: professionalsConfig.logo,
    subtitle: "Servico",
  }
  
  return (
    <ActionDrawer isOpen={isOpen} onClose={onClose} title={service.name} size="lg">
      <div className="space-y-6">
        <ContextSelectable
          as="div"
          onLongPress={() => onToggleConversationContext?.(serviceContextItem)}
          selected={isInConversation?.(serviceContextItem.id) ?? false}
          className="bg-secondary/50 rounded-xl p-4"
        >
          <h3 className="font-semibold mb-2">{service.name}</h3>
          <p className="text-sm text-muted-foreground">{service.description}</p>
          <div className="flex items-center gap-4 mt-3">
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" />
              {service.duration}
            </Badge>
            <span className="font-bold text-accent">R$ {service.price.toFixed(2).replace(".", ",")}</span>
          </div>
        </ContextSelectable>
        
        <div>
          <h4 className="font-medium mb-3">Escolha data e horario</h4>
          <AppointmentCalendar
            availability={professionalAvailability}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSelectDate={setSelectedDate}
            onSelectTime={setSelectedTime}
          />
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
    </ActionDrawer>
  )
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export function ProfessionalsFeed() {
  const conversationSelection = useConversationSelectionState()
  const [selectedService, setSelectedService] = useState<ProfessionalService | null>(null)
  const [serviceDrawerOpen, setServiceDrawerOpen] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [bookedDate, setBookedDate] = useState<string | null>(null)
  const [bookedTime, setBookedTime] = useState<string | null>(null)
  
  const handleSchedule = (date: string, time: string) => {
    setBookedDate(date)
    setBookedTime(time)
    setServiceDrawerOpen(false)
    setConfirmationOpen(true)
  }
  
  const sections: BusinessSection[] = [
    {
      id: "services",
      title: "Servicos",
      icon: <Briefcase className="w-5 h-5 text-accent" />,
      type: "primary-action",
      customContent: (
        <ServicesModule onSelectService={(s) => { setSelectedService(s); setServiceDrawerOpen(true) }} />
      )
    },
    {
      id: "areas",
      title: "Areas de Atuacao",
      icon: <FileText className="w-5 h-5 text-accent" />,
      type: "specific",
      customContent: <AreasModule />
    },
    {
      id: "videos",
      title: "Dicas",
      icon: <Play className="w-5 h-5 text-accent" />,
      type: "content",
      posts: professionalsContent.videos
    },
    {
      id: "reviews",
      title: "Depoimentos",
      icon: <Star className="w-5 h-5 text-accent" />,
      type: "content",
      posts: professionalsContent.reviews
    },
    {
      id: "news",
      title: "Na Midia",
      icon: <Newspaper className="w-5 h-5 text-accent" />,
      type: "content",
      posts: professionalsContent.news
    },
    {
      id: "social",
      title: "Nas Redes",
      type: "content",
      posts: professionalsContent.social
    }
  ]
  
  return (
    <ConversationSelectionProvider value={conversationSelection}>
      <>
      <BusinessSocialLanding
        config={professionalsConfig}
        stories={professionalsContent.stories}
        sections={sections}
        footerLinks={[
          { label: "Sobre", href: "#" },
          { label: "Servicos", href: "#" },
          { label: "Contato", href: "#" },
        ]}
      />
      
      <ServiceDrawer
        service={selectedService}
        isOpen={serviceDrawerOpen}
        onClose={() => setServiceDrawerOpen(false)}
        onSchedule={handleSchedule}
        onToggleConversationContext={conversationSelection.toggleConversationContextItem}
        isInConversation={conversationSelection.isConversationSelected}
      />
      
      <ActionDrawer
        isOpen={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        title="Confirmacao"
        size="md"
      >
        {selectedService && bookedDate && bookedTime && (
          <AppointmentConfirmation
            professionalName={professionalsConfig.name}
            professionalRole="Advogado"
            professionalAvatar={professionalsConfig.logo}
            date={bookedDate}
            time={bookedTime}
            onClose={() => {
              setConfirmationOpen(false)
              setSelectedService(null)
            }}
          />
        )}
      </ActionDrawer>
      </>
    </ConversationSelectionProvider>
  )
}
