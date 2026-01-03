import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { constructWebhookEvent, getCheckoutSession, getCreditsFromSession } from "@/lib/stripe"
import { db } from "@/lib/db"
import {
  analysisSessions,
  userCredits,
  creditLedger,
  type CreditReason,
} from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { processAnalysisSession } from "@/lib/process-analysis"
import Stripe from "stripe"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      )
    }

    let event: Stripe.Event
    try {
      event = constructWebhookEvent(body, signature)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const metadata = session.metadata || {}
      const userId = metadata.userId
      const analysisSessionId = metadata.analysisSessionId
      const guestToken = metadata.guestToken

      // IMPORTANT: Get credits from line_items quantity, NOT from metadata
      // This prevents client-side manipulation
      const fullSession = await getCheckoutSession(session.id)
      const creditsFromPayment = getCreditsFromSession(fullSession)

      console.log("Processing payment:", {
        credits: creditsFromPayment,
        userId,
        analysisSessionId,
        guestToken,
        amountTotal: session.amount_total,
      })

      if (creditsFromPayment === 1 && analysisSessionId) {
        // Single analysis purchase - mark as paid and process
        await db
          .update(analysisSessions)
          .set({
            status: "paid",
            stripeSessionId: session.id,
            amount: session.amount_total || 0,
            currency: session.currency?.toUpperCase() || "HUF",
          })
          .where(eq(analysisSessions.id, analysisSessionId))

        // Start processing in the background
        processAnalysisSession(analysisSessionId).catch((error) => {
          console.error("Analysis processing failed:", error)
        })
      } else if (userId) {
        // Credit purchase - add credits to user account
        const reason: CreditReason = creditsFromPayment === 1
          ? "purchase_single"
          : creditsFromPayment >= 10
            ? "purchase_pack_10"
            : creditsFromPayment >= 5
              ? "purchase_pack_5"
              : "purchase_pack_3"

        // Update or insert user credits
        await db
          .insert(userCredits)
          .values({
            userId,
            balance: creditsFromPayment,
          })
          .onConflictDoUpdate({
            target: userCredits.userId,
            set: {
              balance: sql`${userCredits.balance} + ${creditsFromPayment}`,
              updatedAt: new Date(),
            },
          })

        // Add ledger entry for audit trail
        await db.insert(creditLedger).values({
          userId,
          delta: creditsFromPayment,
          reason,
          stripeSessionId: session.id,
        })

        console.log(`Added ${creditsFromPayment} credits to user ${userId}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
