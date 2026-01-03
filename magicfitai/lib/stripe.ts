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

// Single credit price ID - 1 credit = 450 HUF
export const CREDIT_PRICE_ID = process.env.STRIPE_CREDIT_PRICE_ID!

// Price per credit in HUF
export const CREDIT_PRICE_HUF = 450

// Credit packages with discounts
export const CREDIT_PACKAGES = {
  single: { credits: 1, pricePerCredit: 450, totalPrice: 450 },
  pack5: { credits: 5, pricePerCredit: 405, totalPrice: 2025, discount: 10 },
  pack10: { credits: 10, pricePerCredit: 400, totalPrice: 4000, discount: 11 },
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
 * Uses a single Price ID with quantity = credits
 */
export async function createCheckoutSession({
  credits,
  analysisSessionId,
  userId,
  guestToken,
  successUrl,
  cancelUrl,
}: CreateCheckoutParams): Promise<Stripe.Checkout.Session> {
  if (!CREDIT_PRICE_ID) {
    throw new Error("STRIPE_CREDIT_PRICE_ID is not defined")
  }

  if (credits < 1 || credits > 100) {
    throw new Error("Credits must be between 1 and 100")
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
        price: CREDIT_PRICE_ID,
        quantity: credits,
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
 * Reads quantity from line_items (never trust metadata for credit count)
 */
export function getCreditsFromSession(session: Stripe.Checkout.Session): number {
  const lineItems = session.line_items?.data
  if (!lineItems || lineItems.length === 0) {
    throw new Error("No line items found in session")
  }

  // Sum all quantities (in case of multiple line items)
  return lineItems.reduce((total, item) => total + (item.quantity || 0), 0)
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
