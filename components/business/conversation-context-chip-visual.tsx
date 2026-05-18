"use client"

import Image from "next/image"
import { X } from "lucide-react"
import { forwardRef, type CSSProperties } from "react"
import { cn } from "@/lib/utils"
import {
  conversationContextChipMediaClassName,
  conversationContextChipRemoveButtonClassName,
  conversationContextChipRemovablePaddingClassName,
  conversationContextChipShellClassName,
  conversationContextChipSubtitleClassName,
  conversationContextChipTextClassName,
  conversationContextChipTitleClassName,
} from "./conversation-context-chip-styles"

interface ConversationContextChipVisualItem {
  title: string
  subtitle?: string
  image: string
}

interface ConversationContextChipVisualProps {
  item: ConversationContextChipVisualItem
  className?: string
  style?: CSSProperties
  hidden?: boolean
  dataConversationContextChip?: string
  removeMode?: "interactive" | "decorative" | "none"
  onRemove?: () => void
  removeAriaLabel?: string
  tabIndex?: number
}

export const ConversationContextChipVisual = forwardRef<HTMLDivElement, ConversationContextChipVisualProps>(
  function ConversationContextChipVisual(
    {
      item,
      className,
      style,
      hidden = false,
      dataConversationContextChip,
      removeMode = "none",
      onRemove,
      removeAriaLabel,
      tabIndex,
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        data-conversation-context-chip={dataConversationContextChip}
        aria-hidden={hidden || undefined}
        className={cn(
          conversationContextChipShellClassName,
          conversationContextChipRemovablePaddingClassName,
          hidden && "pointer-events-none opacity-0",
          className
        )}
        style={style}
      >
        <div className={conversationContextChipMediaClassName}>
          <Image src={item.image} alt={item.title} fill className="object-cover" />
        </div>

        <div className={conversationContextChipTextClassName}>
          {item.subtitle ? (
            <p className={conversationContextChipSubtitleClassName}>
              {item.subtitle}
            </p>
          ) : null}
          <p className={conversationContextChipTitleClassName}>{item.title}</p>
        </div>

        {removeMode === "interactive" ? (
          <button
            type="button"
            onClick={onRemove}
            disabled={hidden}
            className={conversationContextChipRemoveButtonClassName}
            aria-label={removeAriaLabel}
            tabIndex={hidden ? -1 : tabIndex}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}

        {removeMode === "decorative" ? (
          <button
            type="button"
            disabled
            aria-hidden="true"
            tabIndex={-1}
            className={conversationContextChipRemoveButtonClassName}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    )
  }
)
