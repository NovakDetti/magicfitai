import { db } from "./db"
import { analysisSessions } from "./db/schema"
import { lt, eq } from "drizzle-orm"
import { deleteFile } from "./storage"

/**
 * Storage cleanup configuration
 */
const CLEANUP_CONFIG = {
  // Delete images from expired analysis sessions (older than 90 days)
  expiryDays: 90,

  // Delete images from failed sessions after 7 days
  failedSessionDays: 7,
}

/**
 * Clean up old images to save storage costs
 * Should be run as a cron job (e.g., daily at 3 AM)
 */
export async function cleanupOldImages(): Promise<{
  deletedSessions: number
  deletedFiles: number
  freedSpaceKB: number
}> {
  const now = new Date()
  const expiryDate = new Date(now.getTime() - CLEANUP_CONFIG.expiryDays * 24 * 60 * 60 * 1000)
  const failedDate = new Date(now.getTime() - CLEANUP_CONFIG.failedSessionDays * 24 * 60 * 60 * 1000)

  let deletedSessions = 0
  let deletedFiles = 0
  let freedSpaceKB = 0

  try {
    // Find expired sessions
    const expiredSessions = await db.query.analysisSessions.findMany({
      where: lt(analysisSessions.createdAt, expiryDate),
    })

    // Find failed sessions
    const failedSessions = await db.query.analysisSessions.findMany({
      where: lt(analysisSessions.createdAt, failedDate),
      columns: {
        id: true,
        status: true,
        beforeImageUrl: true,
        afterImages: true,
        pdfUrl: true,
        createdAt: true,
      },
    })

    const sessionsToClean = [
      ...expiredSessions,
      ...failedSessions.filter((s) => s.status === "failed" || s.status === "expired"),
    ]

    for (const session of sessionsToClean) {
      try {
        // Delete before image
        if (session.beforeImageUrl) {
          await deleteFile(session.beforeImageUrl)
          deletedFiles++
          freedSpaceKB += 500 // Estimate ~500KB per image
        }

        // Delete after images
        if (session.afterImages && Array.isArray(session.afterImages)) {
          for (const url of session.afterImages) {
            await deleteFile(url)
            deletedFiles++
            freedSpaceKB += 500
          }
        }

        // Delete PDF
        if (session.pdfUrl) {
          await deleteFile(session.pdfUrl)
          deletedFiles++
          freedSpaceKB += 200 // Estimate ~200KB per PDF
        }

        // Delete the session from database
        await db.delete(analysisSessions).where(eq(analysisSessions.id, session.id))
        deletedSessions++
      } catch (error) {
        console.error(`Failed to clean up session ${session.id}:`, error)
      }
    }

    console.log(
      `Cleanup complete: ${deletedSessions} sessions, ${deletedFiles} files, ~${freedSpaceKB}KB freed`
    )

    return { deletedSessions, deletedFiles, freedSpaceKB }
  } catch (error) {
    console.error("Storage cleanup failed:", error)
    throw error
  }
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<{
  totalSessions: number
  totalImages: number
  estimatedStorageGB: number
  estimatedMonthlyCost: number
}> {
  const sessions = await db.query.analysisSessions.findMany({
    columns: {
      beforeImageUrl: true,
      afterImages: true,
      pdfUrl: true,
    },
  })

  let totalImages = 0
  let estimatedStorageKB = 0

  for (const session of sessions) {
    if (session.beforeImageUrl) {
      totalImages++
      estimatedStorageKB += 300 // Optimized WebP ~300KB
    }

    if (session.afterImages && Array.isArray(session.afterImages)) {
      totalImages += session.afterImages.length
      estimatedStorageKB += session.afterImages.length * 300
    }

    if (session.pdfUrl) {
      estimatedStorageKB += 200
    }
  }

  const estimatedStorageGB = estimatedStorageKB / (1024 * 1024)
  const estimatedMonthlyCost = estimatedStorageGB * 0.015 // $0.015/GB/month for R2

  return {
    totalSessions: sessions.length,
    totalImages,
    estimatedStorageGB,
    estimatedMonthlyCost,
  }
}
