import { NextRequest, NextResponse } from "next/server"

import type { BusinessRuntime } from "@/lib/runtime/business"
import {
  deleteBusinessRuntimeDraft,
  loadBusinessRuntimeDraft,
  updateBusinessRuntimeDraft,
} from "@/lib/runtime/business/drafts/storage.server"

interface DraftRouteParams {
  params: Promise<{
    draftId: string
  }>
}

export async function GET(_request: NextRequest, { params }: DraftRouteParams) {
  const { draftId } = await params
  const record = loadBusinessRuntimeDraft(draftId)

  if (!record) {
    return NextResponse.json({ error: "draft not found" }, { status: 404 })
  }

  return NextResponse.json(record)
}

export async function PATCH(request: NextRequest, { params }: DraftRouteParams) {
  try {
    const { draftId } = await params
    const runtime = await request.json() as BusinessRuntime
    const record = updateBusinessRuntimeDraft(draftId, runtime)

    return NextResponse.json(record)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update draft" },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: DraftRouteParams) {
  const { draftId } = await params
  const result = deleteBusinessRuntimeDraft(draftId)

  return NextResponse.json({
    draftId,
    deleted: result.deleted,
  })
}
