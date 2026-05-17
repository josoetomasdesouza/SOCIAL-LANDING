"use client"

import { useMemo, useReducer } from "react"

export type ConversationProductFlowStep =
  | "idle"
  | "product-entry"
  | "product-detail"
  | "product-options"
  | "cart-summary"
  | "checkout-address"
  | "checkout-payment"
  | "confirmation"

export interface ConversationCheckoutDraft {
  name?: string
  email?: string
  phone?: string
  cep?: string
  address?: string
  number?: string
  complement?: string
  paymentMethod?: "card" | "pix"
}

export interface ConversationProductFlowState {
  isActive: boolean
  step: ConversationProductFlowStep
  searchResultProductIds: string[]
  activeProductId?: string
  selectedVariantsById: Record<string, string>
  quantity: number
  checkoutDraft: ConversationCheckoutDraft
  confirmation?: {
    orderNumber: string
    total: number
    paymentMethod: "card" | "pix"
    estimatedDelivery: string
  }
}

type ConversationProductFlowAction =
  | { type: "OPEN_SEARCH_RESULTS"; productIds: string[] }
  | { type: "OPEN_PRODUCT"; productId: string }
  | { type: "GO_TO_STEP"; step: ConversationProductFlowStep }
  | { type: "SELECT_VARIANT"; variantId: string; optionId: string }
  | { type: "SET_QUANTITY"; quantity: number }
  | { type: "PATCH_CHECKOUT_DRAFT"; patch: Partial<ConversationCheckoutDraft> }
  | {
      type: "GO_TO_CONFIRMATION"
      payload: NonNullable<ConversationProductFlowState["confirmation"]>
    }
  | { type: "RESET_PRODUCT_STATE" }
  | { type: "RESET" }

const INITIAL_STATE: ConversationProductFlowState = {
  isActive: false,
  step: "idle",
  searchResultProductIds: [],
  activeProductId: undefined,
  selectedVariantsById: {},
  quantity: 1,
  checkoutDraft: {},
  confirmation: undefined,
}

function conversationProductFlowReducer(
  state: ConversationProductFlowState,
  action: ConversationProductFlowAction
): ConversationProductFlowState {
  switch (action.type) {
    case "OPEN_SEARCH_RESULTS":
      return {
        ...INITIAL_STATE,
        isActive: true,
        step: "product-entry",
        searchResultProductIds: action.productIds,
      }
    case "OPEN_PRODUCT":
      return {
        ...state,
        isActive: true,
        step: "product-detail",
        activeProductId: action.productId,
        selectedVariantsById: {},
        quantity: 1,
        checkoutDraft: {},
        confirmation: undefined,
      }
    case "GO_TO_STEP":
      return {
        ...state,
        isActive: action.step !== "idle",
        step: action.step,
      }
    case "SELECT_VARIANT":
      return {
        ...state,
        selectedVariantsById: {
          ...state.selectedVariantsById,
          [action.variantId]: action.optionId,
        },
      }
    case "SET_QUANTITY":
      return {
        ...state,
        quantity: Math.max(1, action.quantity),
      }
    case "PATCH_CHECKOUT_DRAFT":
      return {
        ...state,
        checkoutDraft: {
          ...state.checkoutDraft,
          ...action.patch,
        },
      }
    case "GO_TO_CONFIRMATION":
      return {
        ...state,
        step: "confirmation",
        confirmation: action.payload,
      }
    case "RESET_PRODUCT_STATE":
      return {
        ...INITIAL_STATE,
      }
    case "RESET":
      return {
        ...INITIAL_STATE,
      }
    default:
      return state
  }
}

export interface ConversationProductFlowActions {
  openSearchResults: (productIds: string[]) => void
  openProduct: (productId: string) => void
  goToStep: (step: ConversationProductFlowStep) => void
  selectVariant: (variantId: string, optionId: string) => void
  setQuantity: (quantity: number) => void
  patchCheckoutDraft: (patch: Partial<ConversationCheckoutDraft>) => void
  goToConfirmation: (payload: NonNullable<ConversationProductFlowState["confirmation"]>) => void
  resetProductState: () => void
  reset: () => void
}

export function useConversationProductFlow() {
  const [state, dispatch] = useReducer(conversationProductFlowReducer, INITIAL_STATE)

  const actions = useMemo<ConversationProductFlowActions>(
    () => ({
      openSearchResults: (productIds) => dispatch({ type: "OPEN_SEARCH_RESULTS", productIds }),
      openProduct: (productId) => dispatch({ type: "OPEN_PRODUCT", productId }),
      goToStep: (step) => dispatch({ type: "GO_TO_STEP", step }),
      selectVariant: (variantId, optionId) => dispatch({ type: "SELECT_VARIANT", variantId, optionId }),
      setQuantity: (quantity) => dispatch({ type: "SET_QUANTITY", quantity }),
      patchCheckoutDraft: (patch) => dispatch({ type: "PATCH_CHECKOUT_DRAFT", patch }),
      goToConfirmation: (payload) => dispatch({ type: "GO_TO_CONFIRMATION", payload }),
      resetProductState: () => dispatch({ type: "RESET_PRODUCT_STATE" }),
      reset: () => dispatch({ type: "RESET" }),
    }),
    []
  )

  return {
    state,
    actions,
  }
}
