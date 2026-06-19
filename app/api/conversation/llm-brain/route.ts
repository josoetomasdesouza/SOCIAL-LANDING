import { NextResponse } from "next/server"
import { resolveLlmBrainReply } from "@/lib/conversation-intelligence/llm-provider"
import type { LlmBrainProviderInput } from "@/lib/conversation-intelligence/types"

export const runtime = "nodejs"

function isProviderInput(value: unknown): value is LlmBrainProviderInput {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false
  }

  const candidate = value as Partial<LlmBrainProviderInput>
  return (
    typeof candidate.message === "string" &&
    typeof candidate.brandName === "string" &&
    typeof candidate.vertical === "string" &&
    Array.isArray(candidate.history) &&
    Array.isArray(candidate.contextItems) &&
    Boolean(candidate.memory) &&
    Boolean(candidate.state) &&
    Boolean(candidate.nextMove) &&
    typeof candidate.interpretedIntent === "string"
  )
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)

  if (!isProviderInput(payload)) {
    return NextResponse.json({ error: "invalid_llm_brain_payload" }, { status: 400 })
  }

  const reply = await resolveLlmBrainReply(payload, { provider: "openai" })
  return NextResponse.json(reply)
}
