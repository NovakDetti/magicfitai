/**
 * Fallback Handler
 *
 * Implements the fallback decision tree for handling inpainting failures:
 *
 * 1. If landmarks fail → Skip inpainting, return original with text-only description
 * 2. If inpainting fails → Retry with simpler prompt (max 2 retries)
 * 3. If quality check fails → Try reducing intensity or skip zone
 * 4. Final fallback → Return original image with "smink előnézet nem elérhető" message
 */

import type {
  FaceLandmarks,
  InpaintingRequest,
  InpaintingResult,
  MakeupApplication,
  QualityCheckResult,
  PipelineResult,
} from "./types"
import { detectFaceLandmarks, validateFaceLandmarks } from "./face-detection"
import { applyInpainting, validateImageForInpainting } from "./inpainting-service"
import {
  checkInpaintingQuality,
  determineFallbackAction,
  simplifyPrompt,
  logQualityMetrics,
} from "./quality-check"

const MAX_RETRIES = 3

/**
 * Main pipeline entry point with full fallback handling
 */
export async function runInpaintingPipeline(
  imageBase64: string,
  mimeType: string,
  makeup: MakeupApplication[],
  lookTitle: string,
  lookDescription: string,
  sessionId?: string
): Promise<PipelineResult> {
  let attemptCount = 0

  // Step 1: Validate input image
  const imageValidation = validateImageForInpainting(imageBase64)
  if (!imageValidation.valid) {
    console.warn("Image validation failed:", imageValidation.issues)
    return {
      success: false,
      fallbackUsed: true,
      fallbackReason: `Kép validáció sikertelen: ${imageValidation.issues.join(", ")}`,
      attemptCount,
    }
  }

  // Step 2: Detect face landmarks
  const landmarks = await detectFaceLandmarks(
    imageBase64.replace(/^data:[^;]+;base64,/, ""),
    mimeType
  )

  if (!landmarks) {
    console.warn("Face detection failed - using original image")
    return {
      success: false,
      fallbackUsed: true,
      fallbackReason: "Arc felismerés sikertelen - eredeti kép használata",
      attemptCount,
    }
  }

  // Step 3: Validate landmarks
  const landmarkValidation = validateFaceLandmarks(landmarks)
  if (!landmarkValidation.valid) {
    console.warn("Landmark validation failed:", landmarkValidation.issues)

    // If confidence is too low, skip inpainting
    if (landmarks.confidence < 0.5) {
      return {
        success: false,
        fallbackUsed: true,
        fallbackReason: "Arc részletek nem megfelelőek - eredeti kép használata",
        attemptCount,
      }
    }
  }

  // Step 4: Attempt inpainting with retries
  let currentMakeup = [...makeup]
  let lastResult: InpaintingResult | null = null
  let lastQualityCheck: QualityCheckResult | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    attemptCount = attempt

    // Build request
    const request: InpaintingRequest = {
      imageBase64,
      mimeType,
      landmarks,
      makeup: currentMakeup,
      lookTitle,
      lookDescription,
    }

    // Run inpainting
    try {
      lastResult = await applyInpainting(request)
    } catch (error) {
      console.error(`Inpainting attempt ${attempt} failed:`, error)
      continue
    }

    if (!lastResult.success || !lastResult.imageBase64) {
      console.warn(`Inpainting attempt ${attempt} returned no result`)
      continue
    }

    // Run quality check
    lastQualityCheck = await checkInpaintingQuality(
      imageBase64,
      lastResult.imageBase64,
      mimeType
    )

    if (sessionId) {
      logQualityMetrics(sessionId, lastQualityCheck, attempt)
    }

    // If quality passed, we're done
    if (lastQualityCheck.passed && lastQualityCheck.score >= 0.6) {
      return {
        success: true,
        imageBase64: lastResult.imageBase64,
        fallbackUsed: false,
        qualityScore: lastQualityCheck.score,
        attemptCount,
      }
    }

    // Determine fallback action
    const fallbackAction = determineFallbackAction(lastQualityCheck, attempt)

    switch (fallbackAction) {
      case "retry_with_simpler_prompt":
        // Simplify descriptions for next attempt
        currentMakeup = currentMakeup.map((m) => ({
          ...m,
          description: simplifyMakeupDescription(m.description),
          intensity: Math.max(0.3, m.intensity - 0.2),
        }))
        lookDescription = simplifyPrompt(lookDescription)
        break

      case "reduce_intensity":
        // Reduce intensity for all makeup
        currentMakeup = currentMakeup.map((m) => ({
          ...m,
          intensity: Math.max(0.2, m.intensity * 0.6),
        }))
        break

      case "skip_zone":
        // Remove the most problematic zone
        const problematicZone = identifyProblematicZone(lastQualityCheck.issues)
        if (problematicZone) {
          currentMakeup = currentMakeup.filter((m) => m.zone !== problematicZone)
          if (currentMakeup.length === 0) {
            // All zones removed, use original
            return {
              success: false,
              fallbackUsed: true,
              fallbackReason: "Smink előnézet nem érhető el",
              attemptCount,
            }
          }
        }
        break

      case "use_original":
        // Give up and use original
        return {
          success: false,
          fallbackUsed: true,
          fallbackReason: "Smink előnézet nem érhető el - minőségi problémák",
          qualityScore: lastQualityCheck.score,
          attemptCount,
        }

      case "fail":
        return {
          success: false,
          fallbackUsed: true,
          fallbackReason: "Az AI előnézet generálás sikertelen",
          attemptCount,
        }
    }
  }

  // All retries exhausted
  // If we have any result with score > 0.4, use it with a warning
  if (lastResult?.imageBase64 && lastQualityCheck && lastQualityCheck.score >= 0.4) {
    return {
      success: true,
      imageBase64: lastResult.imageBase64,
      fallbackUsed: true,
      fallbackReason: "AI előnézet alacsony minőséggel",
      qualityScore: lastQualityCheck.score,
      attemptCount,
    }
  }

  return {
    success: false,
    fallbackUsed: true,
    fallbackReason: "Smink előnézet nem érhető el",
    attemptCount,
  }
}

/**
 * Simplify makeup description for retry attempts
 */
function simplifyMakeupDescription(description: string): string {
  return description
    // Remove specific shades
    .replace(/\b(rose|coral|berry|nude|pink|red|burgundy|plum|mauve|peach)\s+(gold|bronze|copper|silver)?\b/gi, "natural")
    // Remove intensity words
    .replace(/\b(bold|dramatic|intense|vivid|deep|rich)\b/gi, "subtle")
    // Remove technique words
    .replace(/\b(smoky|winged|cut-crease|halo|ombre)\b/gi, "simple")
    // Remove product specifics
    .replace(/\b(glitter|shimmer|sparkle|metallic|matte|satin|glossy)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Identify which zone is causing the most problems
 */
function identifyProblematicZone(
  issues: string[]
): MakeupApplication["zone"] | null {
  const issuesLower = issues.map((i) => i.toLowerCase()).join(" ")

  if (issuesLower.includes("eye") || issuesLower.includes("lid")) {
    return "eyes"
  }
  if (issuesLower.includes("lip") || issuesLower.includes("mouth")) {
    return "lips"
  }
  if (issuesLower.includes("cheek") || issuesLower.includes("blush")) {
    return "cheeks"
  }
  if (issuesLower.includes("brow")) {
    return "brows"
  }

  return null
}

/**
 * Quick check if inpainting should even be attempted
 * Based on image and face detection viability
 */
export async function canAttemptInpainting(
  imageBase64: string,
  mimeType: string
): Promise<{
  canAttempt: boolean
  reason?: string
  landmarks?: FaceLandmarks
}> {
  // Validate image
  const validation = validateImageForInpainting(imageBase64)
  if (!validation.valid) {
    return {
      canAttempt: false,
      reason: validation.issues[0],
    }
  }

  // Try face detection
  const landmarks = await detectFaceLandmarks(
    imageBase64.replace(/^data:[^;]+;base64,/, ""),
    mimeType
  )

  if (!landmarks) {
    return {
      canAttempt: false,
      reason: "No face detected",
    }
  }

  if (landmarks.confidence < 0.4) {
    return {
      canAttempt: false,
      reason: "Face detection confidence too low",
    }
  }

  return {
    canAttempt: true,
    landmarks,
  }
}
