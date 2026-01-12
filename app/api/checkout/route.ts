import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createCheckoutSession, CREDIT_PACKAGES, CreditPackage } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    const body = await request.json()
    const { credits, packageType, analysisSessionId, guestToken } = body as {
      credits?: number
      packageType?: CreditPackage
      analysisSessionId?: string
      guestToken?: string
    }

    // Determine credit count from package or direct credits param
    let creditCount: number

    if (packageType && CREDIT_PACKAGES[packageType]) {
      creditCount = CREDIT_PACKAGES[packageType].credits
    } else if (credits && credits >= 1 && credits <= 100) {
      creditCount = credits
    } else {
      return NextResponse.json(
        { error: "Érvénytelen kredit mennyiség." },
        { status: 400 }
      )
    }

    // For single credit purchase, require analysisSessionId when user is not logged in
    if (creditCount === 1 && !analysisSessionId && !userId) {
      return NextResponse.json(
        { error: "Elemzés azonosító szükséges." },
        { status: 400 }
      )
    }

    // Build success URL
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin
    let successUrl: string
    let cancelUrl: string

    if (creditCount === 1 && guestToken) {
      // Single purchase as guest - redirect to result page
      successUrl = `${baseUrl}/r/${guestToken}?payment=success&session_id={CHECKOUT_SESSION_ID}`
      cancelUrl = `${baseUrl}/ai-sminkajanlo?payment=cancelled`
    } else if (userId) {
      // Logged in user - redirect to results
      successUrl = `${baseUrl}/eredmenyeim?payment=success`
      cancelUrl = `${baseUrl}/ai-sminkajanlo?payment=cancelled`
    } else {
      // Guest buying credits (shouldn't happen normally)
      successUrl = `${baseUrl}/ai-sminkajanlo?payment=success`
      cancelUrl = `${baseUrl}/ai-sminkajanlo?payment=cancelled`
    }

    // Create Stripe checkout session with quantity = credits
    const checkoutSession = await createCheckoutSession({
      credits: creditCount,
      analysisSessionId,
      userId: userId || undefined,
      guestToken: guestToken || undefined,
      successUrl,
      cancelUrl,
    })

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Hiba történt a fizetési folyamat indításakor." },
      { status: 500 }
    )
  }
}
