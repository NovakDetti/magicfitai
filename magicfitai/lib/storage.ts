import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { nanoid } from "nanoid"
import fs from "fs/promises"
import path from "path"

// Check if we're using R2 or local storage
const USE_R2 = !!(
  process.env.R2_ENDPOINT &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET
)

// R2/S3 Client
const s3Client = USE_R2
  ? new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null

const BUCKET = process.env.R2_BUCKET || "magicfit-storage"
const PUBLIC_URL = process.env.R2_PUBLIC_URL

// Local storage directory for development
const LOCAL_STORAGE_DIR = path.join(process.cwd(), "public", "uploads")

/**
 * Ensure local storage directory exists
 */
async function ensureLocalDir(subdir: string = "") {
  const dir = path.join(LOCAL_STORAGE_DIR, subdir)
  await fs.mkdir(dir, { recursive: true })
  return dir
}

/**
 * Generate a unique filename with prefix
 */
function generateFilename(prefix: string, extension: string): string {
  const id = nanoid(16)
  const timestamp = Date.now()
  return `${prefix}/${timestamp}-${id}.${extension}`
}

/**
 * Upload a file to storage
 */
export async function uploadFile(
  buffer: Buffer,
  prefix: string,
  extension: string,
  contentType: string
): Promise<string> {
  const key = generateFilename(prefix, extension)

  if (USE_R2 && s3Client) {
    // Upload to R2
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    )

    // Return public URL if available, otherwise use signed URL
    if (PUBLIC_URL) {
      return `${PUBLIC_URL}/${key}`
    }
    return await getSignedDownloadUrl(key)
  } else {
    // Local storage fallback
    const dir = await ensureLocalDir(prefix)
    const filename = path.basename(key)
    const filePath = path.join(dir, filename)
    await fs.writeFile(filePath, buffer)
    return `/uploads/${key}`
  }
}

/**
 * Upload an image from base64 data
 */
export async function uploadBase64Image(
  base64Data: string,
  prefix: string
): Promise<string> {
  // Remove data URL prefix if present
  const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, "")
  const buffer = Buffer.from(base64Content, "base64")

  // Detect image type from base64 header or default to png
  let extension = "png"
  let contentType = "image/png"
  if (base64Data.startsWith("data:image/jpeg")) {
    extension = "jpg"
    contentType = "image/jpeg"
  } else if (base64Data.startsWith("data:image/webp")) {
    extension = "webp"
    contentType = "image/webp"
  }

  return uploadFile(buffer, prefix, extension, contentType)
}

/**
 * Upload a PDF file
 */
export async function uploadPdf(buffer: Buffer, prefix: string): Promise<string> {
  return uploadFile(buffer, prefix, "pdf", "application/pdf")
}

/**
 * Get a signed URL for downloading a file
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  if (USE_R2 && s3Client) {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
    return getSignedUrl(s3Client, command, { expiresIn })
  }
  // Local storage - return direct path
  return `/uploads/${key}`
}

/**
 * Delete a file from storage
 */
export async function deleteFile(url: string): Promise<void> {
  // Extract key from URL
  let key: string
  if (PUBLIC_URL && url.startsWith(PUBLIC_URL)) {
    key = url.replace(`${PUBLIC_URL}/`, "")
  } else if (url.startsWith("/uploads/")) {
    key = url.replace("/uploads/", "")
  } else {
    // Try to extract from signed URL
    const urlObj = new URL(url)
    key = urlObj.pathname.slice(1) // Remove leading /
  }

  if (USE_R2 && s3Client) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    )
  } else {
    // Local storage
    const filePath = path.join(LOCAL_STORAGE_DIR, key)
    try {
      await fs.unlink(filePath)
    } catch {
      // Ignore if file doesn't exist
    }
  }
}

/**
 * Upload a file from a File object (for API routes)
 */
export async function uploadFormDataFile(
  file: File,
  prefix: string
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const extension = file.name.split(".").pop() || "bin"
  return uploadFile(buffer, prefix, extension, file.type)
}
