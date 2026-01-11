import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { users, userCredits } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.email, session.user.email))

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get credit balance from userCredits table
    const credits = await db.query.userCredits.findFirst({
      where: eq(userCredits.userId, user.id),
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      credits: credits?.balance || 0,
      createdAt: user.createdAt.toISOString(),
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}
