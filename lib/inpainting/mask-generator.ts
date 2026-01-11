/**
 * Mask Generation Service
 *
 * Generates grayscale masks for makeup zones based on face landmarks.
 * Masks have soft edges (feathering) for natural blending.
 */

import type { FaceLandmarks, MakeupMask, MakeupZone, Point } from "./types"

/**
 * Zone definitions with feathering settings
 */
const ZONE_CONFIGS: Record<
  string,
  {
    featherRadius: number
    expandRadius: number
  }
> = {
  eyes: { featherRadius: 8, expandRadius: 4 },
  brows: { featherRadius: 6, expandRadius: 2 },
  lips: { featherRadius: 6, expandRadius: 3 },
  leftCheek: { featherRadius: 20, expandRadius: 10 },
  rightCheek: { featherRadius: 20, expandRadius: 10 },
  nose: { featherRadius: 10, expandRadius: 5 },
}

/**
 * Generate makeup zones from face landmarks
 */
export function generateMakeupZones(landmarks: FaceLandmarks): MakeupZone[] {
  const zones: MakeupZone[] = []

  // Eyes zone (combines both eyes for eyeshadow area)
  const eyeZone = generateEyeZone(landmarks)
  if (eyeZone) zones.push(eyeZone)

  // Brows zone
  const browZone = generateBrowZone(landmarks)
  if (browZone) zones.push(browZone)

  // Lips zone
  const lipZone = generateLipZone(landmarks)
  if (lipZone) zones.push(lipZone)

  // Cheek zones (separate for blush)
  const leftCheekZone = generateCheekZone(landmarks, "left")
  if (leftCheekZone) zones.push(leftCheekZone)

  const rightCheekZone = generateCheekZone(landmarks, "right")
  if (rightCheekZone) zones.push(rightCheekZone)

  return zones
}

/**
 * Generate eye makeup zone (upper and lower lid area)
 */
function generateEyeZone(landmarks: FaceLandmarks): MakeupZone | null {
  const leftEye = landmarks.leftEye
  const rightEye = landmarks.rightEye
  const leftBrow = landmarks.leftBrow
  const rightBrow = landmarks.rightBrow

  if (leftEye.length < 4 || rightEye.length < 4) {
    return null
  }

  // Expand eye area upward toward brows for eyeshadow
  const expandedPoints: Point[] = []

  // Left eye area
  const leftEyeTop = Math.min(...leftEye.map((p) => p.y))
  const leftEyeBottom = Math.max(...leftEye.map((p) => p.y))
  const leftBrowBottom = leftBrow.length > 0 ? Math.min(...leftBrow.map((p) => p.y)) : leftEyeTop - 0.02
  const leftEyeHeight = leftEyeBottom - leftEyeTop

  // Create expanded contour for left eye
  for (const p of leftEye) {
    // Expand points above eye toward brow
    if (p.y < leftEyeTop + leftEyeHeight * 0.3) {
      expandedPoints.push({
        x: p.x,
        y: Math.max(leftBrowBottom + 0.01, p.y - leftEyeHeight * 0.8),
      })
    } else {
      expandedPoints.push(p)
    }
  }

  // Right eye area
  const rightEyeTop = Math.min(...rightEye.map((p) => p.y))
  const rightEyeBottom = Math.max(...rightEye.map((p) => p.y))
  const rightBrowBottom = rightBrow.length > 0 ? Math.min(...rightBrow.map((p) => p.y)) : rightEyeTop - 0.02
  const rightEyeHeight = rightEyeBottom - rightEyeTop

  for (const p of rightEye) {
    if (p.y < rightEyeTop + rightEyeHeight * 0.3) {
      expandedPoints.push({
        x: p.x,
        y: Math.max(rightBrowBottom + 0.01, p.y - rightEyeHeight * 0.8),
      })
    } else {
      expandedPoints.push(p)
    }
  }

  return {
    id: "eyes",
    name: "Eyes",
    points: expandedPoints,
    featherRadius: ZONE_CONFIGS.eyes.featherRadius,
  }
}

/**
 * Generate brow zone
 */
function generateBrowZone(landmarks: FaceLandmarks): MakeupZone | null {
  const leftBrow = landmarks.leftBrow
  const rightBrow = landmarks.rightBrow

  if (leftBrow.length < 3 || rightBrow.length < 3) {
    return null
  }

  // Combine both brows with some vertical expansion
  const expandedPoints: Point[] = []

  for (const p of leftBrow) {
    expandedPoints.push({ x: p.x, y: p.y - 0.005 }) // Top edge
    expandedPoints.push({ x: p.x, y: p.y + 0.01 }) // Bottom edge
  }

  for (const p of rightBrow) {
    expandedPoints.push({ x: p.x, y: p.y - 0.005 })
    expandedPoints.push({ x: p.x, y: p.y + 0.01 })
  }

  return {
    id: "brows",
    name: "Brows",
    points: expandedPoints,
    featherRadius: ZONE_CONFIGS.brows.featherRadius,
  }
}

/**
 * Generate lip zone
 */
function generateLipZone(landmarks: FaceLandmarks): MakeupZone | null {
  const outerLip = landmarks.lips.outer

  if (outerLip.length < 6) {
    return null
  }

  // Use outer lip contour with slight expansion
  const expandedPoints = outerLip.map((p) => {
    const centerY = outerLip.reduce((sum, pt) => sum + pt.y, 0) / outerLip.length
    const expansion = 0.005

    return {
      x: p.x,
      y: p.y + (p.y > centerY ? expansion : -expansion),
    }
  })

  return {
    id: "lips",
    name: "Lips",
    points: expandedPoints,
    featherRadius: ZONE_CONFIGS.lips.featherRadius,
  }
}

/**
 * Generate cheek zone for blush
 */
function generateCheekZone(
  landmarks: FaceLandmarks,
  side: "left" | "right"
): MakeupZone | null {
  const cheek = side === "left" ? landmarks.leftCheek : landmarks.rightCheek

  if (cheek.length < 4) {
    return null
  }

  const config = ZONE_CONFIGS[`${side}Cheek`]

  return {
    id: `${side}Cheek`,
    name: `${side === "left" ? "Left" : "Right"} Cheek`,
    points: cheek,
    featherRadius: config.featherRadius,
  }
}

/**
 * Generate a grayscale mask image from zones
 *
 * The mask is created as an SVG and converted to base64 PNG.
 * White areas = apply inpainting, Black areas = preserve original.
 */
export function generateMaskFromZones(
  zones: MakeupZone[],
  width: number,
  height: number,
  targetZones?: string[]
): MakeupMask {
  // Filter zones if specific ones requested
  const activeZones = targetZones
    ? zones.filter((z) => targetZones.includes(z.id))
    : zones

  // Build SVG mask
  const svgParts: string[] = []

  for (const zone of activeZones) {
    // Scale points to image dimensions
    const scaledPoints = zone.points.map((p) => ({
      x: p.x * width,
      y: p.y * height,
    }))

    // Create path for the zone
    if (scaledPoints.length >= 3) {
      // Calculate convex hull or use points directly
      const pathD = createSmoothPath(scaledPoints)

      // Add gradient for soft edges
      const gradientId = `gradient-${zone.id}`
      svgParts.push(`
        <defs>
          <radialGradient id="${gradientId}">
            <stop offset="70%" stop-color="white" stop-opacity="1"/>
            <stop offset="100%" stop-color="white" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <path d="${pathD}" fill="url(#${gradientId})" filter="blur(${zone.featherRadius}px)"/>
      `)
    }
  }

  // Create complete SVG
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="black"/>
      ${svgParts.join("\n")}
    </svg>
  `

  // Convert SVG to base64
  const base64Svg = Buffer.from(svg).toString("base64")
  const maskBase64 = `data:image/svg+xml;base64,${base64Svg}`

  return {
    maskBase64,
    width,
    height,
    zones: activeZones.map((z) => z.id),
  }
}

/**
 * Create a smooth bezier path from points
 */
function createSmoothPath(points: Point[]): string {
  if (points.length < 3) {
    return ""
  }

  // Sort points by angle from centroid to create proper contour
  const centroid = {
    x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
    y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
  }

  const sortedPoints = [...points].sort((a, b) => {
    const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x)
    const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x)
    return angleA - angleB
  })

  // Create smooth bezier curve
  let path = `M ${sortedPoints[0].x} ${sortedPoints[0].y}`

  for (let i = 0; i < sortedPoints.length; i++) {
    const p0 = sortedPoints[(i - 1 + sortedPoints.length) % sortedPoints.length]
    const p1 = sortedPoints[i]
    const p2 = sortedPoints[(i + 1) % sortedPoints.length]
    const p3 = sortedPoints[(i + 2) % sortedPoints.length]

    // Catmull-Rom to Bezier conversion
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }

  path += " Z"
  return path
}

/**
 * Generate separate masks for each makeup zone
 */
export function generateSeparateMasks(
  landmarks: FaceLandmarks,
  width: number,
  height: number
): Record<string, MakeupMask> {
  const zones = generateMakeupZones(landmarks)
  const masks: Record<string, MakeupMask> = {}

  for (const zone of zones) {
    masks[zone.id] = generateMaskFromZones([zone], width, height)
  }

  return masks
}

/**
 * Combine multiple zone masks into one
 */
export function combineMasks(
  masks: MakeupMask[],
  width: number,
  height: number
): MakeupMask {
  // Combine all zones
  const allZones = masks.flatMap((m) => m.zones)

  // Create combined SVG (simplified - actual implementation would blend the masks)
  const combinedSvgParts = masks.map((mask) => {
    // Extract SVG content from each mask
    const svgContent = Buffer.from(
      mask.maskBase64.replace("data:image/svg+xml;base64,", ""),
      "base64"
    ).toString()

    // Extract just the path elements
    const pathMatch = svgContent.match(/<path[^>]+\/>/g)
    return pathMatch ? pathMatch.join("\n") : ""
  })

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="black"/>
      ${combinedSvgParts.join("\n")}
    </svg>
  `

  return {
    maskBase64: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
    width,
    height,
    zones: allZones,
  }
}
