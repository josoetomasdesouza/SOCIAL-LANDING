import { createAppointmentMockConversationResolver } from "@/lib/mock-data/appointment-conversational-search"
import {
  createEstablishmentDialogueSession,
  type EstablishmentDialogueContext,
} from "@/lib/mock-data/appointment-establishment-dialogue-context"
import {
  resolveEstablishmentDialogueV1,
  situatedFallbackV1,
} from "@/lib/mock-data/appointment-establishment-dialogue-v1"
import type { ConversationResponseResolver } from "@/lib/mock-data/conversational-search"
import {
  createAppointmentConversationResolverWithKernel,
  type AppointmentKernelAdapterOptions,
} from "@/lib/mock-data/appointment-conversation-kernel-adapter"

export type AppointmentComposedResolverOptions = EstablishmentDialogueContext &
  Pick<AppointmentKernelAdapterOptions, "services" | "professionals" | "feedPosts">

export function createAppointmentConversationResolverWithDialogue(
  ctx: AppointmentComposedResolverOptions
): ConversationResponseResolver {
  const transactionalResolver = createAppointmentMockConversationResolver()
  const session = createEstablishmentDialogueSession()

  const dialogueResolver: ConversationResponseResolver = (input) =>
    resolveEstablishmentDialogueV1(input, ctx, session)

  const fallbackResolver: ConversationResponseResolver = (input) =>
    situatedFallbackV1(input, ctx, session)

  return createAppointmentConversationResolverWithKernel({
    ctx,
    services: ctx.services,
    professionals: ctx.professionals,
    feedPosts: ctx.feedPosts,
    transactionalResolver,
    dialogueResolver,
    fallbackResolver,
  })
}
