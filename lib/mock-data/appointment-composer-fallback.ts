import { resolveBroadClarification } from "@/lib/conversation-kernel/broad-clarification"
import { resolveChipTurn } from "@/lib/conversation-kernel/resolve-chip-turn"
import type { ModelContextPack } from "@/lib/conversation-kernel/types"

/** Appointment never uses host mock rotation when the composed resolver returns null. */
export function resolveAppointmentComposerFallback(
  message: string,
  pack: ModelContextPack
): string {
  const chip = pack.selectedContextItems[0]
  if (chip) {
    return resolveChipTurn(message, pack, chip).reply
  }
  return resolveBroadClarification(pack).reply
}
