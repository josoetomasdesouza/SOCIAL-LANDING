import { cn } from "@/lib/utils"

/** S1 — in-flow v2 engaged turn typography (Appointment pilot). */
export const CONVERSATION_TURN_EDITORIAL_BODY =
  "text-pretty text-[16px] leading-[1.62] tracking-[-0.008em] text-foreground/93"

export function conversationTurnSpacingClass(
  index: number,
  sharesGroupWithPrevious: boolean,
  inFlowThread: boolean
) {
  if (index === 0) {
    return ""
  }

  if (inFlowThread) {
    return sharesGroupWithPrevious ? "mt-3.5" : "mt-8"
  }

  return sharesGroupWithPrevious ? "mt-3" : "mt-7"
}

export function conversationTurnUserClass(inFlowThread: boolean) {
  if (!inFlowThread) {
    return "rounded-[24px] rounded-br-[10px] border border-white/[0.07] bg-[rgba(62,70,79,0.96)] px-4 py-3.5 text-left text-[15px] text-white/[0.96] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.72)]"
  }

  return cn(CONVERSATION_TURN_EDITORIAL_BODY, "font-medium text-foreground/88")
}

export function conversationTurnAiClass(inFlowThread: boolean) {
  if (!inFlowThread) {
    return "px-0 py-0.5 text-left text-[15px] text-foreground/90"
  }

  return cn(CONVERSATION_TURN_EDITORIAL_BODY, "font-normal text-foreground/[0.96]")
}
