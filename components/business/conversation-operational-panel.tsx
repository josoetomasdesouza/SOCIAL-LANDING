"use client"

import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConversationOperationalPanelProps {
  mode: "default" | "immersive"
  isVisible: boolean
  title?: string
  canGoBack?: boolean
  onBack?: () => void
  children?: React.ReactNode
}

export function ConversationOperationalPanel({
  mode,
  isVisible,
  title,
  canGoBack = false,
  onBack,
  children,
}: ConversationOperationalPanelProps) {
  if (!isVisible) return null

  return (
    <section
      className={cn(
        "border-t border-border/50 bg-background/80 px-4 py-4",
        mode === "immersive" && "min-h-0 flex-1 overflow-y-auto"
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {canGoBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Voltar etapa"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : null}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Conversation OS
            </p>
            <h3 className="text-sm font-semibold text-foreground">
              {title || "Painel operacional"}
            </h3>
          </div>
        </div>

        {children || (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/35 p-4">
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
