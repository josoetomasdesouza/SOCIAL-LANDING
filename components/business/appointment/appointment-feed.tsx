"use client"

import { useEffect, useState } from "react"
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
  onSelectService 
}: { 
  onStartBooking: (start?: BookingStart) => void
  onSelectService: () => void
}) {
  const popularServices = barberServices.filter(s => s.popular).slice(0, 3)

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
          Agendar agora
        </Button>
        <Button 
          variant="outline"
          className="h-14 flex items-center justify-center gap-2 rounded-2xl"
          onClick={onSelectService}
        >
          <Scissors className="w-5 h-5" />
          Ver servicos
        </Button>
      </div>
      
      {/* Barbeiros */}
      <div>
        <h4 className="font-medium text-foreground mb-3">Escolha um barbeiro</h4>
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
        <h4 className="font-medium text-foreground mb-3">Servicos populares</h4>
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
function BookingInfoModule() {
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
          <p className="font-medium">Confirmacao pelo WhatsApp</p>
          <p className="text-sm text-muted-foreground">Depois de escolher o horario, enviamos o resumo pronto para confirmar.</p>
        </div>
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
}: {
  isOpen: boolean
  onClose: () => void
  initialService?: Service | null
  initialBarber?: Professional | null
}) {
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<Professional | null>(null)
  const [anyProfessional, setAnyProfessional] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [customer, setCustomer] = useState({ name: "", phone: "", note: "" })
  const [confirmed, setConfirmed] = useState(false)

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
    <ActionDrawer isOpen={isOpen} onClose={onClose} title="Agendar horario" subtitle="Escolha servico, profissional e horario" size="full">
      {confirmed ? (
        <div className="text-center space-y-6 py-4">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-green-600" />
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">Horario pronto para confirmar!</h3>
            <p className="text-muted-foreground">Envie os dados pelo WhatsApp para finalizar a reserva.</p>
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
                Confirmar pelo WhatsApp
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
            <h4 className="font-semibold text-foreground mb-3">1. Escolha o servico</h4>
            <div className="space-y-2">
              {barberServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service)
                    setSelectedDate(null)
                    setSelectedTime(null)
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

          <section>
            <h4 className="font-semibold text-foreground mb-3">2. Escolha o profissional</h4>
            <button
              onClick={() => {
                setAnyProfessional(true)
                setSelectedBarber(null)
                setSelectedDate(null)
                setSelectedTime(null)
              }}
              className={`w-full mb-3 p-4 rounded-xl border text-left transition-colors ${
                anyProfessional ? "border-accent bg-accent/10" : "border-border bg-secondary/30 hover:bg-secondary"
              }`}
            >
              <p className="font-medium">Qualquer profissional disponivel</p>
              <p className="text-sm text-muted-foreground">Combina horarios de toda a equipe e reduz o tempo para reservar.</p>
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

          <section>
            <h4 className="font-semibold text-foreground mb-3">3. Escolha data e horario</h4>
            <AppointmentCalendar
              availability={schedulingAvailability}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSelectDate={(date) => {
                setSelectedDate(date)
                setSelectedTime(null)
              }}
              onSelectTime={setSelectedTime}
            />
          </section>

          {selectedTime && (
            <section className="space-y-3">
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
                placeholder="Observacao opcional (ex: quero esse corte da foto)"
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
// DRAWER: SERVICOS
// ========================================
function ServicesDrawer({ 
  isOpen, 
  onClose,
  onSelectService
}: { 
  isOpen: boolean
  onClose: () => void
  onSelectService: (service: Service) => void
}) {
  const categories = [...new Set(barberServices.map(s => s.category))]
  
  return (
    <ActionDrawer isOpen={isOpen} onClose={onClose} title="Servicos" size="lg">
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h4 className="font-medium text-foreground mb-3">{category}</h4>
            <div className="space-y-2">
              {barberServices.filter(s => s.category === category).map((service) => (
                <button
                  key={service.id}
                  onClick={() => onSelectService(service)}
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
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ActionDrawer>
  )
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export function AppointmentFeed() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingStart, setBookingStart] = useState<BookingStart>({})
  const [servicesDrawerOpen, setServicesDrawerOpen] = useState(false)
  
  // Handlers
  const handleStartBooking = (start: BookingStart = {}) => {
    setBookingStart(start)
    setBookingOpen(true)
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
          onSelectService={() => setServicesDrawerOpen(true)}
        />
      )
    },
    {
      id: "styles",
      title: "Estilos em Alta",
      icon: <Scissors className="w-5 h-5 text-accent" />,
      type: "specific",
      customContent: <StylesModule onSelectStyle={handleSelectStyle} />
    },
    {
      id: "info",
      title: "Antes de Agendar",
      icon: <Clock className="w-5 h-5 text-accent" />,
      type: "specific",
      customContent: <BookingInfoModule />
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
      />
      
      <ServicesDrawer
        isOpen={servicesDrawerOpen}
        onClose={() => setServicesDrawerOpen(false)}
        onSelectService={(service) => {
          setServicesDrawerOpen(false)
          handleStartBooking({ service })
        }}
      />
    </>
  )
}
