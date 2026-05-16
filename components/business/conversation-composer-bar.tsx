"use client"

import Image from "next/image"
import { Loader2, Send } from "lucide-react"

interface ConversationComposerBarProps {
  brandLogo: string
  brandName: string
  value: string
  placeholder: string
  isTyping: boolean
  onChange: (value: string) => void
  onSubmit: () => void
}

export function ConversationComposerBar({
  brandLogo,
  brandName,
  value,
  placeholder,
  isTyping,
  onChange,
  onSubmit,
}: ConversationComposerBarProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      className="flex items-center gap-3 px-3 py-2.5"
    >
      <button
        type="button"
        disabled
        className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full"
        aria-label="Marca"
      >
        <Image src={brandLogo} alt={brandName} fill className="object-cover" />
      </button>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            onSubmit()
          }
        }}
        placeholder={placeholder}
        className="h-10 min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/80"
      />

      <button
        type="submit"
        disabled={!value.trim() || isTyping}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-[0_12px_24px_-16px_rgba(0,0,0,0.4)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Enviar mensagem"
      >
        {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </button>
    </form>
  )
}
