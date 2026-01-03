import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { analysisSessions } from "@/lib/db/schema"
import { eq, or, and } from "drizzle-orm"

/**
 * Get analysis session by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    const userId = session?.user?.id

    // Get the analysis session
    const analysisSession = await db.query.analysisSessions.findFirst({
      where: eq(analysisSessions.id, id),
    })

    if (!analysisSession) {
      return NextResponse.json(
        { error: "Az elemzés nem található." },
        { status: 404 }
      )
    }

    // Check access
    const hasAccess =
      // Owner access
      (analysisSession.userId && analysisSession.userId === userId) ||
      // Guest token access (check query param)
      (analysisSession.guestToken &&
        request.nextUrl.searchParams.get("token") === analysisSession.guestToken)

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Nincs jogosultság az elemzéshez." },
        { status: 403 }
      )
    }

    // Check expiration for guest sessions
    if (
      analysisSession.guestToken &&
      !analysisSession.userId &&
      analysisSession.expiresAt &&
      analysisSession.expiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "Az elemzés lejárt.", expired: true },
        { status: 410 }
      )
    }

    // Return analysis data (hide sensitive fields)
    return NextResponse.json({
      id: analysisSession.id,
      status: analysisSession.status,
      occasion: analysisSession.occasion,
      toggles: analysisSession.toggles,
      beforeImageUrl: analysisSession.beforeImageUrl,
      observations: analysisSession.observations,
      looks: analysisSession.looks,
      afterImages: analysisSession.afterImages,
      pdfUrl: analysisSession.pdfUrl,
      createdAt: analysisSession.createdAt,
      completedAt: analysisSession.completedAt,
      isOwned: !!analysisSession.userId,
      canClaim: !analysisSession.userId && !!userId,
    })
  } catch (error) {
    console.error("Get analysis error:", error)
    return NextResponse.json(
      { error: "Hiba történt az elemzés betöltésekor." },
      { status: 500 }
    )
  }
}
