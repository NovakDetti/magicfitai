import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { userCredits, creditLedger } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

/**
 * Get current user's credit balance and recent history
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Bejelentkezés szükséges." },
        { status: 401 }
      )
    }

    // Get credit balance
    const credits = await db.query.userCredits.findFirst({
      where: eq(userCredits.userId, session.user.id),
    })

    // Get recent ledger entries
    const recentTransactions = await db.query.creditLedger.findMany({
      where: eq(creditLedger.userId, session.user.id),
      orderBy: [desc(creditLedger.createdAt)],
      limit: 10,
    })

    // Map reason to Hungarian
    const reasonLabels: Record<string, string> = {
      purchase_single: "Egyszeri elemzés vásárlás",
      purchase_pack_3: "3 kredites csomag vásárlás",
      purchase_pack_5: "5 kredites csomag vásárlás",
      purchase_pack_10: "10 kredites csomag vásárlás",
      consume_analysis: "Elemzés felhasználás",
      refund: "Visszatérítés",
      admin_adjustment: "Admin módosítás",
      claim_guest_result: "Vendég eredmény átvétele",
    }

    const transactions = recentTransactions.map((tx) => ({
      id: tx.id,
      delta: tx.delta,
      reason: reasonLabels[tx.reason] || tx.reason,
      createdAt: tx.createdAt,
    }))

    return NextResponse.json({
      balance: credits?.balance || 0,
      transactions,
    })
  } catch (error) {
    console.error("Get credits error:", error)
    return NextResponse.json(
      { error: "Hiba történt a kredit egyenleg betöltésekor." },
      { status: 500 }
    )
  }
}
