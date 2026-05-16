"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Clock, Dumbbell, Users, Calendar, Star, Zap, Check, Play, Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BusinessSocialLanding, type BusinessSection } from "../business-social-landing"
import { ActionDrawer } from "../action-drawer"
import { GymSignupForm } from "../checkout-flows"
import { ContextSelectable } from "../context-selectable"
import type { ConversationContextItem } from "../conversational-ai"
import { ConversationSelectionProvider, useConversationSelectionState } from "../conversation-selection-context"
import { gymConfig, gymPlans, gymClasses } from "@/lib/mock-data/gym-data"
import { gymContent } from "@/lib/mock-data/business-content"
import type { GymPlan, GymClass } from "@/lib/business-types"

// ========================================
// MODULO: PLANOS (OBJETIVO PRINCIPAL)
// ========================================
function PlansModule({
  onSelectPlan,
  onToggleConversationContext,
  isInConversation,
}: {
  onSelectPlan: (plan: GymPlan) => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  return (
    <div className="space-y-4">
      {gymPlans.map((plan) => {
        const contextItem = {
          id: `gym-plan-${plan.id}`,
          title: plan.name,
          image: gymConfig.logo,
          subtitle: "Plano",
        }

        return (
        <ContextSelectable
          key={plan.id}
          as="div"
          onClick={() => onSelectPlan(plan)}
          onLongPress={() => onToggleConversationContext?.(contextItem)}
          selected={isInConversation?.(contextItem.id) ?? false}
          className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${plan.popular ? "border-accent bg-accent/5" : "border-border/50 hover:border-accent/50"}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>
            {plan.popular && <Badge className="bg-accent text-accent-foreground">Popular</Badge>}
          </div>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-3xl font-bold text-accent">R$ {plan.price.toFixed(2).replace(".", ",")}</span>
            <span className="text-muted-foreground">/mes</span>
          </div>
          <ul className="space-y-2">
            {plan.features.slice(0, 3).map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-accent" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </ContextSelectable>
      )})}
    </div>
  )
}

// ========================================
// MODULO: AULAS
// ========================================
function ClassesModule({
  onToggleConversationContext,
  isInConversation,
}: {
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:-mx-5 sm:px-5">
      {gymClasses.slice(0, 5).map((cls) => {
        const contextItem = {
          id: `gym-class-${cls.id}`,
          title: cls.name,
          image: cls.image || gymConfig.logo,
          subtitle: "Aula",
        }

        return (
        <ContextSelectable
          key={cls.id}
          as="div"
          onLongPress={() => onToggleConversationContext?.(contextItem)}
          selected={isInConversation?.(contextItem.id) ?? false}
          className="flex-shrink-0 w-40"
        >
          <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
            <Image src={cls.image || ""} alt={cls.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="font-medium text-white text-sm">{cls.name}</p>
              <p className="text-xs text-white/80">{cls.duration} min</p>
            </div>
          </div>
        </ContextSelectable>
      )})}
    </div>
  )
}

// ========================================
// DRAWER: DETALHES DO PLANO
// ========================================
function PlanDetailDrawer({ 
  plan, 
  isOpen, 
  onClose,
  onSignup,
  onToggleConversationContext,
  isInConversation,
}: { 
  plan: GymPlan | null
  isOpen: boolean
  onClose: () => void
  onSignup: () => void
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}) {
  if (!plan) return null

  const planContextItem = {
    id: `gym-plan-${plan.id}`,
    title: plan.name,
    image: gymConfig.logo,
    subtitle: "Plano",
  }
  
  return (
    <ActionDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={plan.name}
      size="lg"
      reserveComposerSpace
    >
      <div className="space-y-6">
        <ContextSelectable
          as="div"
          onLongPress={() => onToggleConversationContext?.(planContextItem)}
          selected={isInConversation?.(planContextItem.id) ?? false}
          className={`p-4 rounded-xl ${plan.popular ? "bg-accent/10" : "bg-secondary/50"}`}
        >
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl font-bold text-accent">R$ {plan.price.toFixed(2).replace(".", ",")}</span>
            <span className="text-muted-foreground">/mes</span>
          </div>
          <p className="text-muted-foreground">{plan.description}</p>
        </ContextSelectable>
        
        <ContextSelectable
          as="div"
          onLongPress={() => onToggleConversationContext?.(planContextItem)}
          selected={isInConversation?.(planContextItem.id) ?? false}
        >
          <h4 className="font-medium mb-3">O que esta incluso</h4>
          <ul className="space-y-3">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-accent" />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </ContextSelectable>
        
        <Button className="w-full h-12" onClick={onSignup}>
          <Zap className="w-5 h-5 mr-2" />
          Comecar agora
        </Button>
      </div>
    </ActionDrawer>
  )
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export function GymFeed() {
  const conversationSelection = useConversationSelectionState()
  const { setComposerMode } = conversationSelection
  const [selectedPlan, setSelectedPlan] = useState<GymPlan | null>(null)
  const [planDrawerOpen, setPlanDrawerOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)

  useEffect(() => {
    const nextMode = signupOpen ? "hidden" : planDrawerOpen ? "overlay" : "default"
    setComposerMode(nextMode)

    return () => {
      setComposerMode("default")
    }
  }, [planDrawerOpen, setComposerMode, signupOpen])
  
  const sections: BusinessSection[] = [
    {
      id: "plans",
      title: "Planos",
      icon: <Dumbbell className="w-5 h-5 text-accent" />,
      type: "primary-action",
      customContent: (
        <PlansModule onSelectPlan={(p) => { setSelectedPlan(p); setPlanDrawerOpen(true) }} />
      )
    },
    {
      id: "classes",
      title: "Aulas Disponiveis",
      icon: <Calendar className="w-5 h-5 text-accent" />,
      type: "specific",
      customContent: <ClassesModule />
    },
    {
      id: "videos",
      title: "Treinos",
      icon: <Play className="w-5 h-5 text-accent" />,
      type: "content",
      posts: gymContent.videos
    },
    {
      id: "reviews",
      title: "Transformacoes",
      icon: <Star className="w-5 h-5 text-accent" />,
      type: "content",
      posts: gymContent.reviews
    },
    {
      id: "news",
      title: "Na Midia",
      icon: <Newspaper className="w-5 h-5 text-accent" />,
      type: "content",
      posts: gymContent.news
    },
    {
      id: "social",
      title: "Comunidade",
      type: "content",
      posts: gymContent.social
    }
  ]
  
  return (
    <ConversationSelectionProvider value={conversationSelection}>
      <>
      <BusinessSocialLanding
        config={gymConfig}
        stories={gymContent.stories}
        sections={sections}
        footerLinks={[
          { label: "Sobre", href: "#" },
          { label: "Planos", href: "#" },
          { label: "Contato", href: "#" },
        ]}
      />
      
      <PlanDetailDrawer
        plan={selectedPlan}
        isOpen={planDrawerOpen}
        onClose={() => setPlanDrawerOpen(false)}
        onSignup={() => {
          setPlanDrawerOpen(false)
          setSignupOpen(true)
        }}
        onToggleConversationContext={conversationSelection.toggleConversationContextItem}
        isInConversation={conversationSelection.isConversationSelected}
      />
      
      <ActionDrawer
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
        title="Matricula"
        size="lg"
      >
        {selectedPlan && (
          <GymSignupForm
            planName={selectedPlan.name}
            planPrice={selectedPlan.price}
            onComplete={() => {
              setSignupOpen(false)
              setSelectedPlan(null)
            }}
            onBack={() => {
              setSignupOpen(false)
              setPlanDrawerOpen(true)
            }}
          />
        )}
      </ActionDrawer>
      </>
    </ConversationSelectionProvider>
  )
}
