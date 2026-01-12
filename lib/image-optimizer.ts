import sharp from "sharp"

/**
 * Image optimization settings
 */
const IMAGE_SETTINGS = {
  // Maximum dimensions
  maxWidth: 1200,
  maxHeight: 1600,

  // Quality settings
  jpegQuality: 85,
  webpQuality: 85,

  // Format preferences
  useWebP: true, // WebP is ~30% smaller than JPEG
}

/**
 * Optimize an image buffer
 * Reduces file size by resizing and compressing
 */
export async function optimizeImage(
  buffer: Buffer,
  options?: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: "jpeg" | "webp" | "png"
  }
): Promise<{ buffer: Buffer; format: string; size: number }> {
  const maxWidth = options?.maxWidth || IMAGE_SETTINGS.maxWidth
  const maxHeight = options?.maxHeight || IMAGE_SETTINGS.maxHeight
  const quality = options?.quality || IMAGE_SETTINGS.jpegQuality
  const format = options?.format || (IMAGE_SETTINGS.useWebP ? "webp" : "jpeg")

  // Get image metadata
  const metadata = await sharp(buffer).metadata()

  // Calculate new dimensions while maintaining aspect ratio
  let width = metadata.width || maxWidth
  let height = metadata.height || maxHeight

  if (width > maxWidth || height > maxHeight) {
    const aspectRatio = width / height

    if (width > height) {
      width = maxWidth
      height = Math.round(maxWidth / aspectRatio)
    } else {
      height = maxHeight
      width = Math.round(maxHeight * aspectRatio)
    }
  }

  // Optimize image
  let pipeline = sharp(buffer)
    .resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    })

  // Apply format-specific optimizations
  switch (format) {
    case "webp":
      pipeline = pipeline.webp({ quality })
      break
    case "jpeg":
      pipeline = pipeline.jpeg({ quality, mozjpeg: true })
      break
    case "png":
      pipeline = pipeline.png({ compressionLevel: 9 })
      break
  }

  const optimizedBuffer = await pipeline.toBuffer()

  return {
    buffer: optimizedBuffer,
    format,
    size: optimizedBuffer.length,
  }
}

/**
 * Optimize a base64 image string
 * Converts to buffer, optimizes, and returns base64
 */
export async function optimizeBase64Image(
  base64Data: string,
  options?: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: "jpeg" | "webp" | "png"
  }
): Promise<{ base64: string; format: string; size: number; savings: number }> {
  // Remove data URL prefix if present
  const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, "")
  const originalBuffer = Buffer.from(base64Content, "base64")
  const originalSize = originalBuffer.length

  // Optimize
  const { buffer, format, size } = await optimizeImage(originalBuffer, options)

  // Convert back to base64
  const optimizedBase64 = `data:image/${format};base64,${buffer.toString("base64")}`

  // Calculate savings
  const savings = Math.round(((originalSize - size) / originalSize) * 100)

  return {
    base64: optimizedBase64,
    format,
    size,
    savings,
  }
}

/**
 * Get estimated storage cost for an image
 * Based on Cloudflare R2 pricing: $0.015/GB/month
 */
export function estimateStorageCost(sizeInBytes: number): {
  sizeGB: number
  monthlyCost: number
  yearlyConfig: number
} {
  const sizeGB = sizeInBytes / (1024 * 1024 * 1024)
  const monthlyCost = sizeGB * 0.015
  const yearlyConfig = monthlyCost * 12

  return {
    sizeGB,
    monthlyCost,
    yearlyConfig,
  }
}

/**
 * Check if image needs optimization
 */
export function needsOptimization(sizeInBytes: number): boolean {
  const MAX_SIZE = 500 * 1024 // 500KB threshold
  return sizeInBytes > MAX_SIZE
}
