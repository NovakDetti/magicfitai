import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { analysisSessions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/analysis/[id]/export
 *
 * Export image data for an analysis session.
 * Returns URLs for downloading original and AI-generated images.
 *
 * Query params:
 * - token: guest token for authorization
 * - type: "before" | "after" | "all" (default: "all")
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await auth()
    const userId = session?.user?.id

    const guestToken = request.nextUrl.searchParams.get("token")
    const exportType = request.nextUrl.searchParams.get("type") || "all"

    // Get analysis session
    const analysis = await db.query.analysisSessions.findFirst({
      where: eq(analysisSessions.id, id),
    })

    if (!analysis) {
      return NextResponse.json(
        { error: "Elemzés nem található." },
        { status: 404 }
      )
    }

    // Check authorization
    const isOwner = userId && analysis.userId === userId
    const hasValidToken = guestToken && analysis.guestToken === guestToken

    if (!isOwner && !hasValidToken) {
      return NextResponse.json(
        { error: "Nincs jogosultságod ehhez az elemzéshez." },
        { status: 403 }
      )
    }

    // Check if analysis is complete
    if (analysis.status !== "complete") {
      return NextResponse.json(
        { error: "Az elemzés még nem készült el." },
        { status: 400 }
      )
    }

    // Build response based on export type
    const result: {
      beforeImage?: string | null
      afterImages?: (string | undefined)[]
      looks?: { id: string; title: string; afterImageUrl?: string }[]
    } = {}

    if (exportType === "before" || exportType === "all") {
      result.beforeImage = analysis.beforeImageUrl
    }

    if (exportType === "after" || exportType === "all") {
      // Get after images from looks and afterImages array
      const lookImages =
        analysis.looks?.map((look) => ({
          id: look.id,
          title: look.title,
          afterImageUrl: look.afterImageUrl,
        })) || []

      result.looks = lookImages
      result.afterImages = analysis.afterImages || []
    }

    return NextResponse.json({
      sessionId: analysis.id,
      occasion: analysis.occasion,
      createdAt: analysis.createdAt,
      ...result,
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Hiba történt az exportálás során." },
      { status: 500 }
    )
  }
}
