import {
  buildAppointmentModelContextPack,
  type AppointmentPackBuildInput,
} from "@/lib/conversation-kernel/appointment/build-appointment-model-context-pack"
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

    if (input.contextItems.length > 0) {
      const fromKernelFirst = runKernel()
      if (fromKernelFirst) {
        touchKernelSessionFromMessage(input.message, kernelSession)
        return fromKernelFirst
      }
    }

    const fromTransactional = transactionalResolver(input)
    if (fromTransactional) {
      touchKernelSessionFromMessage(input.message, kernelSession)
      return fromTransactional
    }

    const fromKernel = runKernel()
    if (fromKernel) {
      touchKernelSessionFromMessage(input.message, kernelSession)
      return fromKernel
    }

    const fromDialogue = dialogueResolver(input)
    if (fromDialogue) {
      touchKernelSessionFromMessage(input.message, kernelSession)
      return fromDialogue
    }

    touchKernelSessionFromMessage(input.message, kernelSession)
    return fallbackResolver(input)
  }
}
