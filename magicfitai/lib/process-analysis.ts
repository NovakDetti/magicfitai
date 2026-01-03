import { db } from "@/lib/db"
import { analysisSessions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { analyzeImage } from "@/lib/gemini"
import { uploadBase64Image, uploadPdf } from "@/lib/storage"
import { generatePdfBuffer } from "@/lib/pdf"
import { applyMakeupToImage, isInpaintingAvailable } from "@/lib/inpainting"

/**
 * Process an analysis session:
 * 1. Run Gemini analysis (text + observations)
 * 2. Generate after images using inpainting pipeline
 * 3. Generate PDF
 * 4. Store all assets
 * 5. Update session status
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

  try {
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

    // Generate after images using inpainting pipeline
    const afterImageUrls: string[] = []
    const inpaintingAvailable = isInpaintingAvailable()

    if (inpaintingAvailable) {
      console.log(`Generating makeup preview images for session: ${sessionId}`)

      // Only generate for the primary (first) look to save time/cost
      // The signature look page shows only one look anyway
      const primaryLook = looks[0]

      if (primaryLook) {
        try {
          const result = await applyMakeupToImage(
            imageBase64,
            mimeType,
            primaryLook,
            observations,
            sessionId
          )

          if (result.success && result.imageBase64) {
            // Upload the generated image
            const url = await uploadBase64Image(result.imageBase64, "after-images")
            afterImageUrls.push(url)
            console.log(
              `Inpainting successful for look "${primaryLook.title}" ` +
              `(quality: ${result.qualityScore?.toFixed(2)}, attempts: ${result.attemptCount})`
            )
          } else {
            // Fallback was used - log the reason
            console.log(
              `Inpainting fallback for look "${primaryLook.title}": ${result.fallbackReason}`
            )
            afterImageUrls.push("") // No image
          }
        } catch (error) {
          console.error(`Inpainting failed for look "${primaryLook.title}":`, error)
          afterImageUrls.push("")
        }
      }

      // Fill remaining slots with empty strings for other looks
      while (afterImageUrls.length < looks.length) {
        afterImageUrls.push("")
      }
    } else {
      console.log("Inpainting not available - skipping image generation")
      // No inpainting available, fill with empty strings
      for (let i = 0; i < looks.length; i++) {
        afterImageUrls.push("")
      }
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

    console.log(`Analysis session completed: ${sessionId}`)
  } catch (error) {
    console.error(`Analysis processing failed for ${sessionId}:`, error)

    // Update status to failed
    await db
      .update(analysisSessions)
      .set({ status: "failed" })
      .where(eq(analysisSessions.id, sessionId))

    throw error
  }
}
