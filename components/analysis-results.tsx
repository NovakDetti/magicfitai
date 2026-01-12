"use client"

import * as React from "react"
import { Image as ImageIcon, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AIObservations } from "@/components/ai-observations"
import { LooksView } from "@/components/looks-view"
import { RefinementModal, type RefinementDirection } from "@/components/refinement-modal"
import type { AnalysisObservations, MakeupLook } from "@/lib/db/schema"

interface AnalysisResultsProps {
  sessionId: string
  observations: AnalysisObservations
  looks: MakeupLook[]
  beforeImageUrl: string
  isPaid?: boolean
  userCredits?: number
  onCreditsChange?: (newBalance: number) => void
  className?: string
}

/**
 * AnalysisResults - Complete V1 results view
 *
 * Integrates:
 * - AIObservations ("Mit látott az AI?") block
 * - LooksView with 3 looks (Nappali, Elegáns, Esti)
 * - BeforeAfterSlider within each look
 * - Image export
 * - Finomítás (refinement) upsell
 */
export function AnalysisResults({
  sessionId,
  observations,
  looks,
  beforeImageUrl,
  isPaid = true,
  userCredits = 0,
  onCreditsChange,
  className,
}: AnalysisResultsProps) {
  const [isRefinementOpen, setIsRefinementOpen] = React.useState(false)
  const [selectedLookId, setSelectedLookId] = React.useState<string | null>(null)
  const [selectedLookTitle, setSelectedLookTitle] = React.useState("")
  const [isRefining, setIsRefining] = React.useState(false)
  const [currentLooks, setCurrentLooks] = React.useState(looks)
  const [currentCredits, setCurrentCredits] = React.useState(userCredits)

  // Update credits when prop changes
  React.useEffect(() => {
    setCurrentCredits(userCredits)
  }, [userCredits])

  const handleRefineLook = (lookId: string) => {
    const look = currentLooks.find((l) => l.id === lookId)
    if (!look) return

    setSelectedLookId(lookId)
    setSelectedLookTitle(look.title)
    setIsRefinementOpen(true)
  }

  const handleRefine = async (lookId: string, direction: RefinementDirection) => {
    setIsRefining(true)

    try {
      const res = await fetch("/api/refine-look", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisSessionId: sessionId,
          lookId,
          direction,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Nem sikerült a finomítás.")
      }

      const data = await res.json()

      // Update the looks with the refined version
      setCurrentLooks((prev) =>
        prev.map((look) =>
          look.id === lookId || look.id === `${lookId}-refined`
            ? data.refinedLook
            : look
        )
      )

      // Update credits
      if (data.newBalance !== undefined) {
        setCurrentCredits(data.newBalance)
        onCreditsChange?.(data.newBalance)
      }

      setIsRefinementOpen(false)
    } catch (error) {
      throw error
    } finally {
      setIsRefining(false)
    }
  }

  const handleExportImages = async () => {
    try {
      const res = await fetch(`/api/analysis/${sessionId}/export`)
      if (!res.ok) {
        throw new Error("Export failed")
      }

      const data = await res.json()

      // Open images in new tabs for download
      if (data.beforeImage) {
        window.open(data.beforeImage, "_blank")
      }

      for (const look of data.looks || []) {
        if (look.afterImageUrl) {
          window.open(look.afterImageUrl, "_blank")
        }
      }
    } catch (error) {
      console.error("Export error:", error)
    }
  }

  return (
    <div className={className}>
      {/* Export actions bar */}
      {isPaid && (
        <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={handleExportImages}>
            <ImageIcon className="mr-2 h-4 w-4" />
            Képek mentése
          </Button>
        </div>
      )}

      {/* AI Observations Section */}
      <AIObservations observations={observations} className="mb-8" />

      {/* Looks Section with Before/After Slider */}
      <LooksView
        looks={currentLooks}
        beforeImageUrl={beforeImageUrl}
        onRefineLook={handleRefineLook}
        canRefine={isPaid && currentCredits >= 1}
      />

      {/* Credit info for refinement */}
      {isPaid && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4" />
          <span>
            Finomítás: 1 kredit/look • Egyenleged: {currentCredits} kredit
          </span>
        </div>
      )}

      {/* Refinement Modal */}
      <RefinementModal
        isOpen={isRefinementOpen}
        onClose={() => setIsRefinementOpen(false)}
        lookId={selectedLookId || ""}
        lookTitle={selectedLookTitle}
        onRefine={handleRefine}
        userCredits={currentCredits}
        isProcessing={isRefining}
      />
    </div>
  )
}
