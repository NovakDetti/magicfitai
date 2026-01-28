import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { analysisSessions, analysisRatings } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { rating, comment } = body

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    // Check if analysis exists and belongs to user
    const analysis = await db.query.analysisSessions.findFirst({
      where: eq(analysisSessions.id, id),
    })

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      )
    }

    if (analysis.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only rate your own analyses" },
        { status: 403 }
      )
    }

    if (analysis.status !== "complete") {
      return NextResponse.json(
        { error: "Can only rate completed analyses" },
        { status: 400 }
      )
    }

    // Check if user already rated this analysis
    const existingRating = await db.query.analysisRatings.findFirst({
      where: and(
        eq(analysisRatings.analysisSessionId, id),
        eq(analysisRatings.userId, session.user.id)
      ),
    })

    if (existingRating) {
      // Update existing rating
      const [updated] = await db
        .update(analysisRatings)
        .set({
          rating,
          comment: comment || null,
          updatedAt: new Date(),
        })
        .where(eq(analysisRatings.id, existingRating.id))
        .returning()

      return NextResponse.json(updated)
    } else {
      // Create new rating
      const [newRating] = await db
        .insert(analysisRatings)
        .values({
          analysisSessionId: id,
          userId: session.user.id,
          rating,
          comment: comment || null,
        })
        .returning()

      return NextResponse.json(newRating)
    }
  } catch (error) {
    console.error("Error saving rating:", error)
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's rating for this analysis
    const rating = await db.query.analysisRatings.findFirst({
      where: and(
        eq(analysisRatings.analysisSessionId, id),
        eq(analysisRatings.userId, session.user.id)
      ),
    })

    if (!rating) {
      return NextResponse.json({ rating: null })
    }

    return NextResponse.json(rating)
  } catch (error) {
    console.error("Error fetching rating:", error)
    return NextResponse.json(
      { error: "Failed to fetch rating" },
      { status: 500 }
    )
  }
}
