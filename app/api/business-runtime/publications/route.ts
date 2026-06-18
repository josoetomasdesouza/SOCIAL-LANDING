import { NextRequest, NextResponse } from "next/server"

import {
  listBusinessRuntimePublications,
  publishBusinessRuntimeDraft,
} from "@/lib/runtime/business/publication"

export async function GET() {
  return NextResponse.json({
    publications: listBusinessRuntimePublications(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { draftId?: string }

    if (!body.draftId) {
      return NextResponse.json({ error: "draftId is required" }, { status: 400 })
    }

    const result = publishBusinessRuntimeDraft(body.draftId)

    return NextResponse.json({
      slug: result.publication.slug,
      draftId: result.publication.draftId,
      runtime: result.publication.runtime,
      publishedAt: result.publication.publishedAt,
      updatedAt: result.publication.updatedAt,
      backupKey: result.backupKey,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to publish draft" },
      { status: 500 }
    )
  }
}
