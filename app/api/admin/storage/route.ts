import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { cleanupOldImages, getStorageStats } from "@/lib/storage-cleanup"

/**
 * GET /api/admin/storage
 * Get storage statistics
 */
export async function GET() {
  try {
    const session = await auth()

    // TODO: Add admin check
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = await getStorageStats()

    return NextResponse.json({
      stats,
      message: "Storage statistics retrieved successfully",
    })
  } catch (error) {
    console.error("Get storage stats error:", error)
    return NextResponse.json(
      { error: "Failed to get storage statistics" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/storage/cleanup
 * Manually trigger storage cleanup
 */
export async function POST() {
  try {
    const session = await auth()

    // TODO: Add admin check
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await cleanupOldImages()

    return NextResponse.json({
      result,
      message: `Cleanup complete: ${result.deletedSessions} sessions, ${result.deletedFiles} files, ${result.freedSpaceKB}KB freed`,
    })
  } catch (error) {
    console.error("Storage cleanup error:", error)
    return NextResponse.json(
      { error: "Failed to cleanup storage" },
      { status: 500 }
    )
  }
}
