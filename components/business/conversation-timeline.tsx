"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import type { ConversationMessage } from "@/lib/business-types"
import type {
  ConversationVisualBlock,
  ConversationVisualBlockRenderer,
} from "@/lib/mock-data/conversational-search"
import {
  ConversationContextStrip,
  type ConversationOSContextItem,
} from "./conversation-context-strip"

const USER_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"

export type ConversationRuntimeMessage = ConversationMessage & {
  visualBlock?: ConversationVisualBlock
}

interface ConversationTimelineProps {
  brandLogo: string
  brandName: string
  messages: ConversationRuntimeMessage[]
  isTyping: boolean
  renderTimelineVisualBlock?: ConversationVisualBlockRenderer
  onRemoveContext?: (contextId: string) => void
  hiddenContextIds?: string[]
}

export function ConversationTimeline({
  brandLogo,
  brandName,
  messages,
  isTyping,
  renderTimelineVisualBlock,
  onRemoveContext,
  hiddenContextIds = [],
}: ConversationTimelineProps) {
  const hiddenIds = new Set(hiddenContextIds)

  return (
    <div className="space-y-3">
      {messages.map((message) => {
        if (message.role === "context_event") {
          const eventContexts = (message.contexts ?? (message.context ? [message.context] : [])).filter(
            (item) => !hiddenIds.has(item.id)
          )

          if (eventContexts.length === 0) {
            return null
          }

          return (
            <div key={message.id} className="py-0.5">
              <ConversationContextStrip
                items={eventContexts as ConversationOSContextItem[]}
                onRemoveContext={onRemoveContext}
              />
            </div>
          )
        }

        return (
          <div
            key={message.id}
            className={cn("flex items-end gap-2.5", message.role === "user" && "justify-end")}
          >
            {message.role !== "user" ? (
              <Image
                src={brandLogo}
                alt={brandName}
                width={28}
                height={28}
                className="rounded-full border border-border/60 object-cover"
              />
            ) : null}

            <div className={cn("flex max-w-[82%] flex-col gap-2", message.role === "user" && "items-end")}>
              <div
                className={cn(
                  "rounded-[22px] px-4 py-3 text-sm leading-relaxed shadow-sm",
                  message.role === "user"
                    ? "rounded-br-md bg-foreground text-background"
                    : "rounded-bl-md bg-secondary text-foreground"
                )}
              >
                {message.content}
              </div>

              {message.role === "ai" && message.visualBlock
                ? renderTimelineVisualBlock?.(message.visualBlock)
                : null}
            </div>

            {message.role === "user" ? (
              <Image
                src={USER_AVATAR}
                alt="Voce"
                width={28}
                height={28}
                className="rounded-full border border-border/60 object-cover"
              />
            ) : null}
          </div>
        )
      })}

      {isTyping && (
        <div className="flex items-end gap-2.5">
          <Image
            src={brandLogo}
            alt={brandName}
            width={28}
            height={28}
            className="rounded-full border border-border/60 object-cover"
          />
          <div className="rounded-[22px] rounded-bl-md bg-secondary px-4 py-3 text-foreground shadow-sm">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.2s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.1s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
