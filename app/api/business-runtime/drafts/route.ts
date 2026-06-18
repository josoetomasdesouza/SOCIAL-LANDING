import { NextRequest, NextResponse } from "next/server"

import {
  createBusinessRuntimeDraft,
  listBusinessRuntimeDrafts,
} from "@/lib/runtime/business/drafts/storage.server"
import type { BusinessRuntimeDraftInput } from "@/lib/runtime/business/drafts"

export async function GET() {
  return NextResponse.json({
    drafts: listBusinessRuntimeDrafts(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const input = await request.json() as BusinessRuntimeDraftInput

    if (!input.name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    const record = createBusinessRuntimeDraft(input)

    return NextResponse.json({
      draftId: record.draftId,
      runtime: record.runtime,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create draft" },
      { status: 500 }
    )
  }
}
