import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { analysisSessions } from "@/lib/db/schema"
import { eq, and, isNull } from "drizzle-orm"

/**
 * Claim a guest analysis result to a user account
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Bejelentkezés szükséges." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { guestToken } = body as { guestToken: string }

    if (!guestToken) {
      return NextResponse.json(
        { error: "Hiányzó token." },
        { status: 400 }
      )
    }

    // Find the analysis session
    const analysisSession = await db.query.analysisSessions.findFirst({
      where: and(
        eq(analysisSessions.guestToken, guestToken),
        isNull(analysisSessions.userId)
      ),
    })

    if (!analysisSession) {
      return NextResponse.json(
        { error: "Az elemzés nem található vagy már hozzá van rendelve egy fiókhoz." },
        { status: 404 }
      )
    }

    // Check if expired
    if (analysisSession.expiresAt && analysisSession.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Az elemzés lejárt." },
        { status: 410 }
      )
    }

    // Claim the session
    await db
      .update(analysisSessions)
      .set({
        userId: session.user.id,
        claimedAt: new Date(),
        // Keep guest token for backwards compatibility but remove expiration
        expiresAt: null,
      })
      .where(eq(analysisSessions.id, analysisSession.id))

    return NextResponse.json({
      success: true,
      analysisId: analysisSession.id,
      message: "Az elemzés sikeresen hozzáadva a fiókodhoz.",
    })
  } catch (error) {
    console.error("Claim error:", error)
    return NextResponse.json(
      { error: "Hiba történt az elemzés átvételekor." },
      { status: 500 }
    )
  }
}
