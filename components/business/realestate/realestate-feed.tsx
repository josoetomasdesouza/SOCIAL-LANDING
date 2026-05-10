"use client"

import { useState } from "react"
import Image from "next/image"
import { MapPin, Bed, Bath, Car, Maximize, Heart, Phone, Home, Building, Star, Play, Newspaper, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BusinessSocialLanding, type BusinessSection } from "../business-social-landing"
import { ActionDrawer } from "../action-drawer"
import { ScheduleVisitForm } from "../checkout-flows"
import { realestateConfig, properties, propertyTypes } from "@/lib/mock-data/realestate-data"
import { realestateContent } from "@/lib/mock-data/business-content"
import type { Property } from "@/lib/business-types"

function getPropertyLocationText(property: Property) {
  const neighborhood = property.neighborhood || property.address?.neighborhood
  const city = property.city || property.address?.city

  return [neighborhood, city].filter(Boolean).join(", ") || "Localizacao sob consulta"
}

function getPropertyAddressText(property: Property) {
  const street = property.address?.street
  const neighborhood = property.neighborhood || property.address?.neighborhood
  const city = property.city || property.address?.city
  const state = property.address?.state

  return [street, neighborhood, city, state].filter(Boolean).join(", ") || "Endereco sob consulta"
}

// ========================================
// MODULO: IMOVEIS EM DESTAQUE (OBJETIVO PRINCIPAL)
// ========================================
function PropertiesModule({ 
  onSelectProperty,
  favorites,
  onToggleFavorite
}: { 
  onSelectProperty: (property: Property) => void
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      {properties.slice(0, 3).map((property) => (
        <button
          key={property.id}
          onClick={() => onSelectProperty(property)}
          className="w-full text-left bg-card rounded-xl overflow-hidden border border-border/50 hover:border-accent/50 transition-colors"
        >
          <div className="relative aspect-[16/9]">
            <Image src={property.images[0]} alt={property.title} fill className="object-cover" />
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(property.id) }}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm"
            >
              <Heart className={`w-5 h-5 ${favorites.has(property.id) ? "fill-red-500 text-red-500" : "text-white"}`} />
            </button>
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
              {property.type === "sale" ? "Venda" : "Aluguel"}
            </Badge>
          </div>
          <div className="p-4">
            <h3 className="font-semibold line-clamp-1">{property.title}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{getPropertyLocationText(property)}</span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                {property.bedrooms}
              </span>
              <span className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                {property.bathrooms}
              </span>
              {property.parkingSpaces && (
                <span className="flex items-center gap-1">
                  <Car className="w-4 h-4" />
                  {property.parkingSpaces}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Maximize className="w-4 h-4" />
                {property.area}m2
              </span>
            </div>
            <p className="font-bold text-accent text-lg mt-3">
              R$ {property.price.toLocaleString("pt-BR")}
              {property.type === "rent" && <span className="text-sm font-normal text-muted-foreground">/mes</span>}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}

// ========================================
// MODULO: TIPOS DE IMOVEL
// ========================================
function PropertyTypesModule() {
  const types = [
    { id: "1", name: "Apartamento", icon: "🏢" },
    { id: "2", name: "Casa", icon: "🏠" },
    { id: "3", name: "Comercial", icon: "🏪" },
    { id: "4", name: "Terreno", icon: "📐" },
  ]
  
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:-mx-5 sm:px-5">
      {types.map((type) => (
        <button key={type.id} className="flex flex-col items-center gap-2 flex-shrink-0 p-4 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors min-w-[90px]">
          <span className="text-2xl">{type.icon}</span>
          <span className="text-sm font-medium text-foreground">{type.name}</span>
        </button>
      ))}
    </div>
  )
}

// ========================================
// DRAWER: DETALHES DO IMOVEL
// ========================================
function PropertyDetailDrawer({ 
  property, 
  isOpen, 
  onClose,
  onScheduleVisit,
  onContact
}: { 
  property: Property | null
  isOpen: boolean
  onClose: () => void
  onScheduleVisit: () => void
  onContact: () => void
}) {
  const [currentImage, setCurrentImage] = useState(0)
  
  if (!property) return null
  
  return (
    <ActionDrawer isOpen={isOpen} onClose={onClose} title={property.title} size="lg">
      <div className="space-y-6">
        {/* Galeria */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
          <Image src={property.images[currentImage]} alt={property.title} fill className="object-cover" />
          {property.images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
              {property.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${idx === currentImage ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Info */}
        <div>
          <Badge className="mb-2">{property.type === "sale" ? "Venda" : "Aluguel"}</Badge>
          <h2 className="text-xl font-bold">{property.title}</h2>
          <div className="flex items-center gap-1 text-muted-foreground mt-1">
            <MapPin className="w-4 h-4" />
            <span>{getPropertyAddressText(property)}</span>
          </div>
        </div>
        
        {/* Caracteristicas */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-secondary/50 rounded-xl">
            <Bed className="w-5 h-5 mx-auto text-accent" />
            <p className="font-bold mt-1">{property.bedrooms}</p>
            <p className="text-xs text-muted-foreground">Quartos</p>
          </div>
          <div className="text-center p-3 bg-secondary/50 rounded-xl">
            <Bath className="w-5 h-5 mx-auto text-accent" />
            <p className="font-bold mt-1">{property.bathrooms}</p>
            <p className="text-xs text-muted-foreground">Banheiros</p>
          </div>
          <div className="text-center p-3 bg-secondary/50 rounded-xl">
            <Car className="w-5 h-5 mx-auto text-accent" />
            <p className="font-bold mt-1">{property.parkingSpaces || 0}</p>
            <p className="text-xs text-muted-foreground">Vagas</p>
          </div>
          <div className="text-center p-3 bg-secondary/50 rounded-xl">
            <Maximize className="w-5 h-5 mx-auto text-accent" />
            <p className="font-bold mt-1">{property.area}</p>
            <p className="text-xs text-muted-foreground">m2</p>
          </div>
        </div>
        
        {/* Descricao */}
        <div>
          <h4 className="font-medium mb-2">Descricao</h4>
          <p className="text-sm text-muted-foreground">{property.description}</p>
        </div>
        
        {/* Preco e acoes */}
        <div className="bg-secondary/50 rounded-xl p-4">
          <p className="text-2xl font-bold text-accent mb-3">
            R$ {property.price.toLocaleString("pt-BR")}
            {property.type === "rent" && <span className="text-base font-normal text-muted-foreground">/mes</span>}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12" onClick={onContact}>
              <Phone className="w-5 h-5 mr-2" />
              Contato
            </Button>
            <Button className="h-12" onClick={onScheduleVisit}>
              <Calendar className="w-5 h-5 mr-2" />
              Agendar visita
            </Button>
          </div>
        </div>
      </div>
    </ActionDrawer>
  )
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export function RealEstateFeed() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [propertyDrawerOpen, setPropertyDrawerOpen] = useState(false)
  const [visitDrawerOpen, setVisitDrawerOpen] = useState(false)
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
      id: "properties",
      title: "Imoveis em Destaque",
      icon: <Home className="w-5 h-5 text-accent" />,
      type: "primary-action",
      customContent: (
        <PropertiesModule 
          onSelectProperty={(p) => { setSelectedProperty(p); setPropertyDrawerOpen(true) }}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
      )
    },
    {
      id: "types",
      title: "Tipos de Imovel",
      icon: <Building className="w-5 h-5 text-accent" />,
      type: "specific",
      customContent: <PropertyTypesModule />
    },
    {
      id: "videos",
      title: "Tour Virtual",
      icon: <Play className="w-5 h-5 text-accent" />,
      type: "content",
      posts: realestateContent.videos
    },
    {
      id: "reviews",
      title: "Depoimentos",
      icon: <Star className="w-5 h-5 text-accent" />,
      type: "content",
      posts: realestateContent.reviews
    },
    {
      id: "news",
      title: "Na Midia",
      icon: <Newspaper className="w-5 h-5 text-accent" />,
      type: "content",
      posts: realestateContent.news
    },
    {
      id: "social",
      title: "Nas Redes",
      type: "content",
      posts: realestateContent.social
    }
  ]
  
  return (
    <>
      <BusinessSocialLanding
        config={realestateConfig}
        stories={realestateContent.stories}
        sections={sections}
        footerLinks={[
          { label: "Sobre", href: "#" },
          { label: "Imoveis", href: "#" },
          { label: "Contato", href: "#" },
        ]}
      />
      
      <PropertyDetailDrawer
        property={selectedProperty}
        isOpen={propertyDrawerOpen}
        onClose={() => setPropertyDrawerOpen(false)}
        onScheduleVisit={() => {
          setPropertyDrawerOpen(false)
          setVisitDrawerOpen(true)
        }}
        onContact={() => {
          // Abre WhatsApp
          window.open(`https://wa.me/${realestateConfig.whatsapp}`, "_blank")
        }}
      />
      
      <ActionDrawer
        isOpen={visitDrawerOpen}
        onClose={() => setVisitDrawerOpen(false)}
        title="Agendar Visita"
        size="lg"
      >
        {selectedProperty && (
          <ScheduleVisitForm
            propertyTitle={selectedProperty.title}
            propertyAddress={`${selectedProperty.address}, ${selectedProperty.neighborhood}`}
            onComplete={() => {
              setVisitDrawerOpen(false)
              setSelectedProperty(null)
            }}
            onBack={() => {
              setVisitDrawerOpen(false)
              setPropertyDrawerOpen(true)
            }}
          />
        )}
      </ActionDrawer>
    </>
  )
}
