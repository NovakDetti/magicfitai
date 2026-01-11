import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { analysisSessions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

/**
 * Get analysis session by guest token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Get the analysis session by guest token
    const analysisSession = await db.query.analysisSessions.findFirst({
      where: eq(analysisSessions.guestToken, token),
    })

    if (!analysisSession) {
      return NextResponse.json(
        { error: "Az elemzés nem található." },
        { status: 404 }
      )
    }

    // Check expiration for guest sessions (only if not claimed)
    if (
      !analysisSession.userId &&
      analysisSession.expiresAt &&
      analysisSession.expiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "Az elemzés lejárt.", expired: true },
        { status: 410 }
      )
    }

    // Return analysis data
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
      canClaim: !analysisSession.userId,
    })
  } catch (error) {
    console.error("Get analysis by token error:", error)
    return NextResponse.json(
      { error: "Hiba történt az elemzés betöltésekor." },
      { status: 500 }
    )
  }
}
