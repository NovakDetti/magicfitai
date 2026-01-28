import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { analysisSessions, userCredits, creditLedger } from "@/lib/db/schema"
import { eq, and, lt, sql } from "drizzle-orm"

/**
 * Cleanup cron job to handle stuck analysis sessions
 *
 * This endpoint should be called periodically (e.g., every 10 minutes) by a cron service
 * like Vercel Cron or external cron job.
 *
 * It finds analysis sessions that have been in "processing" state for more than 10 minutes
 * and marks them as failed, then refunds the credit if applicable.
 */
export async function GET() {
  try {
    const STUCK_THRESHOLD = 10 * 60 * 1000 // 10 minutes
    const cutoffTime = new Date(Date.now() - STUCK_THRESHOLD)

    console.log(`[Cleanup] Looking for stuck analyses older than ${cutoffTime.toISOString()}`)

    // Find stuck sessions
    const stuckSessions = await db.query.analysisSessions.findMany({
      where: and(
        eq(analysisSessions.status, "processing"),
        lt(analysisSessions.createdAt, cutoffTime)
      ),
    })

    if (stuckSessions.length === 0) {
      console.log("[Cleanup] No stuck sessions found")
      return NextResponse.json({
        success: true,
        message: "No stuck sessions found",
        processed: 0
      })
    }

    console.log(`[Cleanup] Found ${stuckSessions.length} stuck sessions`)

    let refundedCount = 0
    const results = []

    for (const session of stuckSessions) {
      try {
        // Mark as failed
        await db
          .update(analysisSessions)
          .set({ status: "failed" })
          .where(eq(analysisSessions.id, session.id))

        // Refund credit if user exists and credit was deducted
        if (session.userId) {
          // Check if credit was deducted
          const ledgerEntry = await db.query.creditLedger.findFirst({
            where: and(
              eq(creditLedger.analysisSessionId, session.id),
              lt(creditLedger.delta, 0)
            ),
          })

          if (ledgerEntry) {
            // Refund the credit
            await db
              .update(userCredits)
              .set({
                balance: sql`${userCredits.balance} + 1`,
                updatedAt: new Date(),
              })
              .where(eq(userCredits.userId, session.userId))

            // Add refund ledger entry
            await db.insert(creditLedger).values({
              userId: session.userId,
              delta: 1,
              reason: "refund",
              analysisSessionId: session.id,
            })

            refundedCount++
            console.log(`[Cleanup] Refunded credit for session ${session.id}`)
          }
        }

        results.push({
          sessionId: session.id,
          userId: session.userId,
          refunded: !!session.userId,
        })
      } catch (error) {
        console.error(`[Cleanup] Error processing session ${session.id}:`, error)
        results.push({
          sessionId: session.id,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    console.log(`[Cleanup] Processed ${stuckSessions.length} sessions, refunded ${refundedCount} credits`)

    return NextResponse.json({
      success: true,
      message: `Processed ${stuckSessions.length} stuck sessions`,
      processed: stuckSessions.length,
      refunded: refundedCount,
      results,
    })
  } catch (error) {
    console.error("[Cleanup] Cleanup job failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Cleanup failed",
      },
      { status: 500 }
    )
  }
}
