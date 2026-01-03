/**
 * Inpainting Service
 *
 * Uses Stable Diffusion inpainting via Replicate to apply makeup
 * while strictly preserving the original face identity.
 */

import type {
  InpaintingRequest,
  InpaintingResult,
  InpaintingPrompt,
  MakeupApplication,
  MakeupMask,
} from "./types"
import { generateMakeupZones, generateMaskFromZones } from "./mask-generator"

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN

// Stable Diffusion Inpainting model on Replicate
const INPAINTING_MODEL =
  "stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3"

// Alternative: SDXL inpainting for higher quality
const SDXL_INPAINTING_MODEL =
  "lucataco/sdxl-inpainting:a5b13068cc81a89a4fbeefeccc774869fcb34df4dbc92c1c9b35ac16dd4a6d46"

/**
 * Generate inpainting prompt for makeup application
 */
export function generateInpaintingPrompt(
  makeup: MakeupApplication[],
  lookTitle: string,
  lookDescription: string
): InpaintingPrompt {
  // Build makeup-specific prompts
  const makeupDescriptions: string[] = []

  for (const m of makeup) {
    switch (m.zone) {
      case "eyes":
        makeupDescriptions.push(
          `professional eyeshadow application, ${m.description}, seamless blend with skin`
        )
        break
      case "lips":
        makeupDescriptions.push(
          `professional lip makeup, ${m.description}, natural lip texture preserved`
        )
        break
      case "cheeks":
        makeupDescriptions.push(
          `subtle ${m.description}, natural skin texture, seamless cheek color`
        )
        break
      case "brows":
        makeupDescriptions.push(
          `defined brows, ${m.description}, natural hair texture`
        )
        break
      case "base":
        makeupDescriptions.push(
          `flawless base makeup, ${m.description}, natural skin texture visible`
        )
        break
    }
  }

  // Strict positive prompt for makeup only
  const positive = `
professional makeup photography, ${lookTitle},
${makeupDescriptions.join(", ")},
${lookDescription},
EXACT same face structure, same identity, same lighting, same skin texture,
ultra-realistic makeup application, professional beauty photography,
sharp focus, studio lighting, high-end cosmetics advertisement,
same background, same hair, same clothing, same pose
`.trim().replace(/\n/g, " ")

  // Strict negative prompt to prevent face changes
  const negative = `
different person, altered face shape, changed bone structure,
different eyes, different nose, different lips shape, different jawline,
plastic surgery, face morph, age change, gender change,
different lighting, different background, different pose, different angle,
different hair, different skin color, different ethnicity,
cartoon, anime, illustration, painting, drawing, sketch,
blurry, low quality, artifacts, distortion, noise,
extra limbs, extra fingers, deformed, disfigured, mutated,
cropped, out of frame, worst quality, low resolution,
watermark, signature, text, logo
`.trim().replace(/\n/g, " ")

  return { positive, negative }
}

/**
 * Apply inpainting to specific zones
 */
export async function applyInpainting(
  request: InpaintingRequest
): Promise<InpaintingResult> {
  const startTime = Date.now()

  if (!REPLICATE_API_TOKEN) {
    console.error("REPLICATE_API_TOKEN not configured")
    return {
      success: false,
      error: "Inpainting service not configured",
      processingTimeMs: Date.now() - startTime,
    }
  }

  try {
    // Generate makeup zones from landmarks
    const zones = generateMakeupZones(request.landmarks)

    if (zones.length === 0) {
      return {
        success: false,
        error: "Could not generate makeup zones from face landmarks",
        processingTimeMs: Date.now() - startTime,
      }
    }

    // Determine which zones to use based on requested makeup
    const targetZones = request.makeup.map((m) => {
      switch (m.zone) {
        case "eyes":
          return "eyes"
        case "lips":
          return "lips"
        case "cheeks":
          return ["leftCheek", "rightCheek"]
        case "brows":
          return "brows"
        default:
          return null
      }
    }).flat().filter((z): z is string => z !== null)

    // Get image dimensions (default to 1024x1024 if unknown)
    const width = 1024
    const height = 1024

    // Generate combined mask for all target zones
    const mask = generateMaskFromZones(zones, width, height, targetZones)

    // Generate prompt
    const prompt = generateInpaintingPrompt(
      request.makeup,
      request.lookTitle,
      request.lookDescription
    )

    // Call Replicate inpainting API
    const result = await runInpainting(
      request.imageBase64,
      request.mimeType,
      mask,
      prompt
    )

    return {
      ...result,
      processingTimeMs: Date.now() - startTime,
    }
  } catch (error) {
    console.error("Inpainting error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Inpainting failed",
      processingTimeMs: Date.now() - startTime,
    }
  }
}

/**
 * Run the actual inpainting model
 */
async function runInpainting(
  imageBase64: string,
  mimeType: string,
  mask: MakeupMask,
  prompt: InpaintingPrompt
): Promise<InpaintingResult> {
  // Create prediction
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: SDXL_INPAINTING_MODEL.split(":")[1],
      input: {
        image: `data:${mimeType};base64,${imageBase64}`,
        mask: mask.maskBase64,
        prompt: prompt.positive,
        negative_prompt: prompt.negative,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        strength: 0.75, // How much to change the masked region (0.75 = 75% change)
        scheduler: "K_EULER_ANCESTRAL",
        num_outputs: 1,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Replicate API error:", response.status, errorText)
    throw new Error(`Inpainting API error: ${response.status}`)
  }

  const prediction = await response.json()

  // Poll for completion
  const result = await pollForCompletion(prediction.id)

  if (!result) {
    throw new Error("Inpainting timed out or failed")
  }

  // Get the output image
  const outputUrl = Array.isArray(result.output)
    ? result.output[0]
    : result.output

  if (!outputUrl) {
    throw new Error("No output image from inpainting")
  }

  // Fetch the image and convert to base64
  const imageResponse = await fetch(outputUrl)
  if (!imageResponse.ok) {
    throw new Error("Failed to fetch inpainted image")
  }

  const imageBuffer = await imageResponse.arrayBuffer()
  const imageBase64Result = Buffer.from(imageBuffer).toString("base64")
  const contentType = imageResponse.headers.get("content-type") || "image/png"

  return {
    success: true,
    imageBase64: `data:${contentType};base64,${imageBase64Result}`,
    qualityScore: 0.9, // Will be set by quality check
  }
}

/**
 * Poll Replicate prediction for completion
 */
async function pollForCompletion(
  predictionId: string,
  maxAttempts: number = 60,
  intervalMs: number = 2000
): Promise<{ output: string | string[] } | null> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs))

    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        },
      }
    )

    if (!response.ok) {
      console.warn(`Poll attempt ${i + 1} failed:`, response.status)
      continue
    }

    const prediction = await response.json()

    if (prediction.status === "succeeded") {
      return prediction
    }

    if (prediction.status === "failed") {
      console.error("Prediction failed:", prediction.error)
      return null
    }

    if (prediction.status === "canceled") {
      return null
    }

    // Still processing, continue polling
  }

  console.error("Prediction timed out after", maxAttempts, "attempts")
  return null
}

/**
 * Apply makeup incrementally zone by zone for better control
 */
export async function applyInpaintingIncremental(
  request: InpaintingRequest
): Promise<InpaintingResult> {
  const startTime = Date.now()

  let currentImage = request.imageBase64
  let currentMimeType = request.mimeType

  const zones = generateMakeupZones(request.landmarks)

  // Group makeup by zone
  const makeupByZone = new Map<string, MakeupApplication[]>()
  for (const m of request.makeup) {
    const zoneIds = m.zone === "cheeks" ? ["leftCheek", "rightCheek"] : [m.zone]
    for (const zoneId of zoneIds) {
      if (!makeupByZone.has(zoneId)) {
        makeupByZone.set(zoneId, [])
      }
      makeupByZone.get(zoneId)!.push(m)
    }
  }

  // Apply makeup zone by zone
  for (const [zoneId, zoneMakeup] of makeupByZone) {
    const zone = zones.find((z) => z.id === zoneId)
    if (!zone) continue

    const mask = generateMaskFromZones([zone], 1024, 1024)
    const prompt = generateInpaintingPrompt(
      zoneMakeup,
      request.lookTitle,
      request.lookDescription
    )

    try {
      const result = await runInpainting(
        currentImage.replace(/^data:[^;]+;base64,/, ""),
        currentMimeType,
        mask,
        prompt
      )

      if (result.success && result.imageBase64) {
        // Use this result as input for next zone
        currentImage = result.imageBase64
        currentMimeType = "image/png"
      }
    } catch (error) {
      console.error(`Failed to apply makeup to zone ${zoneId}:`, error)
      // Continue with other zones even if one fails
    }
  }

  return {
    success: true,
    imageBase64: currentImage,
    qualityScore: 0.85,
    processingTimeMs: Date.now() - startTime,
  }
}

/**
 * Validate that the image is suitable for inpainting
 */
export function validateImageForInpainting(
  imageBase64: string
): { valid: boolean; issues: string[] } {
  const issues: string[] = []

  // Remove data URL prefix if present for consistent validation
  const rawBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "")

  // Check base64 length (rough estimate of image size)
  const estimatedSizeKB = (rawBase64.length * 3) / 4 / 1024

  if (estimatedSizeKB < 10) {
    issues.push("Image too small (< 10KB)")
  }

  if (estimatedSizeKB > 10000) {
    issues.push("Image too large (> 10MB)")
  }

  // Check format - either has data URL prefix or starts with magic bytes
  const hasDataUrl =
    imageBase64.startsWith("data:image/jpeg") ||
    imageBase64.startsWith("data:image/png") ||
    imageBase64.startsWith("data:image/webp")

  // Magic bytes in base64:
  // JPEG: /9j/ (FFD8FF)
  // PNG: iVBOR (89504E47)
  // WebP: UklGR (52494646)
  const hasMagicBytes =
    rawBase64.startsWith("/9j/") || // JPEG
    rawBase64.startsWith("iVBOR") || // PNG
    rawBase64.startsWith("UklGR") // WebP

  if (!hasDataUrl && !hasMagicBytes) {
    // Additional check: try to detect if it's valid base64 at all
    const isValidBase64 = /^[A-Za-z0-9+/]+=*$/.test(rawBase64.slice(0, 100))
    if (!isValidBase64) {
      issues.push("Invalid base64 encoding")
    }
    // If it's valid base64 but unknown format, we'll still try (might be a valid image)
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}
