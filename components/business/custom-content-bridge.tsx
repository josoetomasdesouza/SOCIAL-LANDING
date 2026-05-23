"use client"

import type { ReactNode } from "react"
import type { ConversationContextItem } from "./conversational-ai"

interface CustomContentBridgeProps {
  children: ReactNode
  onToggleConversationContext?: (item: ConversationContextItem) => void
  isInConversation?: (id: string) => boolean
}

/**
 * Absorbs conversation props injected by BusinessSocialLanding cloneElement
 * so they never leak onto Fragment/DOM nodes in Stack B custom sections.
 */
export function CustomContentBridge({ children }: CustomContentBridgeProps) {
  return children
}
