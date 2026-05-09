"use client"

import { useState } from "react"
import Image from "next/image"
import { Calendar, Clock, MapPin, Users, Ticket, Heart, Star, Play, Newspaper, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BusinessSocialLanding, type BusinessSection } from "../business-social-landing"
import { ActionDrawer } from "../action-drawer"
import { TicketCheckout } from "../checkout-flows"
import { eventsConfig, events } from "@/lib/mock-data/events-data"
import { eventsContent } from "@/lib/mock-data/business-content"
import type { Event } from "@/lib/business-types"

type EventLike = Event & {
  name?: string
  location?: Event["venue"]
  price?: number
  capacity?: number
  artists?: string[]
}

function getEventTitle(event: EventLike) {
  return event.title || event.name || "Evento"
}

function getEventVenue(event: EventLike) {
  return event.venue || event.location
}

function getEventLocationLabel(event: EventLike) {
  const venue = getEventVenue(event)
  if (!venue) return "Local a confirmar"
  if (typeof venue === "string") return venue
  return [venue.name, venue.city, venue.state].filter(Boolean).join(", ")
}

function getAvailableTickets(event: EventLike) {
  return event.tickets?.filter((ticket) => {
    if (typeof ticket.available === "boolean") return ticket.available
    return Number(ticket.available) > 0
  }) || []
}

function getEventPrice(event: EventLike) {
  if (typeof event.price === "number") return event.price
  const ticketPrices = getAvailableTickets(event).map((ticket) => ticket.price)
  return ticketPrices.length ? Math.min(...ticketPrices) : 0
}

function getEventCapacity(event: EventLike) {
  if (typeof event.capacity === "number") return event.capacity
  return getAvailableTickets(event).reduce((sum, ticket) => (
    sum + (typeof ticket.available === "number" ? ticket.available : 1)
  ), 0)
}

function getEventArtists(event: EventLike) {
  if (event.artists?.length) {
    return event.artists.map((artist) => typeof artist === "string" ? artist : artist.name)
  }
  return event.lineup || []
}

// ========================================
// MODULO: EVENTOS (OBJETIVO PRINCIPAL)
// ========================================
function EventsModule({ 
  onSelectEvent,
  favorites,
  onToggleFavorite
}: { 
  onSelectEvent: (event: EventLike) => void
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      {events.slice(0, 3).map((event) => {
        const eventDate = new Date(event.date)
        const title = getEventTitle(event)
        const price = getEventPrice(event)
        const capacity = getEventCapacity(event)
        const location = getEventLocationLabel(event)

        return (
          <div
            key={event.id}
            onClick={() => onSelectEvent(event)}
            className="w-full text-left bg-card rounded-xl overflow-hidden border border-border/50 hover:border-accent/50 transition-colors cursor-pointer"
          >
            <div className="relative aspect-[2/1]">
              <Image src={event.image || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=400&fit=crop"} alt={title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(event.id) }}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm"
              >
                <Heart className={`w-5 h-5 ${favorites.has(event.id) ? "fill-red-500 text-red-500" : "text-white"}`} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <Badge variant="secondary" className="mb-2 bg-accent text-accent-foreground">
                  {event.category || "Evento"}
                </Badge>
                <h3 className="font-bold text-lg text-white">{title}</h3>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {eventDate.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {event.time}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{location}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-accent">A partir de R$ {price.toFixed(2).replace(".", ",")}</span>
                <Badge variant="outline" className="gap-1">
                  <Users className="w-3 h-3" />
                  {capacity} vagas
                </Badge>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ========================================
// MODULO: CATEGORIAS DE EVENTOS
// ========================================
function CategoriesModule() {
  const categories = [
    { id: "1", name: "Shows", icon: "🎵", count: 15 },
    { id: "2", name: "Teatro", icon: "🎭", count: 8 },
    { id: "3", name: "Esportes", icon: "⚽", count: 12 },
    { id: "4", name: "Festas", icon: "🎉", count: 20 },
  ]
  
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:-mx-5 sm:px-5">
      {categories.map((cat) => (
        <button key={cat.id} className="flex flex-col items-center gap-2 flex-shrink-0 p-4 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors min-w-[90px]">
          <span className="text-2xl">{cat.icon}</span>
          <span className="text-sm font-medium text-foreground">{cat.name}</span>
        </button>
      ))}
    </div>
  )
}

// ========================================
// DRAWER: DETALHES DO EVENTO
// ========================================
function EventDetailDrawer({ 
  event, 
  isOpen, 
  onClose,
  onBuyTicket
}: { 
  event: EventLike | null
  isOpen: boolean
  onClose: () => void
  onBuyTicket: () => void
}) {
  if (!event) return null
  
  const eventDate = new Date(event.date)
  const title = getEventTitle(event)
  const price = getEventPrice(event)
  const location = getEventLocationLabel(event)
  const artists = getEventArtists(event)
  
  return (
    <ActionDrawer isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-6">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
          <Image src={event.image || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=400&fit=crop"} alt={title} fill className="object-cover" />
        </div>
        
        <div>
          <Badge variant="secondary" className="mb-2">{event.category || "Evento"}</Badge>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-muted-foreground mt-2">{event.description}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-secondary/50 rounded-xl">
            <Calendar className="w-5 h-5 text-accent mb-1" />
            <p className="font-medium">{eventDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
            <p className="text-sm text-muted-foreground">{event.time}</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-xl">
            <MapPin className="w-5 h-5 text-accent mb-1" />
            <p className="font-medium text-sm line-clamp-2">{location}</p>
          </div>
        </div>
        
        {artists.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Artistas</h4>
            <div className="flex flex-wrap gap-2">
              {artists.map((artist, idx) => (
                <Badge key={idx} variant="outline">{artist}</Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-secondary/50 rounded-xl p-4">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-sm text-muted-foreground">A partir de</span>
            <span className="text-2xl font-bold text-accent">R$ {price.toFixed(2).replace(".", ",")}</span>
          </div>
          <Button className="w-full h-12" onClick={onBuyTicket}>
            <Ticket className="w-5 h-5 mr-2" />
            Comprar ingresso
          </Button>
        </div>
      </div>
    </ActionDrawer>
  )
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export function EventsFeed() {
  const [selectedEvent, setSelectedEvent] = useState<EventLike | null>(null)
  const [eventDrawerOpen, setEventDrawerOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  
  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }
  
  const sections: BusinessSection[] = [
    {
      id: "events",
      title: "Proximos Eventos",
      icon: <Calendar className="w-5 h-5 text-accent" />,
      type: "primary-action",
      customContent: (
        <EventsModule 
          onSelectEvent={(e) => { setSelectedEvent(e); setEventDrawerOpen(true) }}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
      )
    },
    {
      id: "categories",
      title: "Categorias",
      type: "specific",
      customContent: <CategoriesModule />
    },
    {
      id: "videos",
      title: "Bastidores",
      icon: <Play className="w-5 h-5 text-accent" />,
      type: "content",
      posts: eventsContent.videos
    },
    {
      id: "reviews",
      title: "Avaliacoes",
      icon: <Star className="w-5 h-5 text-accent" />,
      type: "content",
      posts: eventsContent.reviews
    },
    {
      id: "news",
      title: "Na Midia",
      icon: <Newspaper className="w-5 h-5 text-accent" />,
      type: "content",
      posts: eventsContent.news
    },
    {
      id: "social",
      title: "Nas Redes",
      type: "content",
      posts: eventsContent.social
    }
  ]
  
  return (
    <>
      <BusinessSocialLanding
        config={eventsConfig}
        stories={eventsContent.stories}
        sections={sections}
        footerLinks={[
          { label: "Sobre", href: "#" },
          { label: "Eventos", href: "#" },
          { label: "Contato", href: "#" },
        ]}
      />
      
      <EventDetailDrawer
        event={selectedEvent}
        isOpen={eventDrawerOpen}
        onClose={() => setEventDrawerOpen(false)}
        onBuyTicket={() => {
          setEventDrawerOpen(false)
          setCheckoutOpen(true)
        }}
      />
      
      <ActionDrawer
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Comprar Ingresso"
        size="lg"
      >
        {selectedEvent && (
          <TicketCheckout
            eventName={getEventTitle(selectedEvent)}
            eventDate={selectedEvent.date}
            eventTime={selectedEvent.time}
            eventLocation={getEventLocationLabel(selectedEvent)}
            ticketPrice={getEventPrice(selectedEvent)}
            onComplete={() => {
              setCheckoutOpen(false)
              setSelectedEvent(null)
            }}
            onBack={() => {
              setCheckoutOpen(false)
              setEventDrawerOpen(true)
            }}
          />
        )}
      </ActionDrawer>
    </>
  )
}
