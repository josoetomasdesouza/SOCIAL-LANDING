"use client"

import { useState } from "react"
import { Upload, X, Check, Palette } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { motion } from "framer-motion"

interface BrandFormFieldsProps {
  data: {
    name?: string | null
    description?: string | null
    logo?: string | null
    primaryColor?: string | null
  } | null
  missingFields: string[]
  onChange: (updates: Record<string, string | null>) => void
}

// Cores pre-definidas - paleta premium
const PRESET_COLORS = [
  { value: "#10B981", name: "Verde" },
  { value: "#3B82F6", name: "Azul" },
  { value: "#8B5CF6", name: "Roxo" },
  { value: "#EC4899", name: "Rosa" },
  { value: "#F59E0B", name: "Laranja" },
  { value: "#EF4444", name: "Vermelho" },
  { value: "#14B8A6", name: "Teal" },
  { value: "#6366F1", name: "Indigo" },
]

export function BrandFormFields({ data, missingFields, onChange }: BrandFormFieldsProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(data?.logo || null)
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setLogoPreview(result)
        onChange({ logo: result })
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleRemoveLogo = () => {
    setLogoPreview(null)
    onChange({ logo: null })
  }
  
  const needsField = (field: string) => missingFields.includes(field) || !data?.[field as keyof typeof data]
  
  return (
    <div className="space-y-6">
      {/* Nome da marca */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Nome da marca</label>
          {!needsField("name") && data?.name && (
            <motion.span 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-green-500 flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Detectado
            </motion.span>
          )}
        </div>
        <Input
          placeholder="Ex: Minha Empresa"
          value={data?.name || ""}
          onChange={(e) => onChange({ name: e.target.value })}
          className="h-12 rounded-xl border-border/50 focus:border-accent bg-background"
        />
      </div>
      
      {/* Logo + Cor lado a lado em telas maiores */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Logo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Logo</label>
            {logoPreview && !missingFields.includes("logo") && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-green-500 flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Detectado
              </motion.span>
            )}
          </div>
          
          {logoPreview ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 p-3 rounded-xl border border-border/50 bg-secondary/30"
            >
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-background">
                <Image
                  src={logoPreview}
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveLogo}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4 mr-1" />
                Remover
              </Button>
            </motion.div>
          ) : (
            <label className="group flex flex-col items-center justify-center h-[88px] border border-dashed border-border/50 rounded-xl cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all duration-200">
              <Upload className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors mb-1" />
              <span className="text-sm text-muted-foreground group-hover:text-accent transition-colors">
                Enviar logo
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
        
        {/* Cor primaria */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              Cor da marca
            </label>
            {data?.primaryColor && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-green-500 flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Detectado
              </motion.span>
            )}
          </div>
          
          <div className="flex items-center gap-2 p-3 rounded-xl border border-border/50 bg-secondary/30">
            {/* Paleta de cores */}
            <div className="flex gap-1.5 flex-wrap flex-1">
              {PRESET_COLORS.map((color) => (
                <motion.button
                  key={color.value}
                  onClick={() => onChange({ primaryColor: color.value })}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-7 h-7 rounded-full transition-all shadow-sm",
                    data?.primaryColor === color.value 
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" 
                      : "hover:ring-1 hover:ring-border"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            
            {/* Color picker */}
            <div className="relative">
              <input
                type="color"
                value={data?.primaryColor || "#10B981"}
                onChange={(e) => onChange({ primaryColor: e.target.value })}
                className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Descricao */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Descricao curta</label>
          {!needsField("description") && data?.description && (
            <motion.span 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-green-500 flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Detectado
            </motion.span>
          )}
        </div>
        <Textarea
          placeholder="Ex: Transformamos ideias em realidade desde 2010"
          value={data?.description || ""}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={2}
          className="resize-none rounded-xl border-border/50 focus:border-accent bg-background"
        />
        <p className="text-xs text-muted-foreground">
          Uma frase curta sobre o que sua marca faz
        </p>
      </div>
    </div>
  )
}
