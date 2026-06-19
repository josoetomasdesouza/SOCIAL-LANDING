import { NextRequest, NextResponse } from "next/server"

import { applyBusinessOperationalAiToDraft } from "@/lib/runtime/business/operational-ai/apply-draft.server"
import {
  BUSINESS_OPERATIONAL_AI_KINDS,
  type BusinessOperationalAiKind,
} from "@/lib/runtime/business/operational-ai/types"

interface DraftOperationalAiRouteParams {
  params: Promise<{
    draftId: string
  }>
}

function isBusinessOperationalAiKind(value: unknown): value is BusinessOperationalAiKind {
  return typeof value === "string" && (BUSINESS_OPERATIONAL_AI_KINDS as readonly string[]).includes(value)
}

export async function POST(request: NextRequest, { params }: DraftOperationalAiRouteParams) {
  try {
    const { draftId } = await params
    const body = await request.json() as {
      kind?: unknown
      operatorBrief?: unknown
    }

    if (!isBusinessOperationalAiKind(body.kind)) {
      return NextResponse.json(
        { error: "invalid operational AI kind" },
        { status: 400 }
      )
    }

    const result = applyBusinessOperationalAiToDraft(draftId, {
      kind: body.kind,
      operatorBrief: typeof body.operatorBrief === "string" ? body.operatorBrief : undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to apply operational AI patch" },
      { status: 500 }
    )
  }
}
