import type { KernelAction, ModelContextPack } from "./types"

export const KERNEL_ACTION_REGISTRY = {
  text_only: { label: "Resposta textual", requiresHostBlock: false },
  delegate_transactional_resolver: {
    label: "Delegar ao resolver transacional WS-08C",
    requiresHostBlock: true,
  },
  show_catalog_cards: { label: "Cards editoriais do catálogo", requiresHostBlock: true },
  show_schedule_prompt: { label: "Prompt de agenda", requiresHostBlock: true },
  bridge_to_page: { label: "Ponte para seção da LP", requiresHostBlock: false },
  situated_fallback: { label: "Fallback situado V1", requiresHostBlock: false },
  ack_meta_complaint: { label: "Ack frustração", requiresHostBlock: false },
} as const

export function isTransactionalDelegate(action: KernelAction): boolean {
  return action.type === "delegate_transactional_resolver"
}

export function canHostRenderAction(pack: ModelContextPack, action: KernelAction): boolean {
  switch (action.type) {
    case "show_catalog_cards":
      return pack.capabilities.visualBlockKinds.length > 0
    case "show_schedule_prompt":
      return pack.capabilities.supportsSchedulePrompt
    case "delegate_transactional_resolver":
      return Boolean(pack.transactionalResolverId)
    default:
      return true
  }
}
