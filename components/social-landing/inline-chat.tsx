"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronRight, Send } from "lucide-react"
import type { ContextualReferenceItem } from "./use-contextual-navigation"

// Avatar padrao do usuario
const DEFAULT_USER_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"

interface ChatMessage {
  text?: string
  content?: string
  isUser: boolean
}

interface SimulatedChatProps {
  brandLogo: string
  userAvatar?: string
  messages: ChatMessage[]
  placeholder?: string
  relatedContent?: ContextualReferenceItem[]
  onNavigateToContext?: (contentId: string) => void
}

// Chat com conversa ja simulada entre usuario e IA
export function SimulatedChat({ 
  brandLogo, 
  userAvatar = DEFAULT_USER_AVATAR,
  messages, 
  placeholder = "Digite aqui...",
  relatedContent = [],
  onNavigateToContext
}: SimulatedChatProps) {
  const [inputValue, setInputValue] = useState("")

  return (
    <div className="mt-5 space-y-2.5">
      {/* Mensagens simuladas */}
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex items-start gap-2.5 ${message.isUser ? "flex-row-reverse" : ""}`}
        >
          {/* Avatar: IA mostra brandLogo, Usuario mostra userAvatar */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-sm ring-1 ring-border/30">
            <Image 
              src={message.isUser ? userAvatar : brandLogo} 
              alt={message.isUser ? "Voce" : "Natura"} 
              fill 
              className="object-cover" 
            />
          </div>
          <div
            className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
              message.isUser
                ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md shadow-sm"
                : "bg-secondary text-foreground rounded-2xl rounded-bl-md"
            }`}
          >
            {message.text ?? message.content}
          </div>
        </div>
      ))}

      {relatedContent.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
            Ver no feed
          </p>

          <div className="grid gap-2">
            {relatedContent.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigateToContext?.(item.id)}
                className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 px-3 py-2.5 text-left transition-all duration-200 hover:border-accent/30 hover:bg-accent/5 active:scale-[0.99]"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={52}
                    height={52}
                    className="h-[52px] w-[52px] rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-accent/10 text-[11px] font-semibold uppercase tracking-wide text-accent">
                    {item.eyebrow.slice(0, 3)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent/80">
                    {item.eyebrow}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>

                <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input para continuar a conversa - Avatar do USUARIO (quem vai escrever) */}
      <div className="flex items-center gap-2.5 pt-1">
        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-sm ring-1 ring-border/30">
          <Image src={userAvatar} alt="Voce" fill className="object-cover" />
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 pr-11 bg-secondary/70 hover:bg-secondary rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-secondary transition-all duration-200"
          />
          <button
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-muted-foreground/70 hover:text-accent hover:bg-accent/10 rounded-full transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Chat simples apenas com input - Avatar do USUARIO (quem vai escrever)
export function SimpleChatInput({ 
  userAvatar = DEFAULT_USER_AVATAR,
  placeholder = "Gostou desse? Digite aqui..." 
}: { 
  brandLogo?: string // mantido para compatibilidade, mas nao usado
  userAvatar?: string
  placeholder?: string 
}) {
  return (
    <div className="mt-5 flex items-center gap-2.5">
      {/* Avatar do USUARIO - quem vai digitar a mensagem */}
      <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-sm ring-1 ring-border/30">
        <Image src={userAvatar} alt="Voce" fill className="object-cover" />
      </div>
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full px-4 py-2.5 bg-secondary/70 hover:bg-secondary rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-secondary transition-all duration-200"
        />
      </div>
    </div>
  )
}
