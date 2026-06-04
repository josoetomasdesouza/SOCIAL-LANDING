"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Calendar, Clock, Scissors, Star, Play, ChevronRight, Check, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BusinessSocialLanding, type BusinessSection } from "../business-social-landing"
import { ActionDrawer } from "../action-drawer"
import { AppointmentCalendar } from "../appointment-calendar"
import { SocialContactCTA } from "../social-contact-cta"
import { ContextSelectable } from "../context-selectable"
import type { ConversationContextItem } from "../conversational-ai"
import { ConversationSelectionProvider, useConversationSelectionState } from "../conversation-selection-context"
import {
  appointmentArrivalContext,
  appointmentBarberServices,
  appointmentBarberShopConfig,
  appointmentBarbers,
  appointmentFeedContent,
  appointmentHairStyles,
  appointmentHeroOperationalContext,
} from "@/lib/runtime/appointment/appointment-feed-data"
import { createAppointmentConversationResolverWithDialogue } from "@/lib/mock-data/appointment-conversation-resolver-composed"
import { createAppointmentConversationalVisualBlockRenderer } from "./appointment-conversational-visual-block"
import { AppointmentOperationalHero } from "./appointment-operational-hero"
import { AppointmentArrivalDrawer } from "./appointment-arrival-drawer"
import type { Professional, Service, StyleExample } from "@/lib/business-types"

type BookingStep = "service" | "professional" | "datetime" | "confirmation" | null

function scrollToAppointmentSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

const APPOINTMENT_LANDING_CONFIG = {
  ...appointmentBarberShopConfig,
  description: "",
}

// ========================================
// MODULO: AGENDAR HORARIO (OBJETIVO PRINCIPAL)
// ========================================
function ScheduleModule({ 
  onStartBooking,
  onSelectService,
  onSelectBarber,
  onToggleConversationContext,
  isInConversation,
}: { 
  onStartBooking: () => void
  onSelectService: (service: Service) => void
  onSelectBarber: (barber: Professional) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  return (
    <div className="space-y-6">
      {/* Servicos Populares */}
      <div>
        <h4 className="font-medium text-foreground mb-3">Servicos populares</h4>
        <div className="space-y-2">
          {appointmentBarberServices.filter(s => s.popular).slice(0, 3).map((service) => {
            const contextItem = {
              id: `appointment-service-${service.id}`,
              title: service.name,
              image: service.image || appointmentBarberShopConfig.logo,
              subtitle: "Servico",
            }

            return (
            <ContextSelectable
              key={service.id}
              as="div"
              dataMorphSourceId={contextItem.id}
              onClick={() => onSelectService(service)}
              onLongPress={() => onToggleConversationContext?.(contextItem)}
              selected={isInConversation?.(contextItem.id) ?? false}
              className="w-full flex items-center gap-3 p-3 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors"
            >
              <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={service.image || ""} alt={service.name} fill className="object-cover" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">{service.name}</p>
                <p className="text-sm text-muted-foreground">{service.duration} min</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-accent">R$ {service.price}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </ContextSelectable>
          )})}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-foreground mb-3">Profissionais</h4>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:-mx-5 sm:px-5">
          {appointmentBarbers.slice(0, 4).map((barber) => {
            const contextItem = {
              id: `appointment-barber-${barber.id}`,
              title: barber.name,
              image: barber.avatar,
              subtitle: "Profissional",
            }

            return (
              <ContextSelectable
                as="div"
                key={barber.id}
                dataMorphSourceId={contextItem.id}
                onClick={() => onSelectBarber(barber)}
                onLongPress={() => onToggleConversationContext?.(contextItem)}
                selected={isInConversation?.(contextItem.id) ?? false}
                className="flex-shrink-0 w-28"
              >
                <div className="relative w-28 h-32 rounded-xl overflow-hidden">
                  <Image src={barber.avatar} alt={barber.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-xs font-medium text-white line-clamp-2">{barber.name}</p>
                  </div>
                </div>
              </ContextSelectable>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ========================================
// MODULO: ESTILOS EM ALTA
// ========================================
function StylesModule({
  onSelectStyle,
  onToggleConversationContext,
  isInConversation,
}: {
  onSelectStyle: (style: StyleExample) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:-mx-5 sm:px-5">
      {appointmentHairStyles.slice(0, 6).map((style) => {
        const contextItem = {
          id: `appointment-style-${style.id}`,
          title: style.name,
          image: style.image,
          subtitle: "Estilo",
        }

        return (
        <ContextSelectable
          as="div"
          key={style.id}
          dataMorphSourceId={contextItem.id}
          onClick={() => onSelectStyle(style)}
          onLongPress={() => onToggleConversationContext?.(contextItem)}
          selected={isInConversation?.(contextItem.id) ?? false}
          className="flex-shrink-0 group"
        >
          <div className="relative w-32 h-40 rounded-xl overflow-hidden">
            <Image src={style.image} alt={style.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-sm font-medium text-white">{style.name}</p>
              <Badge variant="secondary" className="mt-1 text-xs bg-white/20 text-white border-0">
                {"trend" in style && style.trend ? "Em alta" : style.category}
              </Badge>
            </div>
          </div>
        </ContextSelectable>
      )})}
    </div>
  )
}

// ========================================
// DRAWER: DETALHES DO BARBEIRO + AGENDAMENTO
// ========================================
function BarberDetailsDrawer({ 
  barber, 
  service,
  isOpen, 
  onClose,
  onSchedule,
  onToggleConversationContext,
  isInConversation,
}: { 
  barber: Professional | null
  service: Service | null
  isOpen: boolean
  onClose: () => void
  onSchedule: (barber: Professional, service: Service | null, date: string, time: string) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(null)
      setSelectedTime(null)
    }
  }, [isOpen, barber?.id, service?.id])
  
  if (!barber) return null

  const barberContextItem = {
    id: `appointment-barber-${barber.id}`,
    title: barber.name,
    image: barber.avatar,
    subtitle: "Profissional",
  }

  const serviceContextItem = service
    ? {
        id: `appointment-service-${service.id}`,
        title: service.name,
        image: service.image || barber.avatar,
        subtitle: "Servico",
      }
    : null
  
  return (
    <ActionDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={barber.name}
      size="lg"
      footer={
        <div className="space-y-3">
          {service && (
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-foreground">{service.name}</p>
                <p className="text-muted-foreground">{service.duration} min</p>
              </div>
              <p className="font-bold text-accent">R$ {service.price}</p>
            </div>
          )}
          <Button
            type="button"
            className="w-full h-12"
            disabled={!service || !selectedDate || !selectedTime}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              if (service && selectedDate && selectedTime) {
                onSchedule(barber, service, selectedDate, selectedTime)
              }
            }}
          >
            Confirmar agendamento
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <ContextSelectable
          as="div"
          className="rounded-[28px] px-1 py-1"
        >
          <div className="relative w-20 h-20 rounded-full overflow-hidden">
            <Image src={barber.avatar} alt={barber.name} fill className="object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{barber.name}</h3>
            <p className="text-sm text-muted-foreground">{barber.role}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{barber.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">({barber.reviewCount} avaliacoes)</span>
            </div>
          </div>
        </ContextSelectable>
        
        {service && serviceContextItem && (
          <ContextSelectable
            as="div"
            className="bg-secondary/50 rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-medium">{service.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                <p className="text-xs text-muted-foreground mt-2">{service.duration} minutos</p>
              </div>
              <p className="font-bold text-accent whitespace-nowrap">R$ {service.price}</p>
            </div>
          </ContextSelectable>
        )}
        
        {/* Especialidades */}
        <div>
          <h4 className="font-medium mb-2">Especialidades</h4>
          <div className="flex flex-wrap gap-2">
            {barber.specialties?.map((spec) => (
              <Badge key={spec} variant="secondary">{spec}</Badge>
            ))}
          </div>
        </div>
        
        {/* Calendario */}
        <div>
          <h4 className="font-medium mb-3">Escolha data e horario</h4>
          <AppointmentCalendar
            availability={barber.availability || []}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSelectDate={(date) => {
              setSelectedDate(date)
              setSelectedTime(null)
            }}
            onSelectTime={setSelectedTime}
            autoScrollToTimes
          />
        </div>
      </div>
    </ActionDrawer>
  )
}

// ========================================
// DRAWER: SERVICOS
// ========================================
function ServicesDrawer({ 
  isOpen, 
  onClose,
  onSelectService,
  onToggleConversationContext,
  isInConversation,
}: { 
  isOpen: boolean
  onClose: () => void
  onSelectService: (service: Service) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  const categories = [...new Set(appointmentBarberServices.map(s => s.category))]
  
  return (
    <ActionDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Escolha o servico"
      size="lg"
    >
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h4 className="font-medium text-foreground mb-3">{category}</h4>
            <div className="space-y-2">
              {appointmentBarberServices.filter(s => s.category === category).map((service) => {
                const contextItem = {
                  id: `appointment-service-${service.id}`,
                  title: service.name,
                  image: service.image || appointmentBarberShopConfig.logo,
                  subtitle: "Servico",
                }

                return (
                  <ContextSelectable
                    as="div"
                    key={service.id}
                    dataMorphSourceId={contextItem.id}
                    onClick={() => onSelectService(service)}
                    onLongPress={() => onToggleConversationContext?.(contextItem)}
                    selected={isInConversation?.(contextItem.id) ?? false}
                    className="w-full flex items-center gap-3 p-3 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={service.image || ""} alt={service.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{service.duration} minutos</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent">R$ {service.price}</p>
                    </div>
                  </ContextSelectable>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </ActionDrawer>
  )
}

// ========================================
// DRAWER: PROFISSIONAIS
// ========================================
function ProfessionalsDrawer({
  service,
  isOpen,
  onClose,
  onSelectBarber,
  onToggleConversationContext,
  isInConversation,
}: {
  service: Service | null
  isOpen: boolean
  onClose: () => void
  onSelectBarber: (barber: Professional) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  if (!service) return null

  const serviceContextItem = {
    id: `appointment-service-${service.id}`,
    title: service.name,
    image: service.image || appointmentBarberShopConfig.logo,
    subtitle: "Servico",
  }

  return (
    <ActionDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Escolha o profissional"
      size="lg"
    >
      <div className="space-y-5">
        <ContextSelectable
          as="div"
          dataMorphSourceId={serviceContextItem.id}
          onLongPress={() => onToggleConversationContext?.(serviceContextItem)}
          selected={isInConversation?.(serviceContextItem.id) ?? false}
          className="bg-secondary/50 rounded-xl p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-medium">{service.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">{service.duration} minutos</p>
            </div>
            <p className="font-bold text-accent whitespace-nowrap">R$ {service.price}</p>
          </div>
        </ContextSelectable>

        <div className="space-y-2">
          {appointmentBarbers.map((barber) => {
            const contextItem = {
              id: `appointment-barber-${barber.id}`,
              title: barber.name,
              image: barber.avatar,
              subtitle: "Profissional",
            }

            return (
              <ContextSelectable
                as="div"
                key={barber.id}
                dataMorphSourceId={contextItem.id}
                onClick={() => onSelectBarber(barber)}
                onLongPress={() => onToggleConversationContext?.(contextItem)}
                selected={isInConversation?.(contextItem.id) ?? false}
                className="w-full flex items-center gap-3 p-3 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors"
              >
                <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                  <Image src={barber.avatar} alt={barber.name} fill className="object-cover" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{barber.name}</p>
                  <p className="text-sm text-muted-foreground">{barber.role}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{barber.rating}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </ContextSelectable>
            )
          })}
        </div>
      </div>
    </ActionDrawer>
  )
}

// ========================================
// DRAWER: CONFIRMACAO
// ========================================
function ConfirmationDrawer({ 
  isOpen, 
  onClose,
  barber,
  service,
  date,
  time
}: { 
  isOpen: boolean
  onClose: () => void
  barber: Professional | null
  service: Service | null
  date: string | null
  time: string | null
}) {
  if (!barber || !service || !date || !time) return null
  
  const formattedDate = new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  })
  
  return (
    <ActionDrawer isOpen={isOpen} onClose={onClose} title="Agendamento confirmado!" size="lg">
      <div className="text-center space-y-6 py-4">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-2">Tudo certo!</h3>
          <p className="text-muted-foreground">Seu horario esta reservado.</p>
        </div>
        
        <div className="bg-secondary/50 rounded-xl p-4 text-left space-y-3">
          {service && (
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/50">
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-sm text-muted-foreground">{service.duration} minutos</p>
              </div>
              <p className="font-bold text-accent">R$ {service.price}</p>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden">
              <Image src={barber.avatar} alt={barber.name} fill className="object-cover" />
            </div>
            <div>
              <p className="font-medium">{barber.name}</p>
              <p className="text-sm text-muted-foreground">{barber.role}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{time}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button type="button" className="w-full" onClick={onClose}>
            Adicionar ao calendario
          </Button>
          <Button type="button" variant="outline" className="w-full gap-2" onClick={onClose}>
            <Phone className="w-4 h-4" />
            Enviar por WhatsApp
          </Button>
        </div>
      </div>
    </ActionDrawer>
  )
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export function AppointmentFeed() {
  const conversationSelection = useConversationSelectionState()
  const { setComposerMode, setComposerOffsetClassName } = conversationSelection
  const [selectedBarber, setSelectedBarber] = useState<Professional | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [bookingStep, setBookingStep] = useState<BookingStep>(null)
  const [bookedDate, setBookedDate] = useState<string | null>(null)
  const [bookedTime, setBookedTime] = useState<string | null>(null)
  const [bookedService, setBookedService] = useState<Service | null>(null)
  const [arrivalDrawerOpen, setArrivalDrawerOpen] = useState(false)

  useEffect(() => {
    const nextMode =
      arrivalDrawerOpen || bookingStep === "datetime" || bookingStep === "confirmation"
        ? "hidden"
        : bookingStep === "service" || bookingStep === "professional"
          ? "overlay"
          : "default"

    setComposerMode(nextMode)
    setComposerOffsetClassName(undefined)

    return () => {
      setComposerMode("default")
      setComposerOffsetClassName(undefined)
    }
  }, [bookingStep, arrivalDrawerOpen, setComposerMode, setComposerOffsetClassName])
  
  // Handlers
  const handleStartBooking = () => {
    setSelectedService(null)
    setSelectedBarber(null)
    setBookingStep("service")
  }

  const handleOpenArrival = useCallback(() => {
    setArrivalDrawerOpen(true)
  }, [])

  const handleCloseArrival = useCallback(() => {
    setArrivalDrawerOpen(false)
  }, [])

  const operationalHero = useMemo(
    () => (
      <AppointmentOperationalHero
        brandName={appointmentBarberShopConfig.name}
        coverImage={appointmentBarberShopConfig.coverImage || appointmentBarberShopConfig.logo}
        coverAlt={`Ambiente ${appointmentBarberShopConfig.name}`}
        operationalContext={appointmentHeroOperationalContext}
        headline="Corte preciso, barba bem feita e um clima de casa — passe quando quiser."
        primaryActionLabel="Agendar horario"
        onPrimaryAction={handleStartBooking}
        onPlaceHintSelect={handleOpenArrival}
        highlights={[
          { label: "Cortes", onSelect: () => scrollToAppointmentSection("section-agendar-horario") },
          { label: "Barba", onSelect: handleStartBooking },
          { label: "Visagismo", onSelect: () => scrollToAppointmentSection("section-estilos-em-alta") },
          { label: "Avaliacoes", onSelect: () => scrollToAppointmentSection("section-o-que-dizem") },
          { label: "Ambiente", onSelect: () => scrollToAppointmentSection("section-bastidores") },
        ]}
      />
    ),
    [handleOpenArrival]
  )
  
  const handleSelectService = (service: Service) => {
    setSelectedService(service)
    setSelectedBarber(null)
    setBookingStep("professional")
  }
  
  const handleSelectBarber = (barber: Professional) => {
    setSelectedBarber(barber)
    setBookingStep("datetime")
  }

  const handlePrimaryBooking = () => {
    handleStartBooking()
  }
  
  const handleSelectStyle = (style: StyleExample) => {
    setBookingStep("service")
  }
  
  const handleSchedule = (barber: Professional, service: Service | null, date: string, time: string) => {
    setSelectedBarber(barber)
    setBookedService(service)
    setBookedDate(date)
    setBookedTime(time)
    setBookingStep("confirmation")
  }

  const openBarberFlow = useCallback((barber: Professional) => {
    setSelectedBarber(barber)
    setSelectedService((current) => current ?? appointmentBarberServices.find((service) => service.popular) ?? appointmentBarberServices[0])
    setBookingStep("datetime")
  }, [])

  const openScheduleBooking = useCallback(({ barberId, serviceId }: { barberId?: string; serviceId?: string }) => {
    const barber = barberId ? appointmentBarbers.find((item) => item.id === barberId) ?? null : null
    const service = serviceId
      ? appointmentBarberServices.find((item) => item.id === serviceId) ?? null
      : selectedService ?? appointmentBarberServices.find((item) => item.popular) ?? appointmentBarberServices[0]

    if (barber) {
      setSelectedBarber(barber)
      setSelectedService(service)
      setBookingStep("datetime")
      return
    }

    if (service) {
      handleSelectService(service)
    } else {
      handleStartBooking()
    }
  }, [selectedService])

  const conversationResponseResolver = useMemo(
    () =>
      createAppointmentConversationResolverWithDialogue({
        brandName: appointmentBarberShopConfig.name,
        operational: {
          liveState: appointmentHeroOperationalContext.liveState,
          placeHint: appointmentHeroOperationalContext.placeHint,
          momentHint: appointmentHeroOperationalContext.momentHint,
          hoursHint: appointmentHeroOperationalContext.hoursHint,
          openingHours: appointmentBarberShopConfig.openingHours || "Seg-Sab: 9h-20h",
        },
        arrival: {
          addressLine: appointmentArrivalContext.addressLine,
          parkingHint: appointmentArrivalContext.parkingHint,
          referenceHint: appointmentArrivalContext.referenceHint,
        },
        serviceNames: appointmentBarberServices.map((service) => service.name),
        services: appointmentBarberServices,
        professionals: appointmentBarbers,
        feedPosts: [
          ...appointmentFeedContent.videos,
          ...appointmentFeedContent.news,
          ...appointmentFeedContent.reviews,
        ],
      }),
    [
      appointmentArrivalContext.addressLine,
      appointmentArrivalContext.parkingHint,
      appointmentArrivalContext.referenceHint,
      appointmentBarbers,
      appointmentBarberServices,
      appointmentBarberShopConfig.name,
      appointmentBarberShopConfig.openingHours,
      appointmentFeedContent.news,
      appointmentFeedContent.reviews,
      appointmentFeedContent.videos,
      appointmentHeroOperationalContext.hoursHint,
      appointmentHeroOperationalContext.liveState,
      appointmentHeroOperationalContext.momentHint,
      appointmentHeroOperationalContext.placeHint,
    ]
  )

  const renderConversationVisualBlock = useMemo(
    () =>
      createAppointmentConversationalVisualBlockRenderer({
        barbers: appointmentBarbers,
        services: appointmentBarberServices,
        onSelectBarber: openBarberFlow,
        onSelectService: handleSelectService,
        onScheduleBooking: openScheduleBooking,
      }),
    [openBarberFlow, openScheduleBooking]
  )
  
  // Secoes do feed
  const sections: BusinessSection[] = [
    {
      id: "schedule",
      title: "Agendar Horario",
      icon: <Calendar className="w-5 h-5 text-accent" />,
      type: "primary-action",
      customContent: (
        <ScheduleModule 
          onStartBooking={handleStartBooking}
          onSelectService={handleSelectService}
          onSelectBarber={openBarberFlow}
          onToggleConversationContext={conversationSelection.toggleConversationContextItemWithMorph}
          isInConversation={conversationSelection.isConversationSelected}
        />
      )
    },
    {
      id: "styles",
      title: "Estilos em Alta",
      icon: <Scissors className="w-5 h-5 text-accent" />,
      type: "specific",
      customContent: (
        <StylesModule
          onSelectStyle={handleSelectStyle}
          onToggleConversationContext={conversationSelection.toggleConversationContextItemWithMorph}
          isInConversation={conversationSelection.isConversationSelected}
        />
      )
    },
    {
      id: "videos",
      title: "Tutoriais e Tendencias",
      icon: <Play className="w-5 h-5 text-accent" />,
      type: "content",
      posts: appointmentFeedContent.videos
    },
    {
      id: "reviews",
      title: "O Que Dizem",
      icon: <Star className="w-5 h-5 text-accent" />,
      type: "content",
      posts: appointmentFeedContent.reviews
    },
    {
      id: "contact-cta",
      title: "Fale com a casa",
      icon: <Phone className="w-5 h-5 text-accent" />,
      type: "specific",
      customContent: (
        <SocialContactCTA
          contextLabel="Contato rapido"
          headline="Quer falar com a Barba Negra ou ja sair com horario marcado?"
          subheadline="Chama no WhatsApp, veja o horario da casa ou agende agora."
          whatsapp={appointmentBarberShopConfig.whatsapp || ""}
          openingHours={appointmentBarberShopConfig.openingHours || "Consulte horarios"}
          location="Rua Augusta • Sao Paulo"
          primaryActionLabel="Agendar agora"
          onPrimaryAction={handlePrimaryBooking}
        />
      )
    },
    {
      id: "news",
      title: "Na Midia",
      type: "content",
      posts: appointmentFeedContent.news
    },
    {
      id: "social",
      title: "Bastidores",
      type: "content",
      posts: appointmentFeedContent.social
    }
  ]
  
  return (
    <ConversationSelectionProvider value={conversationSelection} vertical={appointmentBarberShopConfig.model}>
      <>
      <BusinessSocialLanding
        config={APPOINTMENT_LANDING_CONFIG}
        stories={appointmentFeedContent.stories}
        sections={sections}
        leadingContent={operationalHero}
        storiesClassName="max-[360px]:py-3.5"
        sectionsClassName="max-[360px]:pt-4 max-[360px]:pb-6"
        conversationResponseResolver={conversationResponseResolver}
        renderConversationVisualBlock={renderConversationVisualBlock}
        onStoryAction={(story) => {
          if (story.isMain) {
            handleStartBooking()
            return true
          }
        }}
        footerLinks={[
          { label: "Sobre", href: "#" },
          { label: "Servicos", href: "#" },
          { label: "Contato", href: "#" },
        ]}
      />
      
      {/* Drawers */}
      <BarberDetailsDrawer
        barber={selectedBarber}
        service={selectedService}
        isOpen={bookingStep === "datetime"}
        onClose={() => setBookingStep(null)}
        onSchedule={handleSchedule}
        onToggleConversationContext={conversationSelection.toggleConversationContextItemWithMorph}
        isInConversation={conversationSelection.isConversationSelected}
      />
      
      <ServicesDrawer
        isOpen={bookingStep === "service"}
        onClose={() => setBookingStep(null)}
        onSelectService={handleSelectService}
        onToggleConversationContext={conversationSelection.toggleConversationContextItemWithMorph}
        isInConversation={conversationSelection.isConversationSelected}
      />
      
      <ProfessionalsDrawer
        service={selectedService}
        isOpen={bookingStep === "professional"}
        onClose={() => setBookingStep(null)}
        onSelectBarber={handleSelectBarber}
        onToggleConversationContext={conversationSelection.toggleConversationContextItemWithMorph}
        isInConversation={conversationSelection.isConversationSelected}
      />
      
      <ConfirmationDrawer
        isOpen={bookingStep === "confirmation"}
        onClose={() => setBookingStep(null)}
        barber={selectedBarber}
        service={bookedService}
        date={bookedDate}
        time={bookedTime}
      />

      <AppointmentArrivalDrawer
        isOpen={arrivalDrawerOpen}
        onClose={handleCloseArrival}
        arrival={appointmentArrivalContext}
        whatsapp={appointmentBarberShopConfig.whatsapp}
      />
      </>
    </ConversationSelectionProvider>
  )
}
