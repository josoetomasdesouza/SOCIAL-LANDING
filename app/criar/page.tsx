"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Globe, Loader2, Check, AlertCircle, Sparkles, ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { ExtractedBrandData } from "@/app/api/extract-brand/route"
import { BusinessModelSelector } from "@/components/criar/business-model-selector"
import { BrandFormFields } from "@/components/criar/brand-form-fields"
import { BrandPreview } from "@/components/criar/brand-preview"
import Link from "next/link"
import Image from "next/image"

type Step = "url" | "extracting" | "review" | "complete"

interface BrandData extends Partial<ExtractedBrandData> {
  name: string
  businessModel: string
}

const EXTRACTION_STEPS = [
  "Conectando ao site...",
  "Extraindo informacoes da marca...",
  "Identificando redes sociais...",
  "Detectando categoria do negocio...",
  "Analisando identidade visual...",
  "Finalizando..."
]

export default function CriarPage() {
  const [step, setStep] = useState<Step>("url")
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<ExtractedBrandData | null>(null)
  const [brandData, setBrandData] = useState<BrandData | null>(null)
  const [extractionStep, setExtractionStep] = useState(0)
  
  // Animacao dos steps de extracao
  useEffect(() => {
    if (step === "extracting") {
      const interval = setInterval(() => {
        setExtractionStep(prev => (prev + 1) % EXTRACTION_STEPS.length)
      }, 800)
      return () => clearInterval(interval)
    }
  }, [step])
  
  // Extrai dados do site
  const handleExtract = useCallback(async () => {
    if (!url.trim()) {
      setError("Digite a URL do seu site")
      return
    }
    
    setError(null)
    setStep("extracting")
    setExtractionStep(0)
    
    try {
      const response = await fetch("/api/extract-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Erro ao extrair dados")
      }
      
      setExtractedData(data)
      
      if (data.confidence >= 70 && data.name && data.businessModel) {
        setBrandData({
          ...data,
          name: data.name,
          businessModel: data.businessModel
        })
      }
      
      setStep("review")
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar")
      setStep("url")
    }
  }, [url])
  
  const handleSkipUrl = useCallback(() => {
    setExtractedData(null)
    setBrandData(null)
    setStep("review")
  }, [])
  
  const handleUpdateBrand = useCallback((updates: Partial<BrandData>) => {
    setBrandData(prev => prev ? { ...prev, ...updates } : { name: "", businessModel: "", ...updates })
  }, [])
  
  const handleCreate = useCallback(() => {
    if (!brandData?.name || !brandData?.businessModel) {
      setError("Preencha o nome e selecione a categoria")
      return
    }
    setStep("complete")
  }, [brandData])
  
  const handleBack = useCallback(() => {
    setStep("url")
    setError(null)
  }, [])
  
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/3 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header premium */}
      <header className="relative z-10 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight">Social Landing</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {step !== "url" && step !== "extracting" && (
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="relative z-10 flex items-center justify-center px-6 py-16 min-h-[calc(100vh-8rem)]">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            {/* STEP 1: URL Input - Hero premium */}
            {step === "url" && (
              <motion.div
                key="url"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-10"
              >
                {/* Badge */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex justify-center"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    Crie em segundos com IA
                  </div>
                </motion.div>
                
                {/* Titulo hero */}
                <div className="text-center space-y-4">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance"
                  >
                    Sua marca merece uma{" "}
                    <span className="bg-gradient-to-r from-accent via-accent/80 to-accent bg-clip-text text-transparent">
                      Social Landing
                    </span>
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto text-pretty"
                  >
                    Cole a URL do seu site e nossa IA cria tudo automaticamente. 
                    Sem complicacao, sem codigo.
                  </motion.p>
                </div>
                
                {/* Input de URL premium */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-4"
                >
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/50 to-accent/30 rounded-2xl blur opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300" />
                    <div className="relative bg-card border border-border/50 rounded-2xl p-2 flex items-center gap-2">
                      <div className="flex items-center gap-3 pl-4 text-muted-foreground">
                        <Globe className="w-5 h-5" />
                        <span className="text-sm font-medium hidden sm:inline">https://</span>
                      </div>
                      <Input
                        type="text"
                        placeholder="www.suamarca.com.br"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleExtract()}
                        className="flex-1 h-12 border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                      />
                      <Button 
                        onClick={handleExtract}
                        size="lg"
                        className="h-12 px-6 rounded-xl gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                        disabled={!url.trim()}
                      >
                        <span className="hidden sm:inline">Criar agora</span>
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-2 text-destructive text-sm"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                
                {/* Divisor elegante */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-6"
                >
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  <span className="text-sm text-muted-foreground font-medium">ou comece do zero</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                </motion.div>
                
                {/* Chat Guiado link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="text-center"
                >
                  <Button
                    variant="ghost"
                    asChild
                    className="text-muted-foreground hover:text-foreground font-medium"
                  >
                    <Link href="/criar/novo">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Nao tenho site, criar com assistente IA
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </motion.div>
                
                {/* Trust badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center gap-8 pt-8 text-muted-foreground/60 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent" />
                    100% gratuito
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent" />
                    Pronto em segundos
                  </span>
                  <span className="flex items-center gap-2 hidden sm:flex">
                    <Check className="w-4 h-4 text-accent" />
                    Sem codigo
                  </span>
                </motion.div>
              </motion.div>
            )}
            
            {/* STEP 2: Extracting - Loading premium */}
            {step === "extracting" && (
              <motion.div
                key="extracting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-24 space-y-8"
              >
                {/* Loader animado */}
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-accent-foreground animate-spin" />
                  </div>
                </div>
                
                {/* Status dinamico */}
                <div className="text-center space-y-3">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={extractionStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-xl font-medium"
                    >
                      {EXTRACTION_STEPS[extractionStep]}
                    </motion.p>
                  </AnimatePresence>
                  <p className="text-muted-foreground">
                    Analisando <span className="text-foreground font-medium">{url}</span>
                  </p>
                </div>
                
                {/* Progress bar */}
                <div className="w-64 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((extractionStep + 1) / EXTRACTION_STEPS.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}
            
            {/* STEP 3: Review - Formulario premium */}
            {step === "review" && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Header com status */}
                <div className="text-center space-y-3">
                  {extractedData?.confidence && extractedData.confidence >= 70 ? (
                    <>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
                        <Check className="w-4 h-4" />
                        Dados extraidos com sucesso
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold">
                        Revise e confirme
                      </h2>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl sm:text-3xl font-bold">
                        Complete as informacoes
                      </h2>
                      <p className="text-muted-foreground">
                        Preencha os campos para criar sua Social Landing
                      </p>
                    </>
                  )}
                </div>
                
                {/* Grid de conteudo */}
                <div className="grid lg:grid-cols-5 gap-8">
                  {/* Formulario - 3 colunas */}
                  <div className="lg:col-span-3 space-y-6">
                    <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-6">
                      <BrandFormFields
                        data={brandData || extractedData}
                        missingFields={extractedData?.missingFields || ["name", "businessModel"]}
                        onChange={handleUpdateBrand}
                      />
                    </div>
                    
                    <div className="bg-card border border-border/50 rounded-2xl p-6">
                      <h3 className="font-semibold mb-4">Categoria do negocio</h3>
                      <BusinessModelSelector
                        selected={brandData?.businessModel || extractedData?.businessModel || null}
                        onSelect={(model) => handleUpdateBrand({ businessModel: model })}
                      />
                    </div>
                    
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-xl"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <Button
                      onClick={handleCreate}
                      size="lg"
                      className="w-full h-14 text-lg rounded-xl gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                      disabled={!brandData?.name || !brandData?.businessModel}
                    >
                      <Sparkles className="w-5 h-5" />
                      Criar minha Social Landing
                    </Button>
                  </div>
                  
                  {/* Preview - 2 colunas */}
                  <div className="lg:col-span-2">
                    <div className="sticky top-24">
                      <BrandPreview data={brandData || extractedData} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* STEP 4: Complete - Sucesso premium */}
            {step === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center py-16 space-y-8"
              >
                {/* Icone de sucesso animado */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Check className="w-12 h-12 text-white" strokeWidth={3} />
                  </div>
                </motion.div>
                
                {/* Mensagem */}
                <div className="text-center space-y-3">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl sm:text-4xl font-bold"
                  >
                    Sua Social Landing esta pronta!
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-muted-foreground text-lg"
                  >
                    Compartilhe com seus clientes e aumente seu engajamento
                  </motion.p>
                </div>
                
                {/* URL card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full max-w-md bg-card border border-border/50 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-5 h-5 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">Sua URL</p>
                        <p className="font-medium truncate">
                          social.land/{brandData?.name?.toLowerCase().replace(/\s+/g, "-") || "suamarca"}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
                      Copiar
                    </Button>
                  </div>
                </motion.div>
                
                {/* Acoes */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
                >
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setStep("url")}
                    className="flex-1 h-12 rounded-xl"
                  >
                    Criar outra
                  </Button>
                  <Button 
                    size="lg"
                    className="flex-1 h-12 rounded-xl gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                  >
                    Ver minha landing
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      {/* Footer premium */}
      <footer className="relative z-10 border-t border-border/30 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>Social Landing - Sua presenca digital em segundos</span>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">Ajuda</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Termos</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
