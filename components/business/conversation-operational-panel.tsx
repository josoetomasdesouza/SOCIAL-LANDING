"use client"

import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConversationOperationalPanelProps {
  mode: "default" | "immersive"
  isVisible: boolean
  eyebrow?: string
  title?: string
  subtitle?: string
  canGoBack?: boolean
  onBack?: () => void
  children?: React.ReactNode
}

export function ConversationOperationalPanel({
  mode,
  isVisible,
  eyebrow,
  title,
  subtitle,
  canGoBack = false,
  onBack,
  children,
}: ConversationOperationalPanelProps) {
  if (!isVisible) return null

  return (
    <section
      className={cn(
        "border-t border-border/60 bg-gradient-to-b from-background via-background to-secondary/20 px-4 py-4",
        mode === "immersive" && "min-h-0 flex-1 overflow-y-auto"
      )}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {canGoBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Voltar etapa"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow || "Produto selecionado"}
            </p>
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              {title || "Painel operacional"}
            </h3>
            {subtitle ? (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>

        {children || (
          <div className="rounded-[24px] border border-dashed border-border/70 bg-background/70 p-5 shadow-[0_18px_44px_-30px_rgba(0,0,0,0.32)]">
            <p className="text-sm font-medium text-foreground">Superficie operacional pronta.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Nas proximas fases, o fluxo completo de produto vai acontecer aqui dentro da conversa.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
