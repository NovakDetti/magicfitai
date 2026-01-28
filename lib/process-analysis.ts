import { db } from "@/lib/db"
import { analysisSessions, userCredits, creditLedger } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { analyzeImage } from "@/lib/gemini"
import { uploadBase64Image, uploadPdf } from "@/lib/storage"
import { generatePdfBuffer } from "@/lib/pdf"
import { generateMakeupTransfer } from "@/lib/mad-service"

// Maximum processing time: 5 minutes
const PROCESSING_TIMEOUT = 5 * 60 * 1000

/**
 * Refund credit to user if analysis fails
 */
async function refundCreditIfNeeded(sessionId: string, userId: string | null): Promise<void> {
  if (!userId) {
    console.log(`No user ID for session ${sessionId}, skipping refund`)
    return
  }

  try {
    // Check if credit was already deducted for this session
    const ledgerEntry = await db.query.creditLedger.findFirst({
      where: eq(creditLedger.analysisSessionId, sessionId),
    })

    if (!ledgerEntry || ledgerEntry.delta >= 0) {
      console.log(`No credit deduction found for session ${sessionId}, skipping refund`)
      return
    }

    // Refund the credit
    await db
      .update(userCredits)
      .set({
        balance: sql`${userCredits.balance} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId))

    // Add refund ledger entry
    await db.insert(creditLedger).values({
      userId,
      delta: 1,
      reason: "refund",
      analysisSessionId: sessionId,
    })

    console.log(`Refunded 1 credit to user ${userId} for failed session ${sessionId}`)
  } catch (error) {
    console.error(`Failed to refund credit for session ${sessionId}:`, error)
  }
}

/**
 * Process an analysis session:
 * 1. Run Gemini analysis (text + observations)
 * 2. Generate after images using MAD service
 * 3. Generate PDF
 * 4. Store all assets
 * 5. Update session status
 *
 * If processing fails, the session is marked as failed and credit is refunded.
 */
export async function processAnalysisSession(sessionId: string): Promise<void> {
  console.log(`Processing analysis session: ${sessionId}`)

  // Get session
  const session = await db.query.analysisSessions.findFirst({
    where: eq(analysisSessions.id, sessionId),
  })

  if (!session) {
    throw new Error(`Session not found: ${sessionId}`)
  }

  if (session.status !== "paid") {
    throw new Error(`Invalid session status: ${session.status}`)
  }

  // Update status to processing
  await db
    .update(analysisSessions)
    .set({ status: "processing" })
    .where(eq(analysisSessions.id, sessionId))

  // Create a timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Processing timeout after ${PROCESSING_TIMEOUT / 1000} seconds`))
    }, PROCESSING_TIMEOUT)
  })

  // Race between actual processing and timeout
  const processingPromise = processAnalysisCore(sessionId, session)

  try {
    await Promise.race([processingPromise, timeoutPromise])
    console.log(`Analysis session completed: ${sessionId}`)
  } catch (error) {
    console.error(`Analysis processing failed for ${sessionId}:`, error)

    // Update status to failed
    await db
      .update(analysisSessions)
      .set({ status: "failed" })
      .where(eq(analysisSessions.id, sessionId))

    // Refund credit if it was deducted
    await refundCreditIfNeeded(sessionId, session.userId)

    throw error
  }
}

/**
 * Core processing logic (separated for timeout handling)
 */
async function processAnalysisCore(
  sessionId: string,
  session: typeof analysisSessions.$inferSelect
): Promise<void> {
  // Download the before image and convert to base64
  const beforeImageUrl = session.beforeImageUrl
  if (!beforeImageUrl) {
    throw new Error("No before image URL")
  }

  // Fetch the image (handle both local and remote URLs)
  let imageBase64: string
  let mimeType: string

  if (beforeImageUrl.startsWith("/uploads/")) {
    // Local file - read from filesystem
    const fs = await import("fs/promises")
    const path = await import("path")
    const filePath = path.join(process.cwd(), "public", beforeImageUrl)
    const buffer = await fs.readFile(filePath)
    imageBase64 = buffer.toString("base64")
    mimeType = beforeImageUrl.endsWith(".png")
      ? "image/png"
      : beforeImageUrl.endsWith(".webp")
      ? "image/webp"
      : "image/jpeg"
  } else {
    // Remote file
    const response = await fetch(beforeImageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch before image: ${response.status}`)
    }
    const buffer = await response.arrayBuffer()
    imageBase64 = Buffer.from(buffer).toString("base64")
    mimeType = response.headers.get("content-type") || "image/jpeg"
  }

  // Run Gemini analysis (text-only, no image generation)
  const { observations, looks } = await analyzeImage(
    imageBase64,
    mimeType,
    session.occasion,
    session.toggles
  )

  // Generate after images using MAD service (Gemini-based makeup transfer)
  const afterImageUrls: string[] = []
  console.log(`Generating makeup preview image for session: ${sessionId}`)

  // Generate image for the primary (first) look
  const primaryLook = looks[0]

  if (primaryLook) {
    try {
      // Get style description from occasion
      const styleDescriptions: Record<string, string> = {
        everyday: "Természetes, fresh look",
        date: "Romantikus, lágy smink",
        party: "Merész, csillogó smink",
        smokey: "Intenzív, drámai smokey eyes",
        elegant: "Kifinomult, elegáns smink"
      }

      const result = await generateMakeupTransfer({
        sourceImageBase64: imageBase64,
        sourceImageMimeType: mimeType,
        style: session.occasion,
        styleDescription: styleDescriptions[session.occasion] || "Professzionális smink",
        observations: {
          skinTone: observations.skinTone,
          undertone: observations.undertone,
          eyeShape: observations.eyeShape,
          faceShape: observations.faceShape,
        },
      })

      if (result.success && result.afterImageUrl) {
        // Upload the generated image
        const url = await uploadBase64Image(result.afterImageUrl, "after-images")
        afterImageUrls.push(url)
        console.log(`MAD service successful for look "${primaryLook.title}"`)
      } else {
        console.log(`MAD service failed for look "${primaryLook.title}": ${result.error}`)
        afterImageUrls.push("") // No image
      }
    } catch (error) {
      console.error(`MAD service error for look "${primaryLook.title}":`, error)
      afterImageUrls.push("")
    }
  }

  // Fill remaining slots with empty strings for other looks
  while (afterImageUrls.length < looks.length) {
    afterImageUrls.push("")
  }

  // Add after image URLs to looks
  const looksWithImages = looks.map((look, index) => ({
    ...look,
    afterImageUrl: afterImageUrls[index] || undefined,
  }))

  // Generate and upload PDF
  const pdfBuffer = await generatePdfBuffer(
    observations,
    looksWithImages,
    beforeImageUrl
  )
  const pdfUrl = await uploadPdf(pdfBuffer, "pdfs")

  // Update session with results
  await db
    .update(analysisSessions)
    .set({
      status: "complete",
      observations,
      looks: looksWithImages,
      afterImages: afterImageUrls,
      pdfUrl,
      completedAt: new Date(),
    })
    .where(eq(analysisSessions.id, sessionId))
}
