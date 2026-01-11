import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { analysisSessions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { generateAnalysisPDF, generatePDFFilename } from "@/lib/pdf-generator"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/analysis/[id]/pdf
 *
 * Generate and return PDF for an analysis session.
 * Access control:
 * - Authenticated users can download their own analyses
 * - Guest token in query param allows download for guest sessions
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await auth()
    const userId = session?.user?.id

    // Check for guest token in query params
    const guestToken = request.nextUrl.searchParams.get("token")

    // Get analysis session
    const analysis = await db.query.analysisSessions.findFirst({
      where: eq(analysisSessions.id, id),
    })

    if (!analysis) {
      return NextResponse.json(
        { error: "Elemzés nem található." },
        { status: 404 }
      )
    }

    // Check authorization
    const isOwner = userId && analysis.userId === userId
    const hasValidToken = guestToken && analysis.guestToken === guestToken

    if (!isOwner && !hasValidToken) {
      return NextResponse.json(
        { error: "Nincs jogosultságod ehhez az elemzéshez." },
        { status: 403 }
      )
    }

    // Check if analysis is complete
    if (analysis.status !== "complete") {
      return NextResponse.json(
        { error: "Az elemzés még nem készült el." },
        { status: 400 }
      )
    }

    // Check required data
    if (!analysis.observations || !analysis.looks || !analysis.beforeImageUrl) {
      return NextResponse.json(
        { error: "Hiányos elemzési adatok." },
        { status: 400 }
      )
    }

    // Generate PDF
    const pdfBuffer = await generateAnalysisPDF({
      observations: analysis.observations,
      looks: analysis.looks,
      beforeImageUrl: analysis.beforeImageUrl,
      afterImageUrls: analysis.afterImages || [],
      occasion: analysis.occasion,
      createdAt: analysis.createdAt,
    })

    // Generate filename
    const filename = generatePDFFilename(analysis.id)

    // Return PDF with proper headers
    // Convert Buffer to Uint8Array for NextResponse compatibility
    const pdfUint8Array = new Uint8Array(pdfBuffer)

    return new NextResponse(pdfUint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json(
      { error: "Hiba történt a PDF generálása során." },
      { status: 500 }
    )
  }
}
