import {
  buildAppointmentModelContextPack,
  type AppointmentPackBuildInput,
} from "@/lib/conversation-kernel/appointment/build-appointment-model-context-pack"
import { resolveBroadClarification } from "@/lib/conversation-kernel/broad-clarification"
import { polishAppointmentReply } from "@/lib/conversation-kernel/augusta-guard"
import { isEditorialChipAnchoredTurn } from "@/lib/conversation-kernel/conversation-priority"
import { normalizeUserMessageForKernel } from "@/lib/conversation-kernel/user-message-normalize"
import { kernelResponseToResolverResult } from "@/lib/conversation-kernel/kernel-response-to-resolver"
import { resolveRuleKernelStub, touchKernelSessionFromMessage } from "@/lib/conversation-kernel/rule-kernel-stub"
import { createKernelSession, type KernelSession } from "@/lib/conversation-kernel/types"
import type { ModelContextPack } from "@/lib/conversation-kernel/types"
import { resolveAppointmentComposerFallback } from "@/lib/mock-data/appointment-composer-fallback"
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

  const resolveMaybeAsync = (
    value: ConversationResponseResolverResult | null | Promise<ConversationResponseResolverResult | null>
  ) => Promise.resolve(value)

  return async (input: ConversationResponseResolverInput): Promise<ConversationResponseResolverResult | null> => {
    const message = normalizeUserMessageForKernel(input.message)
    const resolvedInput = { ...input, message }
    const hasChip = resolvedInput.contextItems.length > 0

    const guardResult = (result: ConversationResponseResolverResult | null): ConversationResponseResolverResult | null => {
      if (!result?.text) return result
      return { ...result, text: polishAppointmentReply(result.text, hasChip) }
    }

    const pack = buildAppointmentModelContextPack({
      ...options,
      contextItems: resolvedInput.contextItems,
    })

    const kernelResponse = resolveRuleKernelStub({
      message,
      pack,
      session: kernelSession,
      contextItems: resolvedInput.contextItems,
    })
    let result: ConversationResponseResolverResult | null = guardResult(
      kernelResponse ? kernelResponseToResolverResult(kernelResponse, pack) : null
    )

    if (!result && !isEditorialChipAnchoredTurn(message, pack)) {
      result = guardResult(await resolveMaybeAsync(transactionalResolver(resolvedInput)))
    }

    if (!result && !hasChip) {
      result = guardResult(await resolveMaybeAsync(dialogueResolver(resolvedInput)))
    }

    if (!result && !hasChip) {
      const broad = resolveBroadClarification(pack, kernelSession)
      result = guardResult(kernelResponseToResolverResult(broad, pack))
    }

    if (!result && !hasChip) {
      result = guardResult(await resolveMaybeAsync(fallbackResolver(resolvedInput)))
    }

    if (!result) {
      result = {
        text: polishAppointmentReply(resolveAppointmentComposerFallback(message, pack), hasChip),
      }
    }

    touchKernelSessionFromMessage(message, kernelSession, pack)
    return guardResult(result)
  }
}
