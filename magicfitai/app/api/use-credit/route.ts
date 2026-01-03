import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { analysisSessions, userCredits, creditLedger } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { processAnalysisSession } from "@/lib/process-analysis"

/**
 * Use a credit to start an analysis (for logged-in users with credits)
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
    const { analysisSessionId } = body as { analysisSessionId: string }

    if (!analysisSessionId) {
      return NextResponse.json(
        { error: "Hiányzó elemzés azonosító." },
        { status: 400 }
      )
    }

    // Check user credits
    const credits = await db.query.userCredits.findFirst({
      where: eq(userCredits.userId, session.user.id),
    })

    if (!credits || credits.balance < 1) {
      return NextResponse.json(
        { error: "Nincs elég kredit. Kérjük, vásároljon kreditet." },
        { status: 402 }
      )
    }

    // Verify the analysis session belongs to this user
    const analysisSession = await db.query.analysisSessions.findFirst({
      where: eq(analysisSessions.id, analysisSessionId),
    })

    if (!analysisSession) {
      return NextResponse.json(
        { error: "Az elemzés nem található." },
        { status: 404 }
      )
    }

    if (analysisSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Nincs jogosultság ehhez az elemzéshez." },
        { status: 403 }
      )
    }

    if (analysisSession.status !== "pending") {
      return NextResponse.json(
        { error: "Ez az elemzés már feldolgozás alatt van vagy kész." },
        { status: 400 }
      )
    }

    // Deduct credit
    await db
      .update(userCredits)
      .set({
        balance: sql`${userCredits.balance} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, session.user.id))

    // Add ledger entry
    await db.insert(creditLedger).values({
      userId: session.user.id,
      delta: -1,
      reason: "consume_analysis",
      analysisSessionId,
    })

    // Mark as paid and start processing
    await db
      .update(analysisSessions)
      .set({ status: "paid" })
      .where(eq(analysisSessions.id, analysisSessionId))

    // Start processing in the background
    processAnalysisSession(analysisSessionId).catch((error) => {
      console.error("Analysis processing failed:", error)
    })

    return NextResponse.json({
      success: true,
      message: "Az elemzés elindult.",
    })
  } catch (error) {
    console.error("Use credit error:", error)
    return NextResponse.json(
      { error: "Hiba történt a kredit felhasználásakor." },
      { status: 500 }
    )
  }
}
