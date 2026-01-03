/**
 * Inpainting Pipeline Module
 *
 * Provides AI-powered makeup application to photos while preserving identity.
 *
 * Usage:
 *   import { applyMakeupToImage } from "@/lib/inpainting"
 *
 *   const result = await applyMakeupToImage(imageBase64, mimeType, look)
 */

export * from "./types"
export * from "./face-detection"
export * from "./mask-generator"
export * from "./inpainting-service"
export * from "./quality-check"
export * from "./fallback-handler"

import type { MakeupLook, AnalysisObservations } from "@/lib/db/schema"
import type { MakeupApplication, PipelineResult } from "./types"
import { runInpaintingPipeline } from "./fallback-handler"

/**
 * Apply makeup from a look to an image
 *
 * This is the main entry point for the inpainting pipeline.
 * It handles all the complexity of face detection, masking, inpainting,
 * and quality checks internally.
 */
export async function applyMakeupToImage(
  imageBase64: string,
  mimeType: string,
  look: MakeupLook,
  observations: AnalysisObservations,
  sessionId?: string
): Promise<PipelineResult> {
  // Convert look products to makeup applications
  const makeup = convertLookToMakeupApplications(look, observations)

  // Run the full pipeline with fallback handling
  return runInpaintingPipeline(
    imageBase64,
    mimeType,
    makeup,
    look.title,
    look.why,
    sessionId
  )
}

/**
 * Convert a MakeupLook to MakeupApplication array
 */
function convertLookToMakeupApplications(
  look: MakeupLook,
  observations: AnalysisObservations
): MakeupApplication[] {
  const applications: MakeupApplication[] = []

  // Eyes
  if (look.products.eyes && look.products.eyes.length > 0) {
    applications.push({
      zone: "eyes",
      description: look.products.eyes.join(", "),
      intensity: determineIntensity(look.id, "eyes"),
    })
  }

  // Lips
  if (look.products.lips && look.products.lips.length > 0) {
    applications.push({
      zone: "lips",
      description: look.products.lips.join(", "),
      intensity: determineIntensity(look.id, "lips"),
    })
  }

  // Cheeks (blush/contour)
  if (look.products.face && look.products.face.length > 0) {
    const cheekProducts = look.products.face.filter(
      (p) =>
        p.toLowerCase().includes("pirosító") ||
        p.toLowerCase().includes("blush") ||
        p.toLowerCase().includes("bronzosító") ||
        p.toLowerCase().includes("contour") ||
        p.toLowerCase().includes("highlighter")
    )

    if (cheekProducts.length > 0) {
      applications.push({
        zone: "cheeks",
        description: cheekProducts.join(", "),
        intensity: determineIntensity(look.id, "cheeks"),
      })
    }
  }

  // Brows
  if (look.products.brows && look.products.brows.length > 0) {
    applications.push({
      zone: "brows",
      description: look.products.brows.join(", "),
      intensity: determineIntensity(look.id, "brows"),
    })
  }

  return applications
}

/**
 * Determine makeup intensity based on look type
 */
function determineIntensity(
  lookId: string,
  zone: MakeupApplication["zone"]
): number {
  // Natural looks = lower intensity
  if (lookId === "natural" || lookId.includes("natural")) {
    return zone === "lips" ? 0.5 : 0.4
  }

  // Elegant looks = medium intensity
  if (lookId === "elegant" || lookId.includes("elegant")) {
    return zone === "lips" ? 0.7 : 0.6
  }

  // Bold/evening looks = higher intensity
  if (
    lookId === "bold" ||
    lookId.includes("bold") ||
    lookId.includes("esti") ||
    lookId.includes("evening")
  ) {
    return zone === "lips" ? 0.85 : 0.75
  }

  // Default medium
  return 0.6
}

/**
 * Check if the inpainting service is available
 */
export function isInpaintingAvailable(): boolean {
  return !!(
    process.env.REPLICATE_API_TOKEN ||
    process.env.GEMINI_API_KEY // Can use Gemini for face detection fallback
  )
}

/**
 * Get service status for monitoring
 */
export function getInpaintingServiceStatus(): {
  available: boolean
  replicateConfigured: boolean
  geminiConfigured: boolean
} {
  return {
    available: isInpaintingAvailable(),
    replicateConfigured: !!process.env.REPLICATE_API_TOKEN,
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  }
}
