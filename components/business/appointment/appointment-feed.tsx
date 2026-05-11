"use client"

import { useState } from "react"
import Image from "next/image"
import { Calendar, Clock, Scissors, Star, Play, ChevronRight, Check, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BusinessSocialLanding, type BusinessSection } from "../business-social-landing"
import { ActionDrawer } from "../action-drawer"
import { AppointmentCalendar } from "../appointment-calendar"
import { SocialCompactHero } from "../social-compact-hero"
import { SocialContactCTA } from "../social-contact-cta"
import { barberShopConfig, barbers, barberServices, hairStyles } from "@/lib/mock-data/appointment-data"
import { appointmentContent } from "@/lib/mock-data/business-content"
import type { Professional, Service, StyleExample } from "@/lib/business-types"

// ========================================
// MODULO: AGENDAR HORARIO (OBJETIVO PRINCIPAL)
// ========================================
function ScheduleModule({ 
  onSelectBarber,
  onSelectService 
}: { 
  onSelectBarber: (barber: Professional) => void
  onSelectService: () => void
}) {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="default"
          className="h-14 flex items-center justify-center gap-2 rounded-2xl"
          onClick={() => onSelectBarber(barbers[0])}
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
              onClick={() => onSelectBarber(barber)}
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
          {barberServices.filter(s => s.popular).slice(0, 3).map((service) => (
            <button
              key={service.id}
              onClick={() => onSelectBarber(barbers[0])}
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
// DRAWER: DETALHES DO BARBEIRO + AGENDAMENTO
// ========================================
function BarberDetailsDrawer({ 
  barber, 
  isOpen, 
  onClose,
  onSchedule
}: { 
  barber: Professional | null
  isOpen: boolean
  onClose: () => void
  onSchedule: (barber: Professional, date: string, time: string) => void
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  
  if (!barber) return null
  
  return (
    <ActionDrawer isOpen={isOpen} onClose={onClose} title={barber.name} size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
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
        </div>
        
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
            onSelectDate={setSelectedDate}
            onSelectTime={setSelectedTime}
          />
        </div>
        
        {/* Botao de agendar */}
        <Button 
          className="w-full h-12"
          disabled={!selectedDate || !selectedTime}
          onClick={() => {
            if (selectedDate && selectedTime) {
              onSchedule(barber, selectedDate, selectedTime)
            }
          }}
        >
          Confirmar agendamento
        </Button>
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
// DRAWER: CONFIRMACAO
// ========================================
function ConfirmationDrawer({ 
  isOpen, 
  onClose,
  barber,
  date,
  time
}: { 
  isOpen: boolean
  onClose: () => void
  barber: Professional | null
  date: string | null
  time: string | null
}) {
  if (!barber || !date || !time) return null
  
  const formattedDate = new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  })
  
  return (
    <ActionDrawer isOpen={isOpen} onClose={onClose} title="Agendamento confirmado!" size="md">
      <div className="text-center space-y-6 py-4">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-2">Tudo certo!</h3>
          <p className="text-muted-foreground">Seu horario esta reservado.</p>
        </div>
        
        <div className="bg-secondary/50 rounded-xl p-4 text-left space-y-3">
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
          <Button className="w-full" onClick={onClose}>
            Adicionar ao calendario
          </Button>
          <Button variant="outline" className="w-full gap-2" onClick={onClose}>
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
  const [selectedBarber, setSelectedBarber] = useState<Professional | null>(null)
  const [barberDrawerOpen, setBarberDrawerOpen] = useState(false)
  const [servicesDrawerOpen, setServicesDrawerOpen] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [bookedDate, setBookedDate] = useState<string | null>(null)
  const [bookedTime, setBookedTime] = useState<string | null>(null)
  
  // Handlers
  const handleSelectBarber = (barber: Professional) => {
    setSelectedBarber(barber)
    setBarberDrawerOpen(true)
  }

  const handlePrimaryBooking = () => {
    handleSelectBarber(barbers[0])
  }
  
  const handleSelectStyle = (style: StyleExample) => {
    setSelectedBarber(barbers[0])
    setBarberDrawerOpen(true)
  }
  
  const handleSchedule = (barber: Professional, date: string, time: string) => {
    setBookedDate(date)
    setBookedTime(time)
    setBarberDrawerOpen(false)
    setConfirmationOpen(true)
  }
  
  // Secoes do feed
  const sections: BusinessSection[] = [
    {
      id: "schedule",
      title: "Agendar Horario",
      icon: <Calendar className="w-5 h-5 text-accent" />,
      type: "primary-action",
      customContent: (
        <>
          <ScheduleModule 
            onSelectBarber={handleSelectBarber}
            onSelectService={() => setServicesDrawerOpen(true)}
          />
          <SocialCompactHero
            variant="editorial"
            brandLogo={barberShopConfig.logo}
            brandName={barberShopConfig.name}
            eyebrow="Sobre a casa"
            headline="Na Barba Negra, corte preciso e barba bem feita andam juntos."
            subheadline="Agende rapido e continue explorando o feed."
          />
        </>
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
      id: "contact-cta",
      title: "Fale com a casa",
      icon: <Phone className="w-5 h-5 text-accent" />,
      type: "specific",
      customContent: (
        <SocialContactCTA
          headline="Quer falar com a Barba Negra ou ja sair com horario marcado?"
          whatsapp={barberShopConfig.whatsapp || ""}
          openingHours={barberShopConfig.openingHours || "Consulte horarios"}
          location="Rua Augusta, Sao Paulo"
          primaryActionLabel="Agendar horario"
          onPrimaryAction={handlePrimaryBooking}
        />
      )
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
        onStoryClick={(story) => {
          if (story.isMain) {
            handlePrimaryBooking()
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
        isOpen={barberDrawerOpen}
        onClose={() => setBarberDrawerOpen(false)}
        onSchedule={handleSchedule}
      />
      
      <ServicesDrawer
        isOpen={servicesDrawerOpen}
        onClose={() => setServicesDrawerOpen(false)}
        onSelectService={(service) => {
          setServicesDrawerOpen(false)
          handleSelectBarber(barbers[0])
        }}
      />
      
      <ConfirmationDrawer
        isOpen={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        barber={selectedBarber}
        date={bookedDate}
        time={bookedTime}
      />
    </>
  )
}
