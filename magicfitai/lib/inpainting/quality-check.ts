/**
 * Quality Check System
 *
 * Validates inpainted images to ensure:
 * 1. Face identity is preserved
 * 2. Makeup looks natural
 * 3. No artifacts or distortions
 */

import type {
  QualityCheckResult,
  FallbackAction,
  InpaintingResult,
} from "./types"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

/**
 * Check quality of inpainted result
 */
export async function checkInpaintingQuality(
  originalImageBase64: string,
  inpaintedImageBase64: string,
  originalMimeType: string
): Promise<QualityCheckResult> {
  if (!GEMINI_API_KEY) {
    // Without API, do basic checks only
    return basicQualityCheck(inpaintedImageBase64)
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Compare these two portrait photos and evaluate the makeup edit quality.

TASK: Determine if the second image is the SAME person with ONLY makeup added.

Evaluate on these criteria (score each 0-10):

1. IDENTITY_PRESERVED: Is it clearly the same person? Same face shape, bone structure, features?
2. NATURAL_MAKEUP: Does the makeup look realistic and professionally applied?
3. NO_ARTIFACTS: Are there any visual glitches, blurring, or distortions?
4. LIGHTING_CONSISTENT: Is the lighting and skin tone consistent with the original?
5. SEAMLESS_BLEND: Are the makeup edges blended naturally with the skin?

Return ONLY a JSON object:
{
  "identity_preserved": 0-10,
  "natural_makeup": 0-10,
  "no_artifacts": 0-10,
  "lighting_consistent": 0-10,
  "seamless_blend": 0-10,
  "issues": ["list of specific problems if any"],
  "passed": true/false (true if all scores >= 6)
}`,
                },
                {
                  inline_data: {
                    mime_type: originalMimeType,
                    data: originalImageBase64.replace(/^data:[^;]+;base64,/, ""),
                  },
                },
                {
                  inline_data: {
                    mime_type: "image/png",
                    data: inpaintedImageBase64.replace(/^data:[^;]+;base64,/, ""),
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!response.ok) {
      console.error("Quality check API error:", response.status)
      return basicQualityCheck(inpaintedImageBase64)
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      return basicQualityCheck(inpaintedImageBase64)
    }

    return parseQualityCheckResponse(content)
  } catch (error) {
    console.error("Quality check error:", error)
    return basicQualityCheck(inpaintedImageBase64)
  }
}

/**
 * Parse quality check response from Gemini
 */
function parseQualityCheckResponse(content: string): QualityCheckResult {
  try {
    let jsonStr = content.trim()
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    }

    const parsed = JSON.parse(jsonStr)

    // Calculate overall score (weighted average)
    const weights = {
      identity_preserved: 3, // Most important
      natural_makeup: 2,
      no_artifacts: 2,
      lighting_consistent: 1.5,
      seamless_blend: 1.5,
    }

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
    const weightedScore =
      ((parsed.identity_preserved || 0) * weights.identity_preserved +
        (parsed.natural_makeup || 0) * weights.natural_makeup +
        (parsed.no_artifacts || 0) * weights.no_artifacts +
        (parsed.lighting_consistent || 0) * weights.lighting_consistent +
        (parsed.seamless_blend || 0) * weights.seamless_blend) /
      totalWeight /
      10

    return {
      passed: parsed.passed ?? weightedScore >= 0.6,
      score: weightedScore,
      issues: parsed.issues || [],
    }
  } catch {
    return {
      passed: false,
      score: 0.5,
      issues: ["Could not parse quality check response"],
    }
  }
}

/**
 * Basic quality check without AI
 */
function basicQualityCheck(imageBase64: string): QualityCheckResult {
  const issues: string[] = []

  // Check image data is present
  if (!imageBase64 || imageBase64.length < 1000) {
    issues.push("Image data appears corrupt or empty")
    return { passed: false, score: 0, issues }
  }

  // Check it's a valid base64 image
  if (
    !imageBase64.startsWith("data:image/") &&
    !imageBase64.match(/^[A-Za-z0-9+/=]+$/)
  ) {
    issues.push("Invalid image format")
    return { passed: false, score: 0.3, issues }
  }

  // Estimate image size
  const sizeKB = (imageBase64.length * 3) / 4 / 1024

  if (sizeKB < 20) {
    issues.push("Image may be too compressed")
  }

  return {
    passed: issues.length === 0,
    score: issues.length === 0 ? 0.7 : 0.5,
    issues,
  }
}

/**
 * Determine fallback action based on quality check result
 */
export function determineFallbackAction(
  result: QualityCheckResult,
  attemptNumber: number
): FallbackAction {
  // If passed, no fallback needed
  if (result.passed && result.score >= 0.6) {
    return "use_original" // Actually use the result
  }

  // Check specific issues
  const hasIdentityIssue = result.issues.some(
    (i) =>
      i.toLowerCase().includes("identity") ||
      i.toLowerCase().includes("different person") ||
      i.toLowerCase().includes("face shape")
  )

  const hasArtifactIssue = result.issues.some(
    (i) =>
      i.toLowerCase().includes("artifact") ||
      i.toLowerCase().includes("distortion") ||
      i.toLowerCase().includes("glitch")
  )

  const hasMakeupIssue = result.issues.some(
    (i) =>
      i.toLowerCase().includes("makeup") ||
      i.toLowerCase().includes("blend") ||
      i.toLowerCase().includes("natural")
  )

  // Identity issues are critical - don't retry
  if (hasIdentityIssue) {
    return "use_original"
  }

  // First attempt failures - try simpler approach
  if (attemptNumber === 1) {
    if (hasArtifactIssue) {
      return "retry_with_simpler_prompt"
    }
    if (hasMakeupIssue) {
      return "reduce_intensity"
    }
    return "retry_with_simpler_prompt"
  }

  // Second attempt - reduce makeup intensity
  if (attemptNumber === 2) {
    return "reduce_intensity"
  }

  // Third attempt - skip problematic zones
  if (attemptNumber === 3) {
    return "skip_zone"
  }

  // After 3 attempts, use original
  return "use_original"
}

/**
 * Generate a simpler prompt for retry
 */
export function simplifyPrompt(originalPrompt: string): string {
  // Remove specific product names and complex descriptions
  return originalPrompt
    .replace(/\b(glitter|shimmer|metallic|matte)\b/gi, "subtle")
    .replace(/\b(dramatic|bold|intense|vibrant)\b/gi, "natural")
    .replace(/\b(wing|smoky|cat-eye)\b/gi, "simple")
    .replace(/professional makeup photography,?\s*/gi, "")
    .replace(/high-end cosmetics advertisement,?\s*/gi, "")
}

/**
 * Check if result is acceptable (with lower threshold for retries)
 */
export function isAcceptableResult(
  result: QualityCheckResult,
  attemptNumber: number
): boolean {
  // Lower threshold for later attempts
  const threshold = Math.max(0.4, 0.6 - attemptNumber * 0.1)
  return result.score >= threshold
}

/**
 * Log quality metrics for monitoring
 */
export function logQualityMetrics(
  sessionId: string,
  result: QualityCheckResult,
  attempt: number
): void {
  console.log({
    event: "inpainting_quality_check",
    sessionId,
    attempt,
    passed: result.passed,
    score: result.score,
    issueCount: result.issues.length,
    issues: result.issues,
    timestamp: new Date().toISOString(),
  })
}
