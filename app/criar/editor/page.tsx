"use client"

import { useState, useMemo, Suspense, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft, Save, Eye, EyeOff, Plus, Trash2, GripVertical,
  Camera, Phone, Mail, Instagram, Globe, Clock, MapPin,
  Sparkles, Loader2, Check, ChevronRight, ExternalLink,
  MessageCircle, Star, Video, Newspaper, Users, ShoppingBag,
  Calendar, FileText, HelpCircle, Link2, Info
} from "lucide-react"
import type { BusinessRuntime, BusinessRuntimeVertical } from "@/lib/runtime/business"
import type { BusinessRuntimeDraftRecord } from "@/lib/runtime/business/drafts"
import type { BusinessOperationalAiKind } from "@/lib/runtime/business/operational-ai/types"
import { projectBusinessRuntimeToSocialLanding } from "@/lib/runtime/business/projections/social-landing"

// Tipos de blocos disponiveis
const BLOCK_TYPES = [
  { id: "about", name: "Sobre", icon: MessageCircle, description: "Descricao e bio" },
  { id: "contact", name: "Contato", icon: Phone, description: "Telefone, email, endereco" },
  { id: "social", name: "Redes Sociais", icon: Instagram, description: "Links das redes" },
  { id: "hours", name: "Horarios", icon: Clock, description: "Horario de funcionamento" },
  { id: "gallery", name: "Galeria", icon: Camera, description: "Fotos e imagens" },
  { id: "videos", name: "Videos", icon: Video, description: "Videos do YouTube/TikTok" },
  { id: "reviews", name: "Avaliacoes", icon: Star, description: "Depoimentos de clientes" },
  { id: "news", name: "Na Midia", icon: Newspaper, description: "Noticias e materias" },
  { id: "team", name: "Equipe", icon: Users, description: "Membros da equipe" },
  { id: "products", name: "Produtos", icon: ShoppingBag, description: "Catalogo de produtos" },
  { id: "services", name: "Servicos", icon: FileText, description: "Lista de servicos" },
  { id: "events", name: "Eventos", icon: Calendar, description: "Proximos eventos" },
  { id: "faq", name: "FAQ", icon: HelpCircle, description: "Perguntas frequentes" },
  { id: "links", name: "Links", icon: Link2, description: "Links externos" },
]

// Blocos padrao por categoria
const DEFAULT_BLOCKS: Record<string, string[]> = {
  restaurant: ["about", "gallery", "hours", "contact", "reviews", "social"],
  ecommerce: ["about", "products", "reviews", "contact", "social"],
  appointment: ["about", "services", "team", "hours", "contact", "reviews"],
  courses: ["about", "services", "team", "reviews", "faq", "contact"],
  health: ["about", "team", "services", "hours", "contact", "reviews"],
  gym: ["about", "services", "hours", "gallery", "reviews", "contact"],
  events: ["about", "events", "gallery", "videos", "contact", "social"],
  realestate: ["about", "products", "gallery", "contact", "social"],
  professionals: ["about", "services", "reviews", "faq", "contact", "social"],
  influencer: ["about", "links", "videos", "gallery", "social", "contact"],
  personal: ["about", "gallery", "links", "social", "contact"],
  institutional: ["about", "team", "news", "gallery", "faq", "contact"],
}

const RUNTIME_VERTICALS: BusinessRuntimeVertical[] = [
  "appointment",
  "beauty",
  "restaurant",
  "clinic",
  "barber",
  "gym",
  "generic",
]

function mapRuntimeVerticalToEditorCategory(vertical: BusinessRuntimeVertical) {
  if (vertical === "beauty" || vertical === "barber") return "appointment"
  if (vertical === "clinic") return "health"
  if (vertical === "generic") return "institutional"
  return vertical
}

function buildBlocksForCategory(category: string): Block[] {
  const defaultBlockIds = DEFAULT_BLOCKS[category] || DEFAULT_BLOCKS.restaurant
  return defaultBlockIds.map(id => ({
    id: `${id}-${Date.now()}`,
    type: id,
    visible: true,
    content: {}
  }))
}

function buildBlocksFromRuntime(runtime: BusinessRuntime): Block[] {
  const category = mapRuntimeVerticalToEditorCategory(runtime.vertical)
  const blockTypes = new Set(DEFAULT_BLOCKS[category] || DEFAULT_BLOCKS.restaurant)
  if (runtime.knowledge.faq?.length) blockTypes.add("faq")
  if (runtime.services.length) blockTypes.add("services")

  return Array.from(blockTypes).map(type => ({
    id: `${type}-runtime`,
    type,
    visible: true,
    content: {}
  }))
}

function parseServiceLines(value: string): BusinessRuntime["services"] {
  return value
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [name = "", description = "", price = ""] = line.split("|").map(part => part.trim())
      const parsedPrice = Number(price.replace(",", "."))
      return {
        id: `service-${index + 1}`,
        name,
        description,
        price: Number.isFinite(parsedPrice) && price ? parsedPrice : undefined,
      }
    })
}

function formatServiceLines(runtime: BusinessRuntime) {
  return runtime.services
    .map(service => [service.name, service.description, service.price].filter(value => value !== undefined && value !== "").join(" | "))
    .join("\n")
}

function parseFaqLines(value: string): NonNullable<BusinessRuntime["knowledge"]["faq"]> {
  return value
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [question = "", answer = ""] = line.split("|").map(part => part.trim())
      return {
        id: `faq-${index + 1}`,
        question,
        answer,
      }
    })
}

function formatFaqLines(runtime: BusinessRuntime) {
  return runtime.knowledge.faq
    ?.map(item => [item.question, item.answer].filter(Boolean).join(" | "))
    .join("\n") ?? ""
}

function formatKeywordLines(runtime: BusinessRuntime) {
  return runtime.brand.keywords?.join(", ") ?? ""
}

function parseKeywordLines(value: string) {
  return value
    .split(",")
    .map(keyword => keyword.trim().toLowerCase())
    .filter(Boolean)
}

function mapBlockTypeToOperationalAiKind(blockType: string): BusinessOperationalAiKind {
  if (blockType === "services" || blockType === "products") {
    return "services"
  }

  if (blockType === "hours" || blockType === "contact" || blockType === "social" || blockType === "links") {
    return "operations"
  }

  if (blockType === "faq") {
    return "faq"
  }

  if (blockType === "about") {
    return "brand_voice"
  }

  return "full_draft"
}

interface Block {
  id: string
  type: string
  visible: boolean
  content: Record<string, string | string[]>
}

function EditorContent() {
  const searchParams = useSearchParams()
  const draftId = searchParams.get("draftId")
  const slug = searchParams.get("slug") || "minha-marca"
  const focusField = searchParams.get("focus")
  const category = searchParams.get("category") || "restaurant"
  const [runtime, setRuntime] = useState<BusinessRuntime | null>(null)
  const [runtimeDraftId, setRuntimeDraftId] = useState<string | null>(null)
  const [draftError, setDraftError] = useState<string | null>(null)
  const [isLoadingDraft, setIsLoadingDraft] = useState(Boolean(draftId))
  
  // Dados da marca vindos do chat
  const brandData = useMemo(() => ({
    name: runtime?.business.name || searchParams.get("name") || slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    description: runtime?.business.description || searchParams.get("description") || "",
    whatsapp: runtime?.channels.whatsapp || searchParams.get("whatsapp") || "",
    instagram: runtime?.channels.instagram || searchParams.get("instagram") || "",
  }), [runtime, searchParams, slug])

  // Blocos ativos
  const [blocks, setBlocks] = useState<Block[]>(() => {
    return buildBlocksForCategory(category)
  })

  const [selectedBlock, setSelectedBlock] = useState<string | null>(focusField || null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [showAddBlock, setShowAddBlock] = useState(false)
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null)
  const projectedPreview = useMemo(
    () => runtime ? projectBusinessRuntimeToSocialLanding(runtime) : null,
    [runtime]
  )

  useEffect(() => {
    if (!draftId) {
      setIsLoadingDraft(false)
      return
    }

    let cancelled = false
    setIsLoadingDraft(true)
    setDraftError(null)

    fetch(`/api/business-runtime/drafts/${encodeURIComponent(draftId)}`)
      .then(async response => {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Erro ao carregar draft")
        }
        return data as BusinessRuntimeDraftRecord
      })
      .then(record => {
        if (cancelled) return
        setRuntime(record.runtime)
        setRuntimeDraftId(record.draftId)
        setBlocks(buildBlocksFromRuntime(record.runtime))
      })
      .catch(error => {
        if (cancelled) return
        setDraftError(error instanceof Error ? error.message : "Erro ao carregar draft")
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDraft(false)
      })

    return () => {
      cancelled = true
    }
  }, [draftId])

  const updateRuntime = useCallback((updater: (current: BusinessRuntime) => BusinessRuntime) => {
    setRuntime(current => current ? updater(current) : current)
  }, [])

  // Blocos que podem ser adicionados (nao estao na lista atual)
  const availableBlocks = useMemo(() => {
    const activeTypes = blocks.map(b => b.type)
    return BLOCK_TYPES.filter(bt => !activeTypes.includes(bt.id))
  }, [blocks])

  // Completude
  const completeness = useMemo(() => {
    let filled = 0
    let total = blocks.length * 2 // cada bloco vale 2 pontos
    blocks.forEach(block => {
      if (Object.keys(block.content).length > 0) filled += 2
      else if (block.visible) filled += 1
    })
    return Math.min(100, Math.round((filled / total) * 100))
  }, [blocks])

  const handleSave = async (): Promise<BusinessRuntime | null> => {
    setIsSaving(true)
    setDraftError(null)

    if (!runtime || !runtimeDraftId) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsSaving(false)
      return null
    }

    try {
      const response = await fetch(`/api/business-runtime/drafts/${encodeURIComponent(runtimeDraftId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(runtime),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao salvar draft")
      }

      const record = data as BusinessRuntimeDraftRecord
      setRuntime(record.runtime)
      setBlocks(buildBlocksFromRuntime(record.runtime))
      return record.runtime
    } catch (error) {
      setDraftError(error instanceof Error ? error.message : "Erro ao salvar draft")
      return null
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!runtimeDraftId) {
      setDraftError("Salve um draft antes de publicar")
      return
    }

    setIsPublishing(true)
    setDraftError(null)

    try {
      const savedRuntime = await handleSave()
      if (!savedRuntime) {
        throw new Error("Nao foi possivel salvar antes de publicar")
      }

      const response = await fetch("/api/business-runtime/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: runtimeDraftId }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao publicar")
      }

      setPublishedSlug(data.slug)
      setRuntime(data.runtime)
    } catch (error) {
      setDraftError(error instanceof Error ? error.message : "Erro ao publicar")
    } finally {
      setIsPublishing(false)
    }
  }

  const handleGenerateAI = async (blockId: string) => {
    setIsGeneratingAI(true)
    setDraftError(null)

    try {
      const block = blocks.find(entry => entry.id === blockId)

      if (!runtimeDraftId || !block) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setBlocks(prev => prev.map(entry => {
          if (entry.id === blockId) {
            return {
              ...entry,
              content: {
                title: "Conteudo gerado pela IA",
                description: "Esta e uma descricao automatica gerada com base no seu negocio e categoria."
              }
            }
          }
          return entry
        }))
        return
      }

      const response = await fetch(`/api/business-runtime/drafts/${encodeURIComponent(runtimeDraftId)}/operational-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: mapBlockTypeToOperationalAiKind(block.type),
          operatorBrief: `Preencher bloco ${block.type}`,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao aplicar IA operacional")
      }

      setRuntime(data.runtime)
      setBlocks(buildBlocksFromRuntime(data.runtime))
    } catch (error) {
      setDraftError(error instanceof Error ? error.message : "Erro ao aplicar IA operacional")
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleAddBlock = (type: string) => {
    const newBlock: Block = {
      id: `${type}-${Date.now()}`,
      type,
      visible: true,
      content: {}
    }
    setBlocks(prev => [...prev, newBlock])
    setShowAddBlock(false)
    setSelectedBlock(newBlock.id)
  }

  const handleRemoveBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId))
    if (selectedBlock === blockId) setSelectedBlock(null)
  }

  const handleToggleVisibility = (blockId: string) => {
    setBlocks(prev => prev.map(b => 
      b.id === blockId ? { ...b, visible: !b.visible } : b
    ))
  }

  const getBlockInfo = (type: string) => {
    return BLOCK_TYPES.find(bt => bt.id === type) || BLOCK_TYPES[0]
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/criar">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold text-sm">{brandData.name}</h1>
              <p className="text-xs text-muted-foreground">{completeness}% completo</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${publishedSlug || runtime?.slug || slug}`} target="_blank">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePublish}
              disabled={isPublishing || isSaving || !runtimeDraftId}
            >
              {isPublishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Publicar
                </>
              )}
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={isSaving || isPublishing}
              className="bg-accent hover:bg-accent/90"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {isLoadingDraft && (
        <div className="pt-28 flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Carregando draft...
        </div>
      )}

      {draftError && (
        <div className="px-4 py-2 text-sm text-destructive bg-destructive/10 border-b border-destructive/20">
          {draftError}
        </div>
      )}

      {publishedSlug && (
        <div className="px-4 py-2 text-sm text-green-700 bg-green-500/10 border-b border-green-500/20">
          Publicado em /{publishedSlug}
        </div>
      )}

      <div className="pt-14 flex">
        {/* Sidebar - Lista de Blocos */}
        <aside className="w-80 border-r border-border/50 h-[calc(100vh-56px)] overflow-y-auto bg-secondary/20">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Blocos</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAddBlock(!showAddBlock)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>

            {/* Add Block Panel */}
            {showAddBlock && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-background rounded-xl border border-border/50"
              >
                <p className="text-xs text-muted-foreground mb-3">Adicionar novo bloco:</p>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {availableBlocks.map(block => {
                    const Icon = block.icon
                    return (
                      <button
                        key={block.id}
                        onClick={() => handleAddBlock(block.id)}
                        className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left text-xs"
                      >
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span>{block.name}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Blocks List */}
            <div className="space-y-2">
              {blocks.map((block, index) => {
                const info = getBlockInfo(block.type)
                const Icon = info.icon
                const isSelected = selectedBlock === block.id
                const hasContent = Object.keys(block.content).length > 0

                return (
                  <motion.div
                    key={block.id}
                    layout
                    className={`
                      p-3 rounded-xl border transition-all cursor-pointer
                      ${isSelected 
                        ? "border-accent bg-accent/5" 
                        : "border-border/50 bg-background hover:border-border"
                      }
                      ${!block.visible ? "opacity-50" : ""}
                    `}
                    onClick={() => setSelectedBlock(block.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="cursor-grab">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        ${hasContent ? "bg-accent/10" : "bg-secondary"}
                      `}>
                        <Icon className={`w-4 h-4 ${hasContent ? "text-accent" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{info.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {hasContent ? "Preenchido" : "Vazio"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleVisibility(block.id)
                          }}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                        >
                          {block.visible ? (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveBlock(block.id)
                          }}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main - Editor do Bloco Selecionado */}
        <main className="flex-1 h-[calc(100vh-56px)] overflow-y-auto">
          {selectedBlock ? (
            <div className="max-w-2xl mx-auto p-6">
              {(() => {
                const block = blocks.find(b => b.id === selectedBlock)
                if (!block) return null
                const info = getBlockInfo(block.type)
                const Icon = info.icon

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={block.id}
                  >
                    {/* Block Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{info.name}</h2>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>

                    {/* AI Generate Button */}
                    <Button
                      variant="outline"
                      className="w-full mb-6 h-12 border-dashed"
                      onClick={() => handleGenerateAI(block.id)}
                      disabled={isGeneratingAI}
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Gerando com IA...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Preencher com IA
                        </>
                      )}
                    </Button>

                    {/* Block Content Form */}
                    <div className="space-y-4">
                      {block.type === "about" && (
                        <>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Nome do negocio</label>
                            <Input
                              placeholder="Ex: Minha marca"
                              value={runtime?.business.name ?? block.content.title as string ?? ""}
                              onChange={(event) => updateRuntime(current => ({
                                ...current,
                                business: {
                                  ...current.business,
                                  name: event.target.value,
                                },
                                brand: {
                                  ...current.brand,
                                  name: event.target.value,
                                },
                              }))}
                              readOnly={!runtime}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Descricao</label>
                            <Textarea 
                              placeholder="Conte sua historia..."
                              rows={4}
                              value={runtime?.business.description ?? block.content.description as string ?? ""}
                              onChange={(event) => updateRuntime(current => ({
                                ...current,
                                business: {
                                  ...current.business,
                                  description: event.target.value,
                                },
                                brand: {
                                  ...current.brand,
                                  description: event.target.value,
                                },
                                knowledge: {
                                  ...current.knowledge,
                                  summary: event.target.value,
                                },
                              }))}
                              readOnly={!runtime}
                            />
                          </div>
                          {runtime && (
                            <>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Vertical</label>
                                <select
                                  value={runtime.vertical}
                                  onChange={(event) => updateRuntime(current => ({
                                    ...current,
                                    vertical: event.target.value as BusinessRuntimeVertical,
                                  }))}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                  {RUNTIME_VERTICALS.map(vertical => (
                                    <option key={vertical} value={vertical}>{vertical}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Slug do draft</label>
                                <Input
                                  value={runtime.slug}
                                  onChange={(event) => updateRuntime(current => ({
                                    ...current,
                                    slug: event.target.value,
                                  }))}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Posicionamento</label>
                                <Input
                                  value={runtime.brand.positioning ?? ""}
                                  onChange={(event) => updateRuntime(current => ({
                                    ...current,
                                    brand: {
                                      ...current.brand,
                                      positioning: event.target.value,
                                    },
                                  }))}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Tom de voz</label>
                                <Input
                                  value={runtime.brand.toneOfVoice ?? ""}
                                  onChange={(event) => updateRuntime(current => ({
                                    ...current,
                                    brand: {
                                      ...current.brand,
                                      toneOfVoice: event.target.value,
                                    },
                                  }))}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Personalidade</label>
                                <Input
                                  value={runtime.brand.personality ?? ""}
                                  onChange={(event) => updateRuntime(current => ({
                                    ...current,
                                    brand: {
                                      ...current.brand,
                                      personality: event.target.value,
                                    },
                                  }))}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Estilo visual</label>
                                <Input
                                  value={runtime.brand.visualIdentity?.style ?? ""}
                                  onChange={(event) => updateRuntime(current => ({
                                    ...current,
                                    brand: {
                                      ...current.brand,
                                      visualIdentity: {
                                        ...current.brand.visualIdentity,
                                        style: event.target.value,
                                      },
                                    },
                                  }))}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Palavras-chave</label>
                                <Input
                                  value={formatKeywordLines(runtime)}
                                  onChange={(event) => updateRuntime(current => ({
                                    ...current,
                                    brand: {
                                      ...current.brand,
                                      keywords: parseKeywordLines(event.target.value),
                                    },
                                  }))}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Público-alvo</label>
                                <Input
                                  value={runtime.brand.targetAudience ?? ""}
                                  onChange={(event) => updateRuntime(current => ({
                                    ...current,
                                    brand: {
                                      ...current.brand,
                                      targetAudience: event.target.value,
                                    },
                                  }))}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Proposta de valor</label>
                                <Textarea
                                  rows={3}
                                  value={runtime.brand.valueProposition ?? ""}
                                  onChange={(event) => updateRuntime(current => ({
                                    ...current,
                                    brand: {
                                      ...current.brand,
                                      valueProposition: event.target.value,
                                    },
                                  }))}
                                />
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {block.type === "contact" && (
                        <>
                          <div>
                            <label className="text-sm font-medium mb-2 block">WhatsApp</label>
                            <Input
                              placeholder="(11) 99999-9999"
                              value={runtime?.channels.whatsapp ?? ""}
                              onChange={(event) => updateRuntime(current => ({
                                ...current,
                                channels: {
                                  ...current.channels,
                                  whatsapp: event.target.value,
                                },
                              }))}
                              readOnly={!runtime}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">E-mail</label>
                            <Input
                              placeholder="contato@suamarca.com"
                              type="email"
                              value={runtime?.channels.email ?? ""}
                              onChange={(event) => updateRuntime(current => ({
                                ...current,
                                channels: {
                                  ...current.channels,
                                  email: event.target.value,
                                },
                              }))}
                              readOnly={!runtime}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Endereco</label>
                            <Input
                              placeholder="Rua, numero, bairro, cidade"
                              value={runtime?.location.address ?? ""}
                              onChange={(event) => updateRuntime(current => ({
                                ...current,
                                location: {
                                  ...current.location,
                                  address: event.target.value,
                                },
                              }))}
                              readOnly={!runtime}
                            />
                          </div>
                        </>
                      )}

                      {block.type === "hours" && (
                        <div className="space-y-3">
                          {runtime ? (
                            <div>
                              <label className="text-sm font-medium mb-2 block">Resumo de horarios</label>
                              <Input
                                placeholder="Ex: Seg-Sex: 09h-18h"
                                value={runtime.hours.summary ?? ""}
                                onChange={(event) => updateRuntime(current => ({
                                  ...current,
                                  hours: {
                                    ...current.hours,
                                    summary: event.target.value,
                                  },
                                }))}
                              />
                            </div>
                          ) : (
                            ["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado", "Domingo"].map(day => (
                              <div key={day} className="flex items-center gap-4">
                                <span className="w-24 text-sm">{day}</span>
                                <Input placeholder="08:00" className="w-24" />
                                <span className="text-muted-foreground">ate</span>
                                <Input placeholder="18:00" className="w-24" />
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {block.type === "gallery" && (
                        <div className="grid grid-cols-3 gap-3">
                          {[1, 2, 3, 4, 5, 6].map(i => (
                            <button
                              key={i}
                              className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-accent transition-colors flex items-center justify-center bg-secondary/30"
                            >
                              <Camera className="w-6 h-6 text-muted-foreground" />
                            </button>
                          ))}
                        </div>
                      )}

                      {block.type === "social" && (
                        <>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Instagram</label>
                            <Input
                              placeholder="@suamarca"
                              value={runtime?.channels.instagram ?? ""}
                              onChange={(event) => updateRuntime(current => ({
                                ...current,
                                channels: {
                                  ...current.channels,
                                  instagram: event.target.value,
                                },
                              }))}
                              readOnly={!runtime}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Site</label>
                            <Input
                              placeholder="https://suamarca.com"
                              value={runtime?.channels.website ?? ""}
                              onChange={(event) => updateRuntime(current => ({
                                ...current,
                                channels: {
                                  ...current.channels,
                                  website: event.target.value,
                                },
                              }))}
                              readOnly={!runtime}
                            />
                          </div>
                        </>
                      )}

                      {runtime && block.type === "services" && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">Servicos</label>
                          <Textarea
                            rows={6}
                            placeholder="Nome | descricao | preco"
                            value={formatServiceLines(runtime)}
                            onChange={(event) => updateRuntime(current => ({
                              ...current,
                              services: parseServiceLines(event.target.value),
                            }))}
                          />
                          <p className="text-xs text-muted-foreground mt-2">Um servico por linha: Nome | descricao | preco</p>
                        </div>
                      )}

                      {runtime && block.type === "faq" && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">FAQ</label>
                          <Textarea
                            rows={6}
                            placeholder="Pergunta | resposta"
                            value={formatFaqLines(runtime)}
                            onChange={(event) => updateRuntime(current => ({
                              ...current,
                              knowledge: {
                                ...current.knowledge,
                                faq: parseFaqLines(event.target.value),
                              },
                            }))}
                          />
                          <p className="text-xs text-muted-foreground mt-2">Uma pergunta por linha: Pergunta | resposta</p>
                        </div>
                      )}

                      {/* Placeholder para outros tipos */}
                      {!["about", "contact", "hours", "gallery", "social"].includes(block.type) &&
                        !(runtime && ["services", "faq"].includes(block.type)) && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Editor para bloco "{info.name}" em desenvolvimento.</p>
                          <p className="text-sm">Use "Preencher com IA" para gerar conteudo.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })()}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <MousePointerClick className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Selecione um bloco para editar</p>
              </div>
            </div>
          )}
        </main>

        {/* Preview Panel - Desktop Only */}
        <aside className="hidden xl:block w-[375px] border-l border-border/50 h-[calc(100vh-56px)] overflow-y-auto bg-secondary/10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Preview</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${runtime?.slug || slug}`} target="_blank">
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            
            {/* Phone Frame */}
            <div className="bg-black rounded-[3rem] p-3 shadow-2xl">
              <div className="bg-background rounded-[2.5rem] overflow-hidden">
                {/* Status Bar */}
                <div className="h-6 bg-background flex items-center justify-center">
                  <div className="w-20 h-5 bg-black rounded-full" />
                </div>
                
                {/* Preview Content */}
                <div className="h-[600px] overflow-y-auto">
                  <div className="p-4 space-y-4">
                    {/* Header Preview */}
                    <div className="flex items-center gap-3">
                      {projectedPreview?.config.logo ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-accent/20">
                          <Image src={projectedPreview.config.logo} alt="" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-accent/20" />
                      )}
                      <div>
                        <p className="font-semibold text-sm">{projectedPreview?.config.name || slug}</p>
                        <p className="text-xs text-muted-foreground">
                          {projectedPreview?.config.description || "Preview ao vivo"}
                        </p>
                      </div>
                    </div>

                    {/* Blocks Preview */}
                    {projectedPreview ? (
                      projectedPreview.sections.map(section => (
                        <div
                          key={section.id}
                          className="p-3 rounded-xl bg-secondary/30 border border-border/30"
                        >
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            {section.title}
                          </p>
                          <p className="text-sm">
                            {section.posts?.[0]?.title || section.posts?.[0]?.description || "Conteudo do bloco..."}
                          </p>
                        </div>
                      ))
                    ) : blocks.filter(b => b.visible).map(block => {
                      const info = getBlockInfo(block.type)
                      return (
                        <div 
                          key={block.id}
                          className="p-3 rounded-xl bg-secondary/30 border border-border/30"
                        >
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            {info.name}
                          </p>
                          <p className="text-sm">
                            {block.content.title || block.content.description || "Conteudo do bloco..."}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="h-8 flex items-center justify-center">
                  <div className="w-32 h-1 bg-foreground/20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function MousePointerClick(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 9 5 12 1.8-5.2L21 14Z"/>
      <path d="M7.2 2.2 8 5.1"/>
      <path d="m5.1 8-2.9-.8"/>
      <path d="M14 4.1 12 6"/>
      <path d="m6 12-1.9 2"/>
    </svg>
  )
}

// Loading fallback para Suspense
function EditorLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-muted-foreground">Carregando editor...</p>
      </div>
    </div>
  )
}

// Componente principal com Suspense
export default function EditorPage() {
  return (
    <Suspense fallback={<EditorLoading />}>
      <EditorContent />
    </Suspense>
  )
}
