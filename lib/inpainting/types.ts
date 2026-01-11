/**
 * Inpainting Pipeline Types
 *
 * Types for the makeup inpainting system that preserves original face identity
 */

export interface FaceLandmarks {
  // Face bounding box
  faceBox: {
    x: number
    y: number
    width: number
    height: number
  }

  // Eye regions (for eyeshadow, eyeliner)
  leftEye: Point[]
  rightEye: Point[]

  // Eyebrow regions
  leftBrow: Point[]
  rightBrow: Point[]

  // Lip regions (upper and lower lip contours)
  lips: {
    outer: Point[]
    inner: Point[]
  }

  // Cheek regions (for blush, contour)
  leftCheek: Point[]
  rightCheek: Point[]

  // Nose (for contour)
  nose: Point[]

  // Face contour (for overall reference)
  faceContour: Point[]

  // Confidence score
  confidence: number
}

export interface Point {
  x: number
  y: number
}

export interface MakeupZone {
  id: string
  name: string
  points: Point[]
  // Soft edge feathering in pixels
  featherRadius: number
}

export interface MakeupMask {
  // Base64 encoded grayscale mask image
  maskBase64: string
  // Original image dimensions
  width: number
  height: number
  // Zones included in this mask
  zones: string[]
}

export interface InpaintingPrompt {
  positive: string
  negative: string
}

export interface MakeupApplication {
  // Zone to apply makeup to
  zone: "eyes" | "lips" | "cheeks" | "brows" | "base"
  // Specific makeup description
  description: string
  // Intensity (0-1)
  intensity: number
}

export interface InpaintingRequest {
  // Original image as base64
  imageBase64: string
  mimeType: string
  // Face landmarks detected from image
  landmarks: FaceLandmarks
  // Makeup to apply
  makeup: MakeupApplication[]
  // Look metadata
  lookTitle: string
  lookDescription: string
}

export interface InpaintingResult {
  success: boolean
  // Result image as base64 (if successful)
  imageBase64?: string
  // Error message (if failed)
  error?: string
  // Quality score (0-1)
  qualityScore?: number
  // Processing time in ms
  processingTimeMs?: number
}

export interface QualityCheckResult {
  passed: boolean
  score: number
  issues: string[]
}

export type FallbackAction =
  | "retry_with_simpler_prompt"
  | "reduce_intensity"
  | "skip_zone"
  | "use_original"
  | "fail"

export interface PipelineResult {
  success: boolean
  imageBase64?: string
  fallbackUsed: boolean
  fallbackReason?: string
  qualityScore?: number
  attemptCount: number
}
