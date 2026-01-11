import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Minden mező kitöltése kötelező" },
        { status: 400 }
      )
    }

    if (name.length < 2) {
      return NextResponse.json(
        { error: "A név legalább 2 karakter legyen" },
        { status: 400 }
      )
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Érvénytelen email cím" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A jelszó legalább 6 karakter legyen" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)

    if (existingUser[0]) {
      return NextResponse.json(
        { error: "Ez az email cím már regisztrálva van" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      })

    return NextResponse.json({
      success: true,
      user: newUser[0],
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Hiba történt a regisztráció során" },
      { status: 500 }
    )
  }
}
