import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { analysisSessions } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

/**
 * Get all analyses for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Bejelentkezés szükséges." },
        { status: 401 }
      )
    }

    // Get all user's analyses
    const analyses = await db.query.analysisSessions.findMany({
      where: eq(analysisSessions.userId, session.user.id),
      orderBy: [desc(analysisSessions.createdAt)],
    })

    // Map to safe output format
    const result = analyses.map((analysis) => ({
      id: analysis.id,
      status: analysis.status,
      occasion: analysis.occasion,
      beforeImageUrl: analysis.beforeImageUrl,
      observations: analysis.observations
        ? {
            faceShape: analysis.observations.faceShape,
            skinTone: analysis.observations.skinTone,
          }
        : null,
      lookCount: analysis.looks?.length || 0,
      pdfUrl: analysis.pdfUrl,
      createdAt: analysis.createdAt,
      completedAt: analysis.completedAt,
    }))

    return NextResponse.json({ analyses: result })
  } catch (error) {
    console.error("Get analyses error:", error)
    return NextResponse.json(
      { error: "Hiba történt az elemzések betöltésekor." },
      { status: 500 }
    )
  }
}
