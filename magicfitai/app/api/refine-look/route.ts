import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  analysisSessions,
  userCredits,
  creditLedger,
  type MakeupLook,
} from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"

type RefinementDirection = "termeszetesebb" | "hatarozottabb"

interface RefineRequest {
  analysisSessionId: string
  lookId: string
  direction: RefinementDirection
}

/**
 * POST /api/refine-look
 *
 * Refine a single look within an analysis session.
 * - Deducts 1 credit from user
 * - Re-runs AI for the selected look with modification
 * - Updates the look in the analysis session
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: "Bejelentkezés szükséges." },
        { status: 401 }
      )
    }

    const body = (await request.json()) as RefineRequest
    const { analysisSessionId, lookId, direction } = body

    if (!analysisSessionId || !lookId || !direction) {
      return NextResponse.json(
        { error: "Hiányzó paraméterek." },
        { status: 400 }
      )
    }

    if (!["termeszetesebb", "hatarozottabb"].includes(direction)) {
      return NextResponse.json(
        { error: "Érvénytelen finomítási irány." },
        { status: 400 }
      )
    }

    // Get analysis session
    const analysis = await db.query.analysisSessions.findFirst({
      where: eq(analysisSessions.id, analysisSessionId),
    })

    if (!analysis) {
      return NextResponse.json(
        { error: "Elemzés nem található." },
        { status: 404 }
      )
    }

    // Check ownership
    if (analysis.userId !== userId) {
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

    // Find the look to refine
    const looks = analysis.looks || []
    const lookIndex = looks.findIndex((l) => l.id === lookId)

    if (lookIndex === -1) {
      return NextResponse.json(
        { error: "Look nem található." },
        { status: 404 }
      )
    }

    // Check user credits
    const userCreditRecord = await db.query.userCredits.findFirst({
      where: eq(userCredits.userId, userId),
    })

    const currentBalance = userCreditRecord?.balance || 0

    if (currentBalance < 1) {
      return NextResponse.json(
        { error: "Nincs elegendő kredited." },
        { status: 402 }
      )
    }

    // Deduct credit
    await db
      .update(userCredits)
      .set({
        balance: sql`${userCredits.balance} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId))

    // Add ledger entry
    await db.insert(creditLedger).values({
      userId,
      delta: -1,
      reason: "consume_analysis",
      analysisSessionId,
    })

    // Get the look to refine
    const originalLook = looks[lookIndex]

    // Generate refined look
    // In a real implementation, this would call the AI service
    // For now, we'll modify the existing look based on direction
    const refinedLook = await generateRefinedLook(originalLook, direction)

    // Update the looks array
    const updatedLooks = [...looks]
    updatedLooks[lookIndex] = refinedLook

    // Update analysis session
    await db
      .update(analysisSessions)
      .set({
        looks: updatedLooks,
      })
      .where(eq(analysisSessions.id, analysisSessionId))

    return NextResponse.json({
      success: true,
      refinedLook,
      newBalance: currentBalance - 1,
    })
  } catch (error) {
    console.error("Refine look error:", error)
    return NextResponse.json(
      { error: "Hiba történt a finomítás során." },
      { status: 500 }
    )
  }
}

/**
 * Generate a refined look based on direction
 * In production, this would call the AI service with appropriate prompts
 */
async function generateRefinedLook(
  originalLook: MakeupLook,
  direction: RefinementDirection
): Promise<MakeupLook> {
  // Modify the look based on direction
  const isNatural = direction === "termeszetesebb"

  // Create modified steps
  const modifiedSteps = originalLook.steps.map((step) => {
    if (isNatural) {
      // Make steps more natural
      return step
        .replace(/erős/gi, "finom")
        .replace(/intenzív/gi, "visszafogott")
        .replace(/drámai/gi, "természetes")
        .replace(/sötét/gi, "világos")
        .replace(/vastag/gi, "vékony")
        .replace(/több réteg/gi, "egy réteg")
    } else {
      // Make steps more defined
      return step
        .replace(/finom/gi, "hangsúlyos")
        .replace(/visszafogott/gi, "kifejező")
        .replace(/természetes/gi, "karakteres")
        .replace(/világos/gi, "mélyebb")
        .replace(/vékony/gi, "határozott")
        .replace(/egy réteg/gi, "több réteg")
    }
  })

  // Modify the description
  const modifiedWhy = isNatural
    ? originalLook.why.replace(
        /^/,
        "Finomított változat: természetesebb, visszafogottabb megjelenés. "
      )
    : originalLook.why.replace(
        /^/,
        "Finomított változat: határozottabb, kifejezőbb megjelenés. "
      )

  return {
    ...originalLook,
    id: `${originalLook.id}-refined`,
    title: `${originalLook.title} (${isNatural ? "Természetes" : "Határozott"})`,
    why: modifiedWhy,
    steps: modifiedSteps,
    // In production, a new after image would be generated here
    // afterImageUrl: newGeneratedImageUrl,
  }
}
