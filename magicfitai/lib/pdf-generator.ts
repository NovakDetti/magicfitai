import { jsPDF } from "jspdf"
import type { AnalysisObservations, MakeupLook } from "@/lib/db/schema"

/**
 * PDF Generator for Magic Fit AI Analysis Results
 *
 * Generates a professionally formatted PDF containing:
 * - Cover page with branding
 * - Original image
 * - AI observations
 * - 3 look summaries with steps and products
 */

// Color palette matching the app's theme
const COLORS = {
  primary: [183, 132, 142] as [number, number, number], // #B7848E
  text: [30, 30, 30] as [number, number, number],
  muted: [120, 120, 120] as [number, number, number],
  light: [245, 245, 245] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
}

// Font sizes
const FONT_SIZES = {
  title: 28,
  subtitle: 16,
  heading: 14,
  body: 11,
  small: 9,
}

interface GeneratePDFParams {
  observations: AnalysisObservations
  looks: MakeupLook[]
  beforeImageUrl: string
  afterImageUrls?: string[]
  occasion: string
  createdAt: Date
}

/**
 * Convert a URL to base64 data URL for embedding in PDF
 */
async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const contentType = response.headers.get("content-type") || "image/jpeg"
    return `data:${contentType};base64,${base64}`
  } catch (error) {
    console.error("Failed to convert image to base64:", error)
    return null
  }
}

/**
 * Generate the PDF document
 */
export async function generateAnalysisPDF({
  observations,
  looks,
  beforeImageUrl,
  afterImageUrls = [],
  occasion,
  createdAt,
}: GeneratePDFParams): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2

  // Helper function to add a new page
  const addPage = () => {
    doc.addPage()
    return margin // Return starting Y position for new page
  }

  // Helper function to check if we need a new page
  const checkNewPage = (currentY: number, neededHeight: number): number => {
    if (currentY + neededHeight > pageHeight - margin) {
      return addPage()
    }
    return currentY
  }

  // ============================================
  // COVER PAGE
  // ============================================

  // Background gradient effect (simulated with rectangles)
  doc.setFillColor(...COLORS.light)
  doc.rect(0, 0, pageWidth, pageHeight, "F")

  // Primary color accent bar at top
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 8, "F")

  // Logo/Brand area
  doc.setFontSize(FONT_SIZES.title)
  doc.setTextColor(...COLORS.primary)
  doc.text("Magic Fit AI", pageWidth / 2, 50, { align: "center" })

  doc.setFontSize(FONT_SIZES.subtitle)
  doc.setTextColor(...COLORS.muted)
  doc.text("Személyre szabott sminkelemzés", pageWidth / 2, 62, { align: "center" })

  // Original image (if available)
  try {
    const imageData = await imageUrlToBase64(beforeImageUrl)
    if (imageData) {
      const imgWidth = 80
      const imgHeight = 100
      const imgX = (pageWidth - imgWidth) / 2
      doc.addImage(imageData, "JPEG", imgX, 80, imgWidth, imgHeight)
    }
  } catch (error) {
    console.error("Failed to add before image:", error)
  }

  // Occasion and date
  doc.setFontSize(FONT_SIZES.body)
  doc.setTextColor(...COLORS.text)

  const occasionLabels: Record<string, string> = {
    everyday: "Hétköznapi",
    work: "Munkahelyi",
    evening: "Esti",
    special: "Különleges alkalom",
  }

  doc.text(
    `Alkalom: ${occasionLabels[occasion] || occasion}`,
    pageWidth / 2,
    200,
    { align: "center" }
  )

  doc.setTextColor(...COLORS.muted)
  doc.text(
    `Készült: ${createdAt.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    pageWidth / 2,
    208,
    { align: "center" }
  )

  // Footer
  doc.setFontSize(FONT_SIZES.small)
  doc.text("www.magicfitai.com", pageWidth / 2, pageHeight - 15, {
    align: "center",
  })

  // ============================================
  // PAGE 2: MIT LÁTOTT AZ AI?
  // ============================================

  addPage()

  // Section header
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 5, "F")

  let y = margin + 10

  doc.setFontSize(FONT_SIZES.heading + 4)
  doc.setTextColor(...COLORS.primary)
  doc.text("Mit látott az AI?", margin, y)
  y += 12

  doc.setFontSize(FONT_SIZES.body)
  doc.setTextColor(...COLORS.muted)
  doc.text("Személyre szabott megfigyelések az arcvonásaidról", margin, y)
  y += 15

  // Observations grid
  const observationFields: [keyof Omit<AnalysisObservations, "notes">, string][] = [
    ["faceShape", "Arcforma"],
    ["skinTone", "Bőrtónus"],
    ["undertone", "Altónus"],
    ["contrast", "Kontraszt"],
    ["eyeShape", "Szemek jellege"],
    ["brows", "Szemöldök"],
    ["lips", "Ajkak jellege"],
  ]

  const boxWidth = (contentWidth - 10) / 2
  const boxHeight = 18
  let col = 0

  for (const [key, label] of observationFields) {
    const value = observations[key]
    if (!value) continue

    const x = margin + col * (boxWidth + 10)

    // Box background
    doc.setFillColor(...COLORS.light)
    doc.roundedRect(x, y, boxWidth, boxHeight, 3, 3, "F")

    // Label
    doc.setFontSize(FONT_SIZES.small)
    doc.setTextColor(...COLORS.muted)
    doc.text(label.toUpperCase(), x + 5, y + 6)

    // Value
    doc.setFontSize(FONT_SIZES.body)
    doc.setTextColor(...COLORS.text)
    doc.text(value, x + 5, y + 13)

    col++
    if (col === 2) {
      col = 0
      y += boxHeight + 5
    }
  }

  if (col !== 0) {
    y += boxHeight + 5
  }

  // Notes (if any)
  if (observations.notes) {
    y += 10
    doc.setFillColor(...COLORS.light)
    doc.roundedRect(margin, y, contentWidth, 25, 3, 3, "F")

    doc.setFontSize(FONT_SIZES.body)
    doc.setTextColor(...COLORS.muted)
    doc.setFont("helvetica", "italic")

    const splitNotes = doc.splitTextToSize(`"${observations.notes}"`, contentWidth - 10)
    doc.text(splitNotes, margin + 5, y + 8)
    doc.setFont("helvetica", "normal")

    y += 30
  }

  // Disclaimer
  y += 10
  doc.setFontSize(FONT_SIZES.small)
  doc.setTextColor(...COLORS.muted)
  const disclaimer =
    "Ez egy kozmetikai jellegű megfigyelés, nem orvosi értékelés. Az AI által meghatározott jellemzők csak tájékoztató jellegűek."
  const splitDisclaimer = doc.splitTextToSize(disclaimer, contentWidth)
  doc.text(splitDisclaimer, margin, y)

  // ============================================
  // PAGES 3+: LOOKS
  // ============================================

  const lookTypes = ["Nappali", "Elegáns", "Alkalmi / Esti"]

  for (let i = 0; i < looks.length; i++) {
    const look = looks[i]
    addPage()

    // Header bar
    doc.setFillColor(...COLORS.primary)
    doc.rect(0, 0, pageWidth, 5, "F")

    y = margin + 10

    // Look number badge
    doc.setFillColor(...COLORS.primary)
    doc.circle(margin + 5, y - 2, 6, "F")
    doc.setFontSize(FONT_SIZES.body)
    doc.setTextColor(...COLORS.white)
    doc.text(String(i + 1), margin + 5, y, { align: "center" })

    // Look title
    doc.setFontSize(FONT_SIZES.heading + 4)
    doc.setTextColor(...COLORS.primary)
    doc.text(look.title || lookTypes[i], margin + 15, y)
    y += 8

    doc.setFontSize(FONT_SIZES.body)
    doc.setTextColor(...COLORS.muted)
    doc.text(lookTypes[i], margin + 15, y)
    y += 15

    // After image (if available)
    const afterUrl = look.afterImageUrl || afterImageUrls[i]
    if (afterUrl) {
      try {
        const imageData = await imageUrlToBase64(afterUrl)
        if (imageData) {
          const imgWidth = 60
          const imgHeight = 75
          doc.addImage(imageData, "JPEG", margin, y, imgWidth, imgHeight)

          // Description next to image
          doc.setFontSize(FONT_SIZES.body)
          doc.setTextColor(...COLORS.text)
          const splitWhy = doc.splitTextToSize(look.why, contentWidth - imgWidth - 15)
          doc.text(splitWhy, margin + imgWidth + 10, y + 5)

          y += imgHeight + 10
        }
      } catch (error) {
        console.error("Failed to add look image:", error)
      }
    } else {
      // Just description without image
      doc.setFontSize(FONT_SIZES.body)
      doc.setTextColor(...COLORS.text)
      const splitWhy = doc.splitTextToSize(look.why, contentWidth)
      doc.text(splitWhy, margin, y)
      y += splitWhy.length * 5 + 10
    }

    // Steps section
    y = checkNewPage(y, 50)

    doc.setFontSize(FONT_SIZES.heading)
    doc.setTextColor(...COLORS.primary)
    doc.text("Smink lépések", margin, y)
    y += 8

    doc.setFontSize(FONT_SIZES.body)
    doc.setTextColor(...COLORS.text)

    for (let j = 0; j < look.steps.length; j++) {
      y = checkNewPage(y, 8)

      doc.setTextColor(...COLORS.primary)
      doc.text(`${j + 1}.`, margin, y)

      doc.setTextColor(...COLORS.text)
      const stepText = doc.splitTextToSize(look.steps[j], contentWidth - 10)
      doc.text(stepText, margin + 8, y)

      y += stepText.length * 5 + 3
    }

    // Products section
    y = checkNewPage(y, 50)
    y += 10

    doc.setFontSize(FONT_SIZES.heading)
    doc.setTextColor(...COLORS.primary)
    doc.text("Szükséges termékek", margin, y)
    y += 8

    const productCategories: [keyof typeof look.products, string][] = [
      ["base", "Alap"],
      ["eyes", "Szemek"],
      ["brows", "Szemöldök"],
      ["lips", "Ajkak"],
      ["face", "Arc"],
    ]

    for (const [key, label] of productCategories) {
      const items = look.products[key]
      if (!items || items.length === 0) continue

      y = checkNewPage(y, 15)

      doc.setFontSize(FONT_SIZES.small)
      doc.setTextColor(...COLORS.muted)
      doc.text(label.toUpperCase(), margin, y)
      y += 5

      doc.setFontSize(FONT_SIZES.body)
      doc.setTextColor(...COLORS.text)

      for (const item of items) {
        y = checkNewPage(y, 6)
        doc.text(`• ${item}`, margin + 5, y)
        y += 5
      }

      y += 3
    }
  }

  // ============================================
  // FINAL PAGE: FOOTER
  // ============================================

  addPage()

  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 5, "F")

  y = pageHeight / 2 - 30

  doc.setFontSize(FONT_SIZES.title)
  doc.setTextColor(...COLORS.primary)
  doc.text("Magic Fit AI", pageWidth / 2, y, { align: "center" })

  y += 15
  doc.setFontSize(FONT_SIZES.subtitle)
  doc.setTextColor(...COLORS.muted)
  doc.text("Köszönjük, hogy minket választottál!", pageWidth / 2, y, { align: "center" })

  y += 25
  doc.setFontSize(FONT_SIZES.body)
  doc.text("www.magicfitai.com", pageWidth / 2, y, { align: "center" })

  y += 20
  doc.setFontSize(FONT_SIZES.small)
  const footerNote = "Ez a dokumentum személyes használatra készült. A benne foglalt sminkjavaslatok az AI elemzésen alapulnak és iránymutatásként szolgálnak."
  const splitFooter = doc.splitTextToSize(footerNote, contentWidth)
  doc.text(splitFooter, pageWidth / 2, y, { align: "center" })

  // Return as Buffer
  const pdfOutput = doc.output("arraybuffer")
  return Buffer.from(pdfOutput)
}

/**
 * Generate a filename for the PDF
 */
export function generatePDFFilename(sessionId: string): string {
  const date = new Date().toISOString().split("T")[0]
  return `magicfit-elemzes-${date}-${sessionId.slice(0, 8)}.pdf`
}
