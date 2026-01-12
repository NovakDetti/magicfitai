import Stripe from "stripe"

// Lazy initialization to avoid build-time errors
let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not defined")
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    })
  }
  return _stripe
}

export const stripe = {
  get checkout() {
    return getStripe().checkout
  },
  get webhooks() {
    return getStripe().webhooks
  },
}

// Stripe Price IDs for each credit package
export const PRICE_IDS = {
  1: process.env.STRIPE_PRICE_ID_1_CREDIT!, // 1 kredit - 450 Ft
  5: process.env.STRIPE_PRICE_ID_5_CREDITS!, // 5 kredit - 2025 Ft
  10: process.env.STRIPE_PRICE_ID_10_CREDITS!, // 10 kredit - 3825 Ft
} as const

// Credit packages with discounts
export const CREDIT_PACKAGES = {
  single: { credits: 1, pricePerCredit: 450, totalPrice: 450, priceId: PRICE_IDS[1] },
  pack5: { credits: 5, pricePerCredit: 405, totalPrice: 2025, discount: 10, priceId: PRICE_IDS[5] },
  pack10: {
    credits: 10,
    pricePerCredit: 382.5,
    totalPrice: 3825,
    discount: 15,
    priceId: PRICE_IDS[10],
  },
} as const

export type CreditPackage = keyof typeof CREDIT_PACKAGES

interface CreateCheckoutParams {
  credits: number
  analysisSessionId?: string
  userId?: string
  guestToken?: string
  successUrl: string
  cancelUrl: string
}

/**
 * Create a Stripe Checkout session for purchasing credits
 * Uses package-specific Price IDs (1, 5, or 10 credits)
 */
export async function createCheckoutSession({
  credits,
  analysisSessionId,
  userId,
  guestToken,
  successUrl,
  cancelUrl,
}: CreateCheckoutParams): Promise<Stripe.Checkout.Session> {
  // Get the correct Price ID based on credit amount
  const priceId = PRICE_IDS[credits as keyof typeof PRICE_IDS]

  if (!priceId) {
    throw new Error(`No price ID configured for ${credits} credits. Must be 1, 5, or 10.`)
  }

  const metadata: Record<string, string> = {
    credits: String(credits),
  }

  if (analysisSessionId) {
    metadata.analysisSessionId = analysisSessionId
  }
  if (userId) {
    metadata.userId = userId
  }
  if (guestToken) {
    metadata.guestToken = guestToken
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1, // Quantity is always 1 since price already includes the package
      },
    ],
    metadata,
    success_url: successUrl,
    cancel_url: cancelUrl,
    locale: "hu",
    allow_promotion_codes: true,
  })

  return session
}

/**
 * Retrieve a checkout session with line items
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  })
}

/**
 * Get credits from a completed checkout session
 * Reads from metadata since each price is a fixed package (not quantity-based)
 */
export function getCreditsFromSession(session: Stripe.Checkout.Session): number {
  const credits = session.metadata?.credits

  if (!credits) {
    throw new Error("No credits found in session metadata")
  }

  return parseInt(credits, 10)
}

/**
 * Verify Stripe webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not defined")
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}
