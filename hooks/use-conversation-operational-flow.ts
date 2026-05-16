"use client"

import { useCallback, useMemo, useReducer } from "react"

export type ConversationSurfaceMode = "default" | "immersive"
export type ConversationActiveFlow = "none" | "product"
export type ConversationActivePanel = "none" | "product-flow"

export interface ConversationBackEntry {
  flow: ConversationActiveFlow
  step?: string
  productId?: string
}

export interface ConversationOperationalState {
  surfaceMode: ConversationSurfaceMode
  activeFlow: ConversationActiveFlow
  activePanel: ConversationActivePanel
  backStack: ConversationBackEntry[]
}

type ConversationOperationalAction =
  | { type: "ENTER_IMMERSIVE" }
  | { type: "EXIT_IMMERSIVE" }
  | { type: "OPEN_PRODUCT_FLOW" }
  | { type: "CLOSE_PANEL" }
  | { type: "PUSH_BACK_ENTRY"; entry: ConversationBackEntry }
  | { type: "BACK" }
  | { type: "RESET" }

const INITIAL_STATE: ConversationOperationalState = {
  surfaceMode: "default",
  activeFlow: "none",
  activePanel: "none",
  backStack: [],
}

function conversationOperationalReducer(
  state: ConversationOperationalState,
  action: ConversationOperationalAction
): ConversationOperationalState {
  switch (action.type) {
    case "ENTER_IMMERSIVE":
      return {
        ...state,
        surfaceMode: "immersive",
      }
    case "EXIT_IMMERSIVE":
      return {
        ...state,
        surfaceMode: "default",
      }
    case "OPEN_PRODUCT_FLOW":
      return {
        surfaceMode: "immersive",
        activeFlow: "product",
        activePanel: "product-flow",
        backStack: [],
      }
    case "CLOSE_PANEL":
      return {
        ...INITIAL_STATE,
      }
    case "PUSH_BACK_ENTRY":
      return {
        ...state,
        backStack: [...state.backStack, action.entry],
      }
    case "BACK":
      if (state.backStack.length === 0) {
        return {
          ...INITIAL_STATE,
        }
      }

      return {
        ...state,
        backStack: state.backStack.slice(0, -1),
      }
    case "RESET":
      return {
        ...INITIAL_STATE,
      }
    default:
      return state
  }
}

export interface ConversationOperationalActions {
  enterImmersive: () => void
  exitImmersive: () => void
  openProductFlow: () => void
  closePanel: () => void
  pushBackEntry: (entry: ConversationBackEntry) => void
  back: () => void
  reset: () => void
}

export function useConversationOperationalFlow() {
  const [state, dispatch] = useReducer(conversationOperationalReducer, INITIAL_STATE)

  const actions = useMemo<ConversationOperationalActions>(
    () => ({
      enterImmersive: () => dispatch({ type: "ENTER_IMMERSIVE" }),
      exitImmersive: () => dispatch({ type: "EXIT_IMMERSIVE" }),
      openProductFlow: () => dispatch({ type: "OPEN_PRODUCT_FLOW" }),
      closePanel: () => dispatch({ type: "CLOSE_PANEL" }),
      pushBackEntry: (entry) => dispatch({ type: "PUSH_BACK_ENTRY", entry }),
      back: () => dispatch({ type: "BACK" }),
      reset: () => dispatch({ type: "RESET" }),
    }),
    []
  )

  const isOperationalPanelVisible = useCallback(
    () => state.activePanel !== "none",
    [state.activePanel]
  )

  return {
    state,
    actions,
    isOperationalPanelVisible,
  }
}
