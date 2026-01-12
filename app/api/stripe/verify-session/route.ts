import { NextRequest, NextResponse } from "next/server"
import { getCheckoutSession } from "@/lib/stripe"
import { db } from "@/lib/db"
import { analysisSessions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { processAnalysisSession } from "@/lib/process-analysis"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, guestToken } = body as {
      sessionId?: string
      guestToken?: string
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId hiányzik." },
        { status: 400 }
      )
    }

    const session = await getCheckoutSession(sessionId)
    const metadata = session.metadata || {}
    const analysisSessionId = metadata.analysisSessionId
    const sessionGuestToken = metadata.guestToken

    if (!analysisSessionId) {
      return NextResponse.json(
        { error: "Nincs analysisSessionId a Stripe session-ben." },
        { status: 400 }
      )
    }

    if (guestToken && sessionGuestToken && guestToken !== sessionGuestToken) {
      return NextResponse.json(
        { error: "Guest token nem egyezik." },
        { status: 403 }
      )
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { status: "unpaid" },
        { status: 200 }
      )
    }

    const analysis = await db.query.analysisSessions.findFirst({
      where: eq(analysisSessions.id, analysisSessionId),
    })

    if (!analysis) {
      return NextResponse.json(
        { error: "Elemzés nem található." },
        { status: 404 }
      )
    }

    if (analysis.status === "processing" || analysis.status === "complete") {
      return NextResponse.json(
        { status: analysis.status },
        { status: 200 }
      )
    }

    if (analysis.status === "pending") {
      await db
        .update(analysisSessions)
        .set({
          status: "paid",
          stripeSessionId: session.id,
          amount: session.amount_total || 0,
          currency: session.currency?.toUpperCase() || "HUF",
        })
        .where(eq(analysisSessions.id, analysisSessionId))
    }

    if (analysis.status === "pending" || analysis.status === "paid") {
      processAnalysisSession(analysisSessionId).catch((error) => {
        console.error("Analysis processing failed:", error)
      })
    }

    return NextResponse.json(
      { status: "paid" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Verify session error:", error)
    return NextResponse.json(
      { error: "Hiba történt az ellenőrzés során." },
      { status: 500 }
    )
  }
}
