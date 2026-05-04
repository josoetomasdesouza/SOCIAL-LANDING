"use client"

import { MessageCircle, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Brand } from "@/lib/types"

interface ConversionBlockProps {
  brand: Brand
}

export function ConversionBlock({ brand }: ConversionBlockProps) {
  const whatsappLink = brand.whatsappNumber 
    ? `https://wa.me/${brand.whatsappNumber}?text=Olá! Vim da página ${brand.name} e gostaria de mais informações.`
    : "#"

  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary-foreground" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-primary-foreground" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Fale conosco
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
              Tem alguma dúvida ou quer saber mais sobre nossos produtos? Entre em contato!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 text-base"
                asChild
              >
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2 text-base"
              >
                <Mail className="w-5 h-5" />
                E-mail
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2 text-base"
              >
                <Phone className="w-5 h-5" />
                Telefone
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
