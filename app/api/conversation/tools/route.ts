import { NextResponse } from "next/server"
import {
  resolveUniversalToolLocal,
  routeConversationTool,
  type ToolRouterInput,
} from "@/lib/conversation-intelligence/tool-router"

export const runtime = "nodejs"

function isToolRouterInput(value: unknown): value is ToolRouterInput {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false
  const candidate = value as Partial<ToolRouterInput>

  return (
    typeof candidate.message === "string" &&
    Array.isArray(candidate.topicStack)
  )
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)

  if (!isToolRouterInput(payload)) {
    return NextResponse.json({ error: "invalid_tool_router_payload" }, { status: 400 })
  }

  const routed = await routeConversationTool(payload, {
    provider: async (tool, input) => resolveUniversalToolLocal(tool, input),
  })

  return NextResponse.json(routed)
}
