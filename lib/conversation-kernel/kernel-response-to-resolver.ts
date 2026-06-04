import type { ConversationResponseResolverResult } from "@/lib/mock-data/conversational-search"
import type { KernelResponse, ModelContextPack } from "./types"
import { isTransactionalDelegate } from "./action-registry"

const AUGUSTA_FALLBACK_PATTERN =
  /veja servi[cç]os e profissionais no feed quando quiser/i

export function kernelResponseToResolverResult(
  response: KernelResponse,
  _pack: ModelContextPack
): ConversationResponseResolverResult | null {
  if (isTransactionalDelegate(response.action)) {
    return null
  }

  if (response.action.type === "situated_fallback") {
    return null
  }

  if (AUGUSTA_FALLBACK_PATTERN.test(response.reply)) {
    return null
  }

  return { text: response.reply }
}

export function shouldRunTransactionalAfterKernel(response: KernelResponse | null): boolean {
  if (!response) return true
  return isTransactionalDelegate(response.action)
}
