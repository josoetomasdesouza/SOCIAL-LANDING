import {
  buildAppointmentModelContextPack,
  type AppointmentPackBuildInput,
} from "@/lib/conversation-kernel/appointment/build-appointment-model-context-pack"
import { isVideoChipContentInquiry } from "@/lib/conversation-kernel/conversation-priority"
import { resolveBroadClarification } from "@/lib/conversation-kernel/broad-clarification"
import { kernelResponseToResolverResult } from "@/lib/conversation-kernel/kernel-response-to-resolver"
import { resolveRuleKernelStub, touchKernelSessionFromMessage } from "@/lib/conversation-kernel/rule-kernel-stub"
import { createKernelSession, type KernelSession } from "@/lib/conversation-kernel/types"
import type {
  ConversationResponseResolver,
  ConversationResponseResolverInput,
  ConversationResponseResolverResult,
} from "@/lib/mock-data/conversational-search"

export interface AppointmentKernelAdapterOptions extends AppointmentPackBuildInput {
  transactionalResolver: ConversationResponseResolver
  dialogueResolver: ConversationResponseResolver
  fallbackResolver: ConversationResponseResolver
}

export function createAppointmentConversationResolverWithKernel(
  options: AppointmentKernelAdapterOptions
): ConversationResponseResolver {
  const kernelSession: KernelSession = createKernelSession()
  const { transactionalResolver, dialogueResolver, fallbackResolver } = options

  return (input: ConversationResponseResolverInput): ConversationResponseResolverResult | null => {
    const pack = buildAppointmentModelContextPack({
      ...options,
      contextItems: input.contextItems,
    })

    const runKernel = (): ConversationResponseResolverResult | null => {
      const kernelResponse = resolveRuleKernelStub({
        message: input.message,
        pack,
        session: kernelSession,
        contextItems: input.contextItems,
      })
      if (!kernelResponse) return null
      return kernelResponseToResolverResult(kernelResponse, pack)
    }

    let result: ConversationResponseResolverResult | null = null

    if (input.contextItems.length > 0) {
      result = runKernel()
    }

    if (!result) {
      const chip0 = pack.selectedContextItems[0]
      const skipTransactional = chip0 && isVideoChipContentInquiry(input.message, chip0)
      if (!skipTransactional) {
        result = transactionalResolver(input)
      }
    }

    if (!result) {
      result = runKernel()
    }

    if (!result) {
      result = dialogueResolver(input)
    }

    if (!result) {
      const m = input.message
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .toLowerCase()
        .trim()
      const vagueOnly =
        pack.selectedContextItems.length === 0 ||
        (/\b(me fala|fala ai|nao entendi|não entendi)\b/.test(m) && m.length < 28)
      if (vagueOnly) {
        const broad = resolveBroadClarification(pack)
        result = kernelResponseToResolverResult(broad, pack)
      }
    }

    if (!result) {
      result = fallbackResolver(input)
    }

    touchKernelSessionFromMessage(input.message, kernelSession, pack)
    return result
  }
}
