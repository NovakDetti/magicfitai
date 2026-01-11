/**
 * Face Landmark Detection Service
 *
 * Uses Replicate's face landmark detection model to identify facial features
 * for accurate mask generation.
 */

import type { FaceLandmarks, Point } from "./types"

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN

/**
 * Detect face landmarks using a face detection API
 *
 * Since we're running server-side, we use Replicate's face detection model
 * or fall back to approximate zones based on face detection
 */
export async function detectFaceLandmarks(
  imageBase64: string,
  mimeType: string
): Promise<FaceLandmarks | null> {
  if (!REPLICATE_API_TOKEN) {
    console.warn("REPLICATE_API_TOKEN not set, using fallback face detection")
    return detectFaceLandmarksFallback(imageBase64, mimeType)
  }

  try {
    // Use Replicate's face-alignment model for landmark detection
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Using face-alignment model for landmark detection
        version: "4c0b0e4d2a7b95c1d9d36a8a5b5e0a3f2c1d4e5f", // placeholder - will use actual model
        input: {
          image: `data:${mimeType};base64,${imageBase64}`,
        },
      }),
    })

    if (!response.ok) {
      console.error("Face detection API error:", response.status)
      return detectFaceLandmarksFallback(imageBase64, mimeType)
    }

    const prediction = await response.json()

    // Poll for completion
    const result = await pollForResult(prediction.id)

    if (result && result.output) {
      return parseFaceLandmarks(result.output)
    }

    return detectFaceLandmarksFallback(imageBase64, mimeType)
  } catch (error) {
    console.error("Face detection error:", error)
    return detectFaceLandmarksFallback(imageBase64, mimeType)
  }
}

/**
 * Poll Replicate prediction until complete
 */
async function pollForResult(
  predictionId: string,
  maxAttempts: number = 30
): Promise<{ output: unknown } | null> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        },
      }
    )

    if (!response.ok) continue

    const prediction = await response.json()

    if (prediction.status === "succeeded") {
      return prediction
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      console.error("Prediction failed:", prediction.error)
      return null
    }
  }

  return null
}

/**
 * Parse face landmarks from detection model output
 */
function parseFaceLandmarks(output: unknown): FaceLandmarks | null {
  // Parse the output based on the model's format
  // This will be adjusted based on actual model output

  if (!output || typeof output !== "object") {
    return null
  }

  // Type assertion for parsed output
  const data = output as {
    landmarks?: number[][]
    confidence?: number
    face_box?: number[]
  }

  if (!data.landmarks || !Array.isArray(data.landmarks)) {
    return null
  }

  // Map 68-point or 478-point landmarks to our structure
  const points = data.landmarks.map(
    (p: number[]): Point => ({
      x: p[0],
      y: p[1],
    })
  )

  // Standard 68-point landmark indices
  // Jawline: 0-16, Right brow: 17-21, Left brow: 22-26
  // Nose: 27-35, Right eye: 36-41, Left eye: 42-47
  // Outer lips: 48-59, Inner lips: 60-67

  return {
    faceBox: {
      x: data.face_box?.[0] || 0,
      y: data.face_box?.[1] || 0,
      width: data.face_box?.[2] || 0,
      height: data.face_box?.[3] || 0,
    },
    leftEye: points.slice(42, 48),
    rightEye: points.slice(36, 42),
    leftBrow: points.slice(22, 27),
    rightBrow: points.slice(17, 22),
    lips: {
      outer: points.slice(48, 60),
      inner: points.slice(60, 68),
    },
    leftCheek: generateCheekPoints(points, "left"),
    rightCheek: generateCheekPoints(points, "right"),
    nose: points.slice(27, 36),
    faceContour: points.slice(0, 17),
    confidence: data.confidence || 0.8,
  }
}

/**
 * Generate approximate cheek points from face landmarks
 */
function generateCheekPoints(
  points: Point[],
  side: "left" | "right"
): Point[] {
  // Cheeks are between the eye, nose, and jawline
  if (points.length < 68) return []

  const eyePoints = side === "left" ? points.slice(42, 48) : points.slice(36, 42)
  const jawPoints = side === "left" ? points.slice(4, 8) : points.slice(9, 13)
  const noseTip = points[30]

  // Calculate cheek center as midpoint between eye bottom, jaw, and nose
  const eyeBottom =
    eyePoints.reduce(
      (acc, p) => ({ x: acc.x + p.x, y: Math.max(acc.y, p.y) }),
      { x: 0, y: 0 }
    )
  eyeBottom.x /= eyePoints.length

  const jawCenter = jawPoints[Math.floor(jawPoints.length / 2)]

  const cheekCenter = {
    x: (eyeBottom.x + jawCenter.x + noseTip.x) / 3,
    y: (eyeBottom.y + jawCenter.y) / 2,
  }

  // Generate an ellipse around the cheek center
  const radiusX = Math.abs(noseTip.x - eyeBottom.x) * 0.6
  const radiusY = Math.abs(jawCenter.y - eyeBottom.y) * 0.4

  const cheekPoints: Point[] = []
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    cheekPoints.push({
      x: cheekCenter.x + Math.cos(angle) * radiusX,
      y: cheekCenter.y + Math.sin(angle) * radiusY,
    })
  }

  return cheekPoints
}

/**
 * Fallback face detection using image analysis
 *
 * When Replicate is not available, use Gemini to detect face location
 * and generate approximate landmark zones
 */
async function detectFaceLandmarksFallback(
  imageBase64: string,
  mimeType: string
): Promise<FaceLandmarks | null> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY

  if (!GEMINI_API_KEY) {
    console.error("No face detection API available")
    return null
  }

  try {
    // Use Gemini to analyze face position and features
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
                  text: `Analyze this portrait photo and provide precise face feature locations.

Return ONLY a JSON object with these coordinates as percentages (0-100) of image dimensions:

{
  "faceBox": { "x": %, "y": %, "width": %, "height": % },
  "leftEye": { "centerX": %, "centerY": %, "width": %, "height": % },
  "rightEye": { "centerX": %, "centerY": %, "width": %, "height": % },
  "leftBrow": { "startX": %, "endX": %, "y": %, "height": % },
  "rightBrow": { "startX": %, "endX": %, "y": %, "height": % },
  "lips": { "centerX": %, "topY": %, "bottomY": %, "width": % },
  "leftCheek": { "centerX": %, "centerY": %, "radiusX": %, "radiusY": % },
  "rightCheek": { "centerX": %, "centerY": %, "radiusX": %, "radiusY": % },
  "nose": { "centerX": %, "topY": %, "bottomY": %, "width": % },
  "confidence": 0-1
}

Be precise. Return ONLY the JSON, no other text.`,
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64,
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
      console.error("Gemini face analysis error:", response.status)
      return null
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      return null
    }

    // Parse JSON from response - remove markdown code blocks
    let jsonStr = content.trim()
    // Remove opening ```json or ```
    jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, "")
    // Remove closing ```
    jsonStr = jsonStr.replace(/\n?\s*```\s*$/, "")
    jsonStr = jsonStr.trim()

    // Try to extract JSON object if there's extra content
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonStr = jsonMatch[0]
    }

    const parsed = JSON.parse(jsonStr)
    return convertGeminiLandmarks(parsed)
  } catch (error) {
    console.error("Fallback face detection error:", error)
    return null
  }
}

/**
 * Convert Gemini percentage-based landmarks to point arrays
 */
function convertGeminiLandmarks(parsed: {
  faceBox: { x: number; y: number; width: number; height: number }
  leftEye: { centerX: number; centerY: number; width: number; height: number }
  rightEye: { centerX: number; centerY: number; width: number; height: number }
  leftBrow: { startX: number; endX: number; y: number; height: number }
  rightBrow: { startX: number; endX: number; y: number; height: number }
  lips: { centerX: number; topY: number; bottomY: number; width: number }
  leftCheek: { centerX: number; centerY: number; radiusX: number; radiusY: number }
  rightCheek: { centerX: number; centerY: number; radiusX: number; radiusY: number }
  nose: { centerX: number; topY: number; bottomY: number; width: number }
  confidence: number
}): FaceLandmarks {
  // Convert percentage values to normalized 0-1 values
  const scale = 0.01

  // Generate eye contour points from bounding box
  const generateEyePoints = (eye: {
    centerX: number
    centerY: number
    width: number
    height: number
  }): Point[] => {
    const cx = eye.centerX * scale
    const cy = eye.centerY * scale
    const rx = (eye.width * scale) / 2
    const ry = (eye.height * scale) / 2

    // 6-point ellipse
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2
      return {
        x: cx + Math.cos(angle) * rx,
        y: cy + Math.sin(angle) * ry,
      }
    })
  }

  // Generate brow points
  const generateBrowPoints = (brow: {
    startX: number
    endX: number
    y: number
    height: number
  }): Point[] => {
    const points: Point[] = []
    const steps = 5
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      points.push({
        x: (brow.startX + (brow.endX - brow.startX) * t) * scale,
        y: brow.y * scale,
      })
    }
    return points
  }

  // Generate lip contour
  const generateLipPoints = (lips: {
    centerX: number
    topY: number
    bottomY: number
    width: number
  }): { outer: Point[]; inner: Point[] } => {
    const cx = lips.centerX * scale
    const rx = (lips.width * scale) / 2
    const topY = lips.topY * scale
    const bottomY = lips.bottomY * scale
    const midY = (topY + bottomY) / 2

    // Outer lip contour
    const outer: Point[] = []
    // Top lip arc
    for (let i = 0; i <= 6; i++) {
      const t = i / 6
      const angle = Math.PI + Math.PI * t
      outer.push({
        x: cx + Math.cos(angle) * rx,
        y: topY + (midY - topY) * (1 - Math.abs(Math.cos(angle))),
      })
    }
    // Bottom lip arc
    for (let i = 0; i <= 6; i++) {
      const t = i / 6
      const angle = Math.PI * t
      outer.push({
        x: cx + Math.cos(angle) * rx,
        y: midY + (bottomY - midY) * Math.sin(angle),
      })
    }

    // Inner lip (smaller version)
    const inner = outer.map((p) => ({
      x: cx + (p.x - cx) * 0.6,
      y: midY + (p.y - midY) * 0.5,
    }))

    return { outer, inner }
  }

  // Generate cheek ellipse
  const generateCheekPoints = (cheek: {
    centerX: number
    centerY: number
    radiusX: number
    radiusY: number
  }): Point[] => {
    const cx = cheek.centerX * scale
    const cy = cheek.centerY * scale
    const rx = cheek.radiusX * scale
    const ry = cheek.radiusY * scale

    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2
      return {
        x: cx + Math.cos(angle) * rx,
        y: cy + Math.sin(angle) * ry,
      }
    })
  }

  // Generate nose points
  const generateNosePoints = (nose: {
    centerX: number
    topY: number
    bottomY: number
    width: number
  }): Point[] => {
    const cx = nose.centerX * scale
    const topY = nose.topY * scale
    const bottomY = nose.bottomY * scale
    const halfWidth = (nose.width * scale) / 2

    return [
      { x: cx, y: topY },
      { x: cx - halfWidth * 0.3, y: topY + (bottomY - topY) * 0.5 },
      { x: cx - halfWidth, y: bottomY },
      { x: cx, y: bottomY },
      { x: cx + halfWidth, y: bottomY },
      { x: cx + halfWidth * 0.3, y: topY + (bottomY - topY) * 0.5 },
    ]
  }

  // Generate face contour from face box
  const generateFaceContour = (box: {
    x: number
    y: number
    width: number
    height: number
  }): Point[] => {
    const x = box.x * scale
    const y = box.y * scale
    const w = box.width * scale
    const h = box.height * scale

    // Oval-ish face shape
    const points: Point[] = []
    for (let i = 0; i <= 16; i++) {
      const t = i / 16
      const angle = Math.PI * t - Math.PI / 2
      points.push({
        x: x + w / 2 + Math.cos(angle) * (w / 2),
        y: y + h / 2 + Math.sin(angle) * (h / 2) * 1.2,
      })
    }
    return points
  }

  const lips = generateLipPoints(parsed.lips)

  return {
    faceBox: {
      x: parsed.faceBox.x * scale,
      y: parsed.faceBox.y * scale,
      width: parsed.faceBox.width * scale,
      height: parsed.faceBox.height * scale,
    },
    leftEye: generateEyePoints(parsed.leftEye),
    rightEye: generateEyePoints(parsed.rightEye),
    leftBrow: generateBrowPoints(parsed.leftBrow),
    rightBrow: generateBrowPoints(parsed.rightBrow),
    lips,
    leftCheek: generateCheekPoints(parsed.leftCheek),
    rightCheek: generateCheekPoints(parsed.rightCheek),
    nose: generateNosePoints(parsed.nose),
    faceContour: generateFaceContour(parsed.faceBox),
    confidence: parsed.confidence || 0.7,
  }
}

/**
 * Check if face detection result is valid for makeup application
 */
export function validateFaceLandmarks(landmarks: FaceLandmarks): {
  valid: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Check confidence
  if (landmarks.confidence < 0.5) {
    issues.push("Low confidence in face detection")
  }

  // Check that key features are present
  if (landmarks.leftEye.length < 4 || landmarks.rightEye.length < 4) {
    issues.push("Eye landmarks incomplete")
  }

  if (landmarks.lips.outer.length < 6) {
    issues.push("Lip landmarks incomplete")
  }

  if (landmarks.leftCheek.length < 4 || landmarks.rightCheek.length < 4) {
    issues.push("Cheek landmarks incomplete")
  }

  // Check face box is reasonable
  if (
    landmarks.faceBox.width < 0.1 ||
    landmarks.faceBox.height < 0.1 ||
    landmarks.faceBox.width > 0.9 ||
    landmarks.faceBox.height > 0.9
  ) {
    issues.push("Face box dimensions unusual")
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}
