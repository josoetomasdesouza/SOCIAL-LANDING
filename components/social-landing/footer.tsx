"use client"

import Image from "next/image"
import { Instagram, Twitter, Youtube, Linkedin, CheckCircle } from "lucide-react"
import type { Brand } from "@/lib/types"

interface FooterProps {
  brand: Brand
}

export function Footer({ brand }: FooterProps) {
  const socialLinks = [
    { icon: Instagram, href: brand.socialLinks.instagram, label: "Instagram" },
    { icon: Twitter, href: brand.socialLinks.twitter, label: "Twitter" },
    { icon: Youtube, href: brand.socialLinks.youtube, label: "YouTube" },
    { icon: Linkedin, href: brand.socialLinks.linkedin, label: "LinkedIn" },
  ].filter((link) => link.href)

  return (
    <footer className="bg-card border-t border-border/50 py-16">
      <div className="max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-[600px] mx-auto px-4 sm:px-5">
        <div className="flex flex-col items-center gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-accent/30 shadow-lg">
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-foreground tracking-tight">{brand.name}</span>
              {brand.verified && (
                <CheckCircle className="w-5 h-5 text-accent fill-accent" />
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-full bg-secondary/70 hover:bg-accent hover:text-accent-foreground transition-all duration-200 active:scale-95 shadow-sm"
                aria-label={link.label}
              >
                <link.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="w-16 h-px bg-border/50" />

          {/* Copyright */}
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p className="font-medium">&copy; {new Date().getFullYear()} {brand.name}</p>
            <p>Todos os direitos reservados</p>
            <p className="pt-2">
              Pagina criada com{" "}
              <a href="#" className="text-accent hover:underline font-medium">
                Social Landing
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
