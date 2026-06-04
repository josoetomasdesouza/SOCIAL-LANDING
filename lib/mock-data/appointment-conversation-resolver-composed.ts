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

export function createAppointmentConversationResolverWithDialogue(
  ctx: EstablishmentDialogueContext
): ConversationResponseResolver {
  const transactionalResolver = createAppointmentMockConversationResolver()
  const session = createEstablishmentDialogueSession()

  return (input) => {
    const fromTransactional = transactionalResolver(input)
    if (fromTransactional) {
      return fromTransactional
    }

    const fromDialogue = resolveEstablishmentDialogueV1(input, ctx, session)
    if (fromDialogue) {
      return fromDialogue
    }

    return situatedFallbackV1(input, ctx, session)
  }
}
