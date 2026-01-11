import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { users, analysisSessions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user ID
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete all user's analyses first (due to foreign key constraints)
    await db.delete(analysisSessions).where(eq(analysisSessions.userId, user.id))

    // Delete the user
    await db.delete(users).where(eq(users.id, user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user account:", error)
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    )
  }
}
