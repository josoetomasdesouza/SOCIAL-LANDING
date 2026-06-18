import { NextRequest, NextResponse } from "next/server"

import { loadBusinessRuntimePublication } from "@/lib/runtime/business/publication"

interface PublicationRouteParams {
  params: Promise<{
    slug: string
  }>
}

export async function GET(_request: NextRequest, { params }: PublicationRouteParams) {
  const { slug } = await params
  const publication = loadBusinessRuntimePublication(slug)

  if (!publication) {
    return NextResponse.json({ error: "publication not found" }, { status: 404 })
  }

  return NextResponse.json(publication)
}
