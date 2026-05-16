"use client"

import { useState } from "react"
import Image from "next/image"
import { Calendar, Clock, MapPin, Users, Ticket, Heart, Star, Play, Newspaper, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BusinessSocialLanding, type BusinessSection } from "../business-social-landing"
import { ActionDrawer } from "../action-drawer"
import { TicketCheckout } from "../checkout-flows"
import { ContextSelectable } from "../context-selectable"
import type { ConversationContextItem } from "../conversational-ai"
import { ConversationSelectionProvider, useConversationSelectionState } from "../conversation-selection-context"
import { eventsConfig, events } from "@/lib/mock-data/events-data"
import { eventsContent } from "@/lib/mock-data/business-content"
import type { Event } from "@/lib/business-types"

type EventView = Event & {
  name?: string
  location?: string | { name?: string; address?: string; city?: string; state?: string }
  price?: number
  capacity?: number
  artists?: Array<string | { name?: string }>
  lineup?: Array<string | { name?: string }>
  tickets?: Array<{ price?: number; available?: boolean | number }>
}

function getEventTitle(event: Event) {
  return event.title || (event as EventView).name || "Evento"
}

function getEventLocation(event: Event) {
  const location = (event as EventView).location
  if (!location) return event.venue?.name || ""
  if (typeof location === "string") return location
  return [location.name, location.city].filter(Boolean).join(", ")
}

function getEventPrice(event: Event) {
  const eventView = event as EventView
  if (typeof eventView.price === "number") return eventView.price

  const ticketPrices = eventView.tickets
    ?.map((ticket) => ticket.price)
    .filter((price): price is number => typeof price === "number") || []

  return ticketPrices.length > 0 ? Math.min(...ticketPrices) : 0
}

function getEventCapacity(event: Event) {
  const eventView = event as EventView
  if (typeof eventView.capacity === "number") return eventView.capacity

  const numericAvailability = eventView.tickets
    ?.map((ticket) => ticket.available)
    .filter((available): available is number => typeof available === "number") || []

  if (numericAvailability.length > 0) {
    return numericAvailability.reduce((sum, available) => sum + available, 0)
  }

  return eventView.tickets?.filter((ticket) => Boolean(ticket.available)).length || 0
}

function getEventArtists(event: Event) {
  const eventView = event as EventView
  const artists = eventView.artists || eventView.lineup || []
  return artists.map((artist) => typeof artist === "string" ? artist : artist.name).filter(Boolean)
}

// ========================================
// MODULO: EVENTOS (OBJETIVO PRINCIPAL)
// ========================================
function EventsModule({ 
  onSelectEvent,
  favorites,
  onToggleFavorite,
  onToggleConversationContext,
  isInConversation,
}: { 
  onSelectEvent: (event: Event) => void
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  return (
    <div className="space-y-4">
      {events.slice(0, 3).map((event) => {
        const eventDate = new Date(event.date)
        const eventTitle = getEventTitle(event)
        const eventLocation = getEventLocation(event)
        const eventPrice = getEventPrice(event)
        const eventCapacity = getEventCapacity(event)
        const contextItem = {
          id: `event-${event.id}`,
          title: eventTitle,
          image: event.image || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=400&fit=crop",
          subtitle: "Evento",
        }
        return (
          <ContextSelectable
            as="div"
            key={event.id}
            onClick={() => onSelectEvent(event)}
            onLongPress={() => onToggleConversationContext?.(contextItem)}
            selected={isInConversation?.(contextItem.id) ?? false}
            className="w-full text-left bg-card rounded-xl overflow-hidden border border-border/50 hover:border-accent/50 transition-colors cursor-pointer"
          >
            <div className="relative aspect-[2/1]">
<Image src={event.image || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=400&fit=crop"} alt={eventTitle} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(event.id) }}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm"
              >
                <Heart className={`w-5 h-5 ${favorites.has(event.id) ? "fill-red-500 text-red-500" : "text-white"}`} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <Badge variant="secondary" className="mb-2 bg-accent text-accent-foreground">
                  {event.category}
                </Badge>
                <h3 className="font-bold text-lg text-white">{eventTitle}</h3>
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
                <span className="truncate">{eventLocation}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-accent">A partir de R$ {eventPrice.toFixed(2).replace(".", ",")}</span>
                <Badge variant="outline" className="gap-1">
                  <Users className="w-3 h-3" />
                  {eventCapacity} vagas
                </Badge>
              </div>
            </div>
          </ContextSelectable>
        )
      })}
    </div>
  )
}

// ========================================
// MODULO: CATEGORIAS DE EVENTOS
// ========================================
function CategoriesModule({
  onToggleConversationContext,
  isInConversation,
}: {
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  const categories = [
    { id: "1", name: "Shows", icon: "🎵", count: 15 },
    { id: "2", name: "Teatro", icon: "🎭", count: 8 },
    { id: "3", name: "Esportes", icon: "⚽", count: 12 },
    { id: "4", name: "Festas", icon: "🎉", count: 20 },
  ]
  
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:-mx-5 sm:px-5">
      {categories.map((cat) => {
        const contextItem = {
          id: `event-category-${cat.id}`,
          title: cat.name,
          image: eventsConfig.logo,
          subtitle: "Categoria",
        }

        return (
          <ContextSelectable
            key={cat.id}
            as="div"
            onLongPress={() => onToggleConversationContext?.(contextItem)}
            selected={isInConversation?.(contextItem.id) ?? false}
            className="flex flex-col items-center gap-2 flex-shrink-0 p-4 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors min-w-[90px]"
          >
            <span className="text-2xl">{cat.icon}</span>
            <span className="text-sm font-medium text-foreground">{cat.name}</span>
          </ContextSelectable>
        )
      })}
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
  onBuyTicket,
  onToggleConversationContext,
  isInConversation,
}: { 
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onBuyTicket: () => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  if (!event) return null
  
  const eventDate = new Date(event.date)
  const eventTitle = getEventTitle(event)
  const eventLocation = getEventLocation(event)
  const eventPrice = getEventPrice(event)
  const eventArtists = getEventArtists(event)
  const eventContextItem = {
    id: `event-${event.id}`,
    title: eventTitle,
    image: event.image || eventsConfig.logo,
    subtitle: "Evento",
  }
  
  return (
    <ActionDrawer isOpen={isOpen} onClose={onClose} title={eventTitle} size="lg">
      <div className="space-y-6">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
          <Image src={event.image || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=400&fit=crop"} alt={eventTitle} fill className="object-cover" />
        </div>
        
        <ContextSelectable
          as="div"
          onLongPress={() => onToggleConversationContext?.(eventContextItem)}
          selected={isInConversation?.(eventContextItem.id) ?? false}
        >
          <Badge variant="secondary" className="mb-2">{event.category}</Badge>
          <h2 className="text-xl font-bold">{eventTitle}</h2>
          <p className="text-muted-foreground mt-2">{event.description}</p>
        </ContextSelectable>
        
        <ContextSelectable
          as="div"
          onLongPress={() => onToggleConversationContext?.(eventContextItem)}
          selected={isInConversation?.(eventContextItem.id) ?? false}
          className="grid grid-cols-2 gap-3"
        >
          <div className="p-3 bg-secondary/50 rounded-xl">
            <Calendar className="w-5 h-5 text-accent mb-1" />
            <p className="font-medium">{eventDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
            <p className="text-sm text-muted-foreground">{event.time}</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-xl">
            <MapPin className="w-5 h-5 text-accent mb-1" />
            <p className="font-medium text-sm line-clamp-2">{eventLocation}</p>
          </div>
        </ContextSelectable>
        
        {eventArtists.length > 0 && (
          <ContextSelectable
            as="div"
            onLongPress={() => onToggleConversationContext?.(eventContextItem)}
            selected={isInConversation?.(eventContextItem.id) ?? false}
          >
            <h4 className="font-medium mb-3">Artistas</h4>
            <div className="flex flex-wrap gap-2">
              {eventArtists.map((artist, idx) => (
                <Badge key={idx} variant="outline">{artist}</Badge>
              ))}
            </div>
          </ContextSelectable>
        )}
        
        <div className="bg-secondary/50 rounded-xl p-4">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-sm text-muted-foreground">A partir de</span>
            <span className="text-2xl font-bold text-accent">R$ {eventPrice.toFixed(2).replace(".", ",")}</span>
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
  const conversationSelection = useConversationSelectionState()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
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
    <ConversationSelectionProvider value={conversationSelection}>
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
        onToggleConversationContext={conversationSelection.toggleConversationContextItem}
        isInConversation={conversationSelection.isConversationSelected}
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
            eventLocation={getEventLocation(selectedEvent)}
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
    </ConversationSelectionProvider>
  )
}
