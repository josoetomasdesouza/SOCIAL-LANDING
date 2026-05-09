"use client"

import { useEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import Image from "next/image"
import { Calendar, Clock, MapPin, MessageCircle, Scissors, Star, Play, ChevronRight, Check, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BusinessSocialLanding, type BusinessPost, type BusinessSection } from "../business-social-landing"
import { ActionDrawer } from "../action-drawer"
import { AppointmentCalendar } from "../appointment-calendar"
import { barberShopConfig, barbers, barberServices, hairStyles } from "@/lib/mock-data/appointment-data"
import { appointmentContent } from "@/lib/mock-data/business-content"
import type { Professional, Service, StyleExample } from "@/lib/business-types"

interface BookingStart {
  service?: Service | null
  barber?: Professional | null
}

type AppointmentVariant = "barbershop" | "nails" | "salon" | "aesthetic"

const APPOINTMENT_EXPERIENCES: Record<AppointmentVariant, {
  labels: {
    scheduleTitle: string
    scheduleSubtitle: string
    primaryAction: string
    secondaryAction: string
    professionalsTitle: string
    professionalSingular: string
    anyProfessional: string
    anyProfessionalDescription: string
    servicesTitle: string
    popularServicesTitle: string
    stylesTitle: string
    infoTitle: string
    confirmationChannel: string
    customerNotePlaceholder: string
  }
  policies: string[]
}> = {
  barbershop: {
    labels: {
      scheduleTitle: "Agendar horario",
      scheduleSubtitle: "Escolha servico, profissional e horario",
      primaryAction: "Agendar agora",
      secondaryAction: "Ver servicos",
      professionalsTitle: "Escolha um barbeiro",
      professionalSingular: "barbeiro",
      anyProfessional: "Qualquer profissional disponivel",
      anyProfessionalDescription: "Combina horarios de toda a equipe e reduz o tempo para reservar.",
      servicesTitle: "Escolha o servico",
      popularServicesTitle: "Servicos populares",
      stylesTitle: "Estilos em Alta",
      infoTitle: "Antes de Agendar",
      confirmationChannel: "WhatsApp",
      customerNotePlaceholder: "Observacao opcional (ex: quero esse corte da foto)",
    },
    policies: [
      "Tolerancia de 10 minutos para atrasos.",
      "Pagamento direto no local.",
      "Cancelamentos devem ser avisados pelo WhatsApp.",
    ],
  },
  nails: {
    labels: {
      scheduleTitle: "Agendar horario",
      scheduleSubtitle: "Escolha servico, profissional e horario",
      primaryAction: "Agendar agora",
      secondaryAction: "Ver servicos",
      professionalsTitle: "Escolha uma profissional",
      professionalSingular: "profissional",
      anyProfessional: "Qualquer profissional disponivel",
      anyProfessionalDescription: "Mostra os proximos horarios da equipe para facilitar a reserva.",
      servicesTitle: "Escolha o servico",
      popularServicesTitle: "Servicos populares",
      stylesTitle: "Inspiracoes em alta",
      infoTitle: "Antes de Agendar",
      confirmationChannel: "WhatsApp",
      customerNotePlaceholder: "Observacao opcional (ex: quero essa esmaltacao)",
    },
    policies: [
      "Chegue com 10 minutos de antecedencia.",
      "Pagamento direto no local.",
      "Avise pelo WhatsApp para remarcar ou cancelar.",
    ],
  },
  salon: {
    labels: {
      scheduleTitle: "Agendar horario",
      scheduleSubtitle: "Escolha servico, profissional e horario",
      primaryAction: "Agendar agora",
      secondaryAction: "Ver servicos",
      professionalsTitle: "Escolha uma profissional",
      professionalSingular: "profissional",
      anyProfessional: "Qualquer profissional disponivel",
      anyProfessionalDescription: "Combina horarios de toda a equipe e reduz o tempo para reservar.",
      servicesTitle: "Escolha o servico",
      popularServicesTitle: "Servicos populares",
      stylesTitle: "Referencias em alta",
      infoTitle: "Antes de Agendar",
      confirmationChannel: "WhatsApp",
      customerNotePlaceholder: "Observacao opcional (ex: tenho uma referencia)",
    },
    policies: [
      "Alguns procedimentos podem exigir avaliacao previa.",
      "Pagamento direto no local.",
      "Cancelamentos devem ser avisados pelo WhatsApp.",
    ],
  },
  aesthetic: {
    labels: {
      scheduleTitle: "Agendar avaliacao",
      scheduleSubtitle: "Escolha tratamento, especialista e horario",
      primaryAction: "Agendar avaliacao",
      secondaryAction: "Ver tratamentos",
      professionalsTitle: "Escolha uma especialista",
      professionalSingular: "especialista",
      anyProfessional: "Qualquer especialista disponivel",
      anyProfessionalDescription: "Mostra os proximos horarios da equipe para facilitar a reserva.",
      servicesTitle: "Escolha o tratamento",
      popularServicesTitle: "Tratamentos populares",
      stylesTitle: "Resultados em destaque",
      infoTitle: "Antes de Agendar",
      confirmationChannel: "WhatsApp",
      customerNotePlaceholder: "Observacao opcional (ex: objetivo do tratamento)",
    },
    policies: [
      "Procedimentos podem exigir avaliacao previa.",
      "Chegue com 10 minutos de antecedencia.",
      "Cancelamentos devem ser avisados pelo WhatsApp.",
    ],
  },
}

const appointmentExperience = APPOINTMENT_EXPERIENCES.barbershop

function getAggregatedAvailability(professionals: Professional[]) {
  const slotsByDate = new Map<string, Set<string>>()

  professionals.forEach((professional) => {
    professional.availability?.forEach((day) => {
      const dateSlots = slotsByDate.get(day.date) || new Set<string>()
      day.slots
        .filter((slot) => slot.available)
        .forEach((slot) => dateSlots.add(slot.time))
      slotsByDate.set(day.date, dateSlots)
    })
  })

  return Array.from(slotsByDate.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, slots]) => ({
      date,
      slots: Array.from(slots)
        .sort()
        .map((time) => ({ time, available: true })),
    }))
}

function getServiceForAppointmentPost(post: BusinessPost) {
  if (post.serviceId) {
    const service = barberServices.find((item) => item.id === post.serviceId)
    if (service) return service
  }

  const text = `${post.title} ${post.description || ""}`.toLowerCase()

  return barberServices.find((service) => {
    const serviceName = service.name.toLowerCase()
    const category = service.category.toLowerCase()
    return text.includes(serviceName) || text.includes(category)
  }) || barberServices.find((service) => (
    text.includes("barba") ? service.category.toLowerCase() === "barba" :
    text.includes("degrade") || text.includes("corte") ? service.category.toLowerCase() === "corte" :
    text.includes("combo") ? service.category.toLowerCase() === "combo" :
    false
  )) || barberServices.find(service => service.popular) || barberServices[0]
}

// ========================================
// MODULO: AGENDAR HORARIO (OBJETIVO PRINCIPAL)
// ========================================
function ScheduleModule({ 
  onStartBooking,
  onSelectService,
  experience,
}: { 
  onStartBooking: (start?: BookingStart) => void
  onSelectService: () => void
  experience: typeof appointmentExperience
}) {
  const popularServices = barberServices.filter(s => s.popular).slice(0, 3)
  const { labels } = experience

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="default"
          className="h-14 flex items-center justify-center gap-2 rounded-2xl"
          onClick={() => onStartBooking()}
        >
          <Calendar className="w-5 h-5" />
          {labels.primaryAction}
        </Button>
        <Button 
          variant="outline"
          className="h-14 flex items-center justify-center gap-2 rounded-2xl"
          onClick={onSelectService}
        >
          <Scissors className="w-5 h-5" />
          {labels.secondaryAction}
        </Button>
      </div>
      
      {/* Barbeiros */}
      <div>
        <h4 className="font-medium text-foreground mb-3">{labels.professionalsTitle}</h4>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {barbers.map((barber) => (
            <button
              key={barber.id}
              onClick={() => onStartBooking({ barber })}
              className="flex flex-col items-center gap-2 flex-shrink-0 group"
            >
              <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-border group-hover:ring-accent transition-colors">
                <Image src={barber.avatar} alt={barber.name} fill className="object-cover" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{barber.name.split(" ")[0]}</p>
                <div className="flex items-center gap-1 justify-center">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">{barber.rating}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Servicos Populares */}
      <div>
        <h4 className="font-medium text-foreground mb-3">{labels.popularServicesTitle}</h4>
        <div className="space-y-2">
          {popularServices.map((service) => (
            <button
              key={service.id}
              onClick={() => onStartBooking({ service })}
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
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ========================================
// MODULO: ESTILOS EM ALTA
// ========================================
function StylesModule({ onSelectStyle }: { onSelectStyle: (style: StyleExample) => void }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:-mx-5 sm:px-5">
      {hairStyles.slice(0, 6).map((style) => (
        <button
          key={style.id}
          onClick={() => onSelectStyle(style)}
          className="flex-shrink-0 group"
        >
          <div className="relative w-32 h-40 rounded-xl overflow-hidden">
            <Image src={style.image} alt={style.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-sm font-medium text-white">{style.name}</p>
              <Badge variant="secondary" className="mt-1 text-xs bg-white/20 text-white border-0">
                {style.trend ? "Em alta" : style.category}
              </Badge>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

// ========================================
// MODULO: INFORMACOES PARA FECHAMENTO
// ========================================
function BookingInfoModule({ experience }: { experience: typeof appointmentExperience }) {
  const { policies } = experience

  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
        <Clock className="w-5 h-5 text-accent flex-shrink-0" />
        <div>
          <p className="font-medium">Horario de atendimento</p>
          <p className="text-sm text-muted-foreground">{barberShopConfig.openingHours}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
        <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
        <div>
          <p className="font-medium">Endereco</p>
          <p className="text-sm text-muted-foreground">{barberShopConfig.address}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
        <MessageCircle className="w-5 h-5 text-accent flex-shrink-0" />
        <div>
          <p className="font-medium">Confirmacao pelo {experience.labels.confirmationChannel}</p>
          <p className="text-sm text-muted-foreground">Depois de escolher o horario, enviamos o resumo pronto para confirmar.</p>
        </div>
      </div>
      <div className="p-4 rounded-xl border border-border bg-card">
        <p className="font-medium mb-2">Politica de agendamento</p>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {policies.map((policy) => (
            <li key={policy} className="flex gap-2">
              <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <span>{policy}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ========================================
// DRAWER: FUNIL DE AGENDAMENTO
// ========================================
function BookingDrawer({
  isOpen,
  onClose,
  initialService,
  initialBarber,
  experience,
}: {
  isOpen: boolean
  onClose: () => void
  initialService?: Service | null
  initialBarber?: Professional | null
  experience: typeof appointmentExperience
}) {
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<Professional | null>(null)
  const [anyProfessional, setAnyProfessional] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [customer, setCustomer] = useState({ name: "", phone: "", note: "" })
  const [confirmed, setConfirmed] = useState(false)
  const professionalStepRef = useRef<HTMLElement>(null)
  const scheduleStepRef = useRef<HTMLElement>(null)
  const timeStepRef = useRef<HTMLDivElement>(null)
  const customerStepRef = useRef<HTMLElement>(null)

  const scrollToStep = (ref: RefObject<HTMLElement>) => {
    window.setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  useEffect(() => {
    if (!isOpen) return

    setSelectedService(initialService || barberServices.find(service => service.popular) || barberServices[0] || null)
    setSelectedBarber(initialBarber || null)
    setAnyProfessional(!initialBarber)
    setSelectedDate(null)
    setSelectedTime(null)
    setCustomer({ name: "", phone: "", note: "" })
    setConfirmed(false)
  }, [isOpen, initialService, initialBarber])

  if (!isOpen) return null

  const { labels } = experience
  const schedulingAvailability = anyProfessional
    ? getAggregatedAvailability(barbers)
    : selectedBarber?.availability || []
  const formattedDate = selectedDate
    ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
    : ""
  const whatsappMessage = encodeURIComponent(
    `Ola! Quero confirmar meu agendamento na ${barberShopConfig.name}:\n` +
    `Servico: ${selectedService?.name || "A definir"}\n` +
    `Profissional: ${anyProfessional ? "Qualquer profissional disponivel" : selectedBarber?.name || "A definir"}\n` +
    `Data: ${formattedDate}\n` +
    `Horario: ${selectedTime || ""}\n` +
    `Nome: ${customer.name}\n` +
    `WhatsApp: ${customer.phone}` +
    (customer.note ? `\nObservacao: ${customer.note}` : "")
  )
  const whatsappUrl = `https://wa.me/${barberShopConfig.whatsapp}?text=${whatsappMessage}`

  return (
    <ActionDrawer isOpen={isOpen} onClose={onClose} title={labels.scheduleTitle} subtitle={labels.scheduleSubtitle} size="full">
      {confirmed ? (
        <div className="text-center space-y-6 py-4">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-green-600" />
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">Horario pronto para confirmar!</h3>
            <p className="text-muted-foreground">Envie os dados pelo {labels.confirmationChannel} para finalizar a reserva.</p>
          </div>

          <div className="bg-secondary/50 rounded-xl p-4 text-left space-y-3">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Servico</span>
              <span className="font-medium text-right">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Profissional</span>
              <span className="font-medium text-right">{anyProfessional ? "Qualquer profissional disponivel" : selectedBarber?.name}</span>
            </div>
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Data</span>
              <span className="font-medium text-right">{formattedDate}</span>
            </div>
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Horario</span>
              <span className="font-medium text-right">{selectedTime}</span>
            </div>
            {selectedService && (
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Valor</span>
                <span className="font-medium text-right">R$ {selectedService.price}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button className="w-full gap-2" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Phone className="w-4 h-4" />
                Confirmar pelo {labels.confirmationChannel}
              </a>
            </Button>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h4 className="font-semibold text-foreground mb-3">1. {labels.servicesTitle}</h4>
            <div className="space-y-2">
              {barberServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service)
                    setSelectedDate(null)
                    setSelectedTime(null)
                    scrollToStep(professionalStepRef)
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                    selectedService?.id === service.id ? "border-accent bg-accent/10" : "border-border bg-secondary/30 hover:bg-secondary"
                  }`}
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={service.image || barberShopConfig.logo} alt={service.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{service.name}</p>
                      {service.popular && <Badge className="text-xs">Mais pedido</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{service.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{service.duration} min</p>
                  </div>
                  <p className="font-bold text-accent">R$ {service.price}</p>
                </button>
              ))}
            </div>
          </section>

          <section ref={professionalStepRef} className="scroll-mt-4">
            <h4 className="font-semibold text-foreground mb-3">2. {labels.professionalsTitle}</h4>
            <button
              onClick={() => {
                setAnyProfessional(true)
                setSelectedBarber(null)
                setSelectedDate(null)
                setSelectedTime(null)
                scrollToStep(scheduleStepRef)
              }}
              className={`w-full mb-3 p-4 rounded-xl border text-left transition-colors ${
                anyProfessional ? "border-accent bg-accent/10" : "border-border bg-secondary/30 hover:bg-secondary"
              }`}
            >
              <p className="font-medium">{labels.anyProfessional}</p>
              <p className="text-sm text-muted-foreground">{labels.anyProfessionalDescription}</p>
            </button>

            <div className="grid grid-cols-2 gap-3">
              {barbers.map((barber) => (
                <button
                  key={barber.id}
                  onClick={() => {
                    setAnyProfessional(false)
                    setSelectedBarber(barber)
                    setSelectedDate(null)
                    setSelectedTime(null)
                    scrollToStep(scheduleStepRef)
                  }}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    !anyProfessional && selectedBarber?.id === barber.id ? "border-accent bg-accent/10" : "border-border bg-secondary/30 hover:bg-secondary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image src={barber.avatar} alt={barber.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{barber.name.split(" ")[0]}</p>
                      <p className="text-xs text-muted-foreground truncate">{barber.role}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{barber.rating}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section ref={scheduleStepRef} className="scroll-mt-4">
            <h4 className="font-semibold text-foreground mb-3">3. Escolha data e horario</h4>
            <AppointmentCalendar
              availability={schedulingAvailability}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              timeSlotsRef={timeStepRef}
              onSelectDate={(date) => {
                setSelectedDate(date)
                setSelectedTime(null)
                scrollToStep(timeStepRef)
              }}
              onSelectTime={(time) => {
                setSelectedTime(time)
                scrollToStep(customerStepRef)
              }}
            />
          </section>

          {selectedTime && (
            <section ref={customerStepRef} className="space-y-3 scroll-mt-4">
              <h4 className="font-semibold text-foreground">4. Seus dados</h4>
              <Input
                placeholder="Nome completo"
                value={customer.name}
                onChange={(event) => setCustomer(prev => ({ ...prev, name: event.target.value }))}
              />
              <Input
                placeholder="WhatsApp"
                value={customer.phone}
                onChange={(event) => setCustomer(prev => ({ ...prev, phone: event.target.value }))}
              />
              <Textarea
                placeholder={labels.customerNotePlaceholder}
                value={customer.note}
                onChange={(event) => setCustomer(prev => ({ ...prev, note: event.target.value }))}
                rows={3}
              />
            </section>
          )}

          <Button
            className="w-full h-12"
            disabled={!selectedService || !selectedDate || !selectedTime || !customer.name || !customer.phone}
            onClick={() => setConfirmed(true)}
          >
            Confirmar agendamento
          </Button>
        </div>
      )}
    </ActionDrawer>
  )
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export function AppointmentFeed() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingStart, setBookingStart] = useState<BookingStart>({})
  const experience = appointmentExperience
  
  // Handlers
  const handleStartBooking = (start: BookingStart = {}) => {
    setBookingStart(start)
    setBookingOpen(true)
  }

  const handleOpenServices = () => {
    handleStartBooking({ service: null })
  }
  
  const handleSelectStyle = (style: StyleExample) => {
    const matchingService = barberServices.find((service) => (
      service.name.toLowerCase().includes(style.category.toLowerCase()) ||
      style.name.toLowerCase().includes(service.name.toLowerCase()) ||
      service.category.toLowerCase() === style.category.toLowerCase()
    ))

    handleStartBooking({ service: matchingService || barberServices.find(service => service.popular) || barberServices[0] })
  }
  
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
          onSelectService={handleOpenServices}
          experience={experience}
        />
      )
    },
    {
      id: "styles",
      title: experience.labels.stylesTitle,
      icon: <Scissors className="w-5 h-5 text-accent" />,
      type: "specific",
      customContent: <StylesModule onSelectStyle={handleSelectStyle} />
    },
    {
      id: "info",
      title: experience.labels.infoTitle,
      icon: <Clock className="w-5 h-5 text-accent" />,
      type: "specific",
      customContent: <BookingInfoModule experience={experience} />
    },
    {
      id: "videos",
      title: "Tutoriais e Tendencias",
      icon: <Play className="w-5 h-5 text-accent" />,
      type: "content",
      posts: appointmentContent.videos
    },
    {
      id: "reviews",
      title: "O Que Dizem",
      icon: <Star className="w-5 h-5 text-accent" />,
      type: "content",
      posts: appointmentContent.reviews
    },
    {
      id: "news",
      title: "Na Midia",
      type: "content",
      posts: appointmentContent.news
    },
    {
      id: "social",
      title: "Bastidores",
      type: "content",
      posts: appointmentContent.social
    }
  ]
  
  return (
    <>
      <BusinessSocialLanding
        config={barberShopConfig}
        stories={appointmentContent.stories}
        sections={sections}
        getPostActionLabel={(post) => {
          if (post.type === "review") return "Agendar com base nessa avaliacao"
          if (post.type === "video" || post.type === "video-vertical") return "Agendar esse estilo"
          if (post.type === "social") return "Agendar agora"
          return undefined
        }}
        onPostAction={(post) => {
          handleStartBooking({ service: getServiceForAppointmentPost(post) })
        }}
        onStoryClick={(story) => {
          if (story.isMain) {
            handleStartBooking()
          }
        }}
        footerLinks={[
          { label: "Sobre", href: "#" },
          { label: "Servicos", href: "#" },
          { label: "Contato", href: "#" },
        ]}
      />
      
      {/* Drawers */}
      <BookingDrawer
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialService={bookingStart.service}
        initialBarber={bookingStart.barber}
        experience={experience}
      />
    </>
  )
}
