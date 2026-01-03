import { NextRequest, NextResponse } from "next/server"
import { nanoid } from "nanoid"
import { db } from "@/lib/db"
import { analysisSessions } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { uploadFormDataFile } from "@/lib/storage"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    const formData = await request.formData()
    const imageFile = formData.get("image") as File | null
    const occasion = formData.get("occasion") as string | null
    const hasGlasses = formData.get("hasGlasses") === "true"
    const hasSensitiveSkin = formData.get("hasSensitiveSkin") === "true"
    const stylePreference = formData.get("stylePreference") as "letisztult" | "hatarozott" | null

    // Validate image
    if (!imageFile) {
      return NextResponse.json(
        { error: "Kép feltöltése kötelező." },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { error: "Csak JPG, PNG vagy WebP formátum engedélyezett." },
        { status: 400 }
      )
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "A kép mérete nem haladhatja meg a 10MB-ot." },
        { status: 400 }
      )
    }

    // Validate occasion
    const validOccasions = ["everyday", "work", "evening", "special"]
    if (!occasion || !validOccasions.includes(occasion)) {
      return NextResponse.json(
        { error: "Érvényes alkalom megadása kötelező." },
        { status: 400 }
      )
    }

    // Upload image to storage
    const beforeImageUrl = await uploadFormDataFile(imageFile, "before-images")

    // Generate guest token for non-authenticated users
    const guestToken = userId ? null : nanoid(32)

    // Set expiration (7 days for guest sessions)
    const expiresAt = userId ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Create analysis session
    const [analysisSession] = await db
      .insert(analysisSessions)
      .values({
        userId: userId || null,
        guestToken,
        status: "pending",
        occasion,
        toggles: { hasGlasses, hasSensitiveSkin, stylePreference: stylePreference || "letisztult" },
        beforeImageUrl,
        expiresAt,
      })
      .returning()

    return NextResponse.json({
      sessionId: analysisSession.id,
      guestToken,
      status: "pending",
    })
  } catch (error) {
    console.error("Create analysis session error:", error)
    return NextResponse.json(
      { error: "Hiba történt a munkamenet létrehozásakor." },
      { status: 500 }
    )
  }
}
