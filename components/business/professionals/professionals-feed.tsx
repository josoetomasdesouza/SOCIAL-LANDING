"use client"

import { useState } from "react"
import Image from "next/image"
import { Clock, Star, Calendar, Briefcase, FileText, Play, Newspaper, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BusinessSocialLanding, type BusinessSection } from "../business-social-landing"
import { ActionDrawer } from "../action-drawer"
import { AppointmentCalendar } from "../appointment-calendar"
import { AppointmentConfirmation } from "../checkout-flows"
import { professionalsConfig, professionalServices, professionalAvailability } from "@/lib/mock-data/professionals-data"
import { professionalsContent } from "@/lib/mock-data/business-content"
import type { ProfessionalService } from "@/lib/business-types"
import { type ConversationContextItem, useConversationContextSelectionState } from "../conversation-context"
import { useConversationLongPress } from "../use-conversation-long-press"

// ========================================
// MODULO: SERVICOS (OBJETIVO PRINCIPAL)
// ========================================
function ServiceCardButton({
  service,
  onSelectService,
  isContextSelected,
  onContextToggle,
}: {
  service: ProfessionalService
  onSelectService: (service: ProfessionalService) => void
  isContextSelected: boolean
  onContextToggle: (item: ConversationContextItem) => void
}) {
  const contextItem: ConversationContextItem = {
    id: `service:${service.id}`,
    type: "service",
    title: service.name,
    description: service.description,
    fallbackLabel: "Servico",
  }
  const { longPressHandlers, shouldHandleActivation } = useConversationLongPress({
    onLongPress: () => onContextToggle(contextItem),
  })

  return (
    <button
      onClick={() => {
        if (!shouldHandleActivation()) return
        onSelectService(service)
      }}
      className={cn(
        "w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border/50 hover:border-accent/50 transition-colors text-left",
        isContextSelected && "ring-2 ring-accent/20 ring-offset-2 ring-offset-background shadow-lg"
      )}
      {...longPressHandlers}
    >
      <div className="flex-1">
        {isContextSelected && (
          <div className="mb-2 inline-flex rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            Na conversa
          </div>
        )}
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
    </button>
  )
}

function ServicesModule({
  onSelectService,
  selectedContextIds,
  onContextToggle,
}: {
  onSelectService: (service: ProfessionalService) => void
  selectedContextIds: Set<string>
  onContextToggle: (item: ConversationContextItem) => void
}) {
  return (
    <div className="space-y-3">
      {professionalServices.slice(0, 4).map((service) => (
        <ServiceCardButton
          key={service.id}
          service={service}
          onSelectService={onSelectService}
          isContextSelected={selectedContextIds.has(`service:${service.id}`)}
          onContextToggle={onContextToggle}
        />
      ))}
    </div>
  )
}

// ========================================
// MODULO: AREAS DE ATUACAO
// ========================================
function AreasModule() {
  const areas = [
    { id: "1", name: "Consultoria", icon: "💼" },
    { id: "2", name: "Contratos", icon: "📄" },
    { id: "3", name: "Defesa", icon: "⚖️" },
    { id: "4", name: "Assessoria", icon: "🤝" },
  ]
  
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:-mx-5 sm:px-5">
      {areas.map((area) => (
        <button key={area.id} className="flex flex-col items-center gap-2 flex-shrink-0 p-4 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors min-w-[90px]">
          <span className="text-2xl">{area.icon}</span>
          <span className="text-sm font-medium text-foreground">{area.name}</span>
        </button>
      ))}
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
  selectedContextIds,
  onContextToggle,
}: { 
  service: ProfessionalService | null
  isOpen: boolean
  onClose: () => void
  onSchedule: (date: string, time: string) => void
  selectedContextIds: Set<string>
  onContextToggle: (item: ConversationContextItem) => void
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  
  if (!service) return null
  const contextItem: ConversationContextItem = {
    id: `service:${service.id}`,
    type: "service",
    title: service.name,
    description: service.description,
    fallbackLabel: "Servico",
  }
  const isContextSelected = selectedContextIds.has(contextItem.id)
  const { longPressHandlers } = useConversationLongPress({
    onLongPress: () => onContextToggle(contextItem),
  })
  
  return (
    <ActionDrawer isOpen={isOpen} onClose={onClose} title={service.name} size="lg">
      <div className="space-y-6">
        <div
          className={cn(
            "bg-secondary/50 rounded-xl p-4 transition-all duration-200",
            isContextSelected && "ring-2 ring-accent/20 ring-offset-2 ring-offset-background shadow-lg"
          )}
          {...longPressHandlers}
        >
          {isContextSelected && (
            <div className="mb-3 inline-flex rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              Na conversa
            </div>
          )}
          <h3 className="font-semibold mb-2">{service.name}</h3>
          <p className="text-sm text-muted-foreground">{service.description}</p>
          <div className="flex items-center gap-4 mt-3">
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" />
              {service.duration}
            </Badge>
            <span className="font-bold text-accent">R$ {service.price.toFixed(2).replace(".", ",")}</span>
          </div>
        </div>
        
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
  const [selectedService, setSelectedService] = useState<ProfessionalService | null>(null)
  const [serviceDrawerOpen, setServiceDrawerOpen] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [bookedDate, setBookedDate] = useState<string | null>(null)
  const [bookedTime, setBookedTime] = useState<string | null>(null)
  const {
    contextItems,
    selectedContextIds,
    toggleContextItem,
    removeContextItem,
  } = useConversationContextSelectionState()
  
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
        <ServicesModule
          onSelectService={(s) => { setSelectedService(s); setServiceDrawerOpen(true) }}
          selectedContextIds={selectedContextIds}
          onContextToggle={toggleContextItem}
        />
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
    <>
      <BusinessSocialLanding
        config={professionalsConfig}
        stories={professionalsContent.stories}
        sections={sections}
        conversationContextItems={contextItems}
        onConversationContextToggle={toggleContextItem}
        onConversationContextRemove={removeContextItem}
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
        selectedContextIds={selectedContextIds}
        onContextToggle={toggleContextItem}
        onSchedule={handleSchedule}
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
  )
}
