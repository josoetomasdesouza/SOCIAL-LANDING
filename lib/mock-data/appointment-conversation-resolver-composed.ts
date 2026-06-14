import { createAppointmentMockConversationResolver } from "@/lib/mock-data/appointment-conversational-search"
import type { ConversationCatalogSummary } from "@/lib/conversation-intelligence/types"
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
import { createConversationIntelligenceResolver } from "@/lib/conversation-intelligence/resolver-adapter"

export type AppointmentComposedResolverOptions = EstablishmentDialogueContext &
  Pick<AppointmentKernelAdapterOptions, "services" | "professionals" | "feedPosts">

function buildAppointmentCatalogSummary(ctx: AppointmentComposedResolverOptions): ConversationCatalogSummary {
  return {
    services: (ctx.services ?? []).slice(0, 12).map((service) => ({
      id: service.id,
      name: service.name,
      kind: "service",
      detail: [service.category, service.description].filter(Boolean).join(" · "),
    })),
    professionals: (ctx.professionals ?? []).slice(0, 8).map((professional) => ({
      id: professional.id,
      name: professional.name,
      kind: "professional",
      detail: [professional.role, professional.specialties?.slice(0, 4).join(", ")].filter(Boolean).join(" · "),
    })),
  }
}

export function createAppointmentConversationResolverWithDialogue(
  ctx: AppointmentComposedResolverOptions
): ConversationResponseResolver {
  const transactionalResolver = createAppointmentMockConversationResolver()
  const session = createEstablishmentDialogueSession()

  const dialogueResolver: ConversationResponseResolver = (input) =>
    resolveEstablishmentDialogueV1(input, ctx, session)

  const fallbackResolver: ConversationResponseResolver = (input) =>
    situatedFallbackV1(input, ctx, session)

  const baseResolver = createAppointmentConversationResolverWithKernel({
    ctx,
    services: ctx.services,
    professionals: ctx.professionals,
    feedPosts: ctx.feedPosts,
    transactionalResolver,
    dialogueResolver,
    fallbackResolver,
  })

  return createConversationIntelligenceResolver({
    brandName: ctx.brandName,
    baseResolver,
    actionResolver: transactionalResolver,
    catalogSummary: buildAppointmentCatalogSummary(ctx),
  })
}
