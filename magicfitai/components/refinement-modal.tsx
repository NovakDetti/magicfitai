"use client"

import * as React from "react"
import { Loader2, RefreshCw, Sparkles, Feather, Zap } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"

export type RefinementDirection = "termeszetesebb" | "hatarozottabb"

interface RefinementModalProps {
  isOpen: boolean
  onClose: () => void
  lookId: string
  lookTitle: string
  onRefine: (lookId: string, direction: RefinementDirection) => Promise<void>
  userCredits: number
  isProcessing?: boolean
}

/**
 * RefinementModal - "Kicsit finomítsuk" micro-upsell
 *
 * Allows users to refine a single look with simple adjustments:
 * - Természetesebb (more natural)
 * - Határozottabb (more defined/bold)
 *
 * Costs 1 credit per refinement.
 */
export function RefinementModal({
  isOpen,
  onClose,
  lookId,
  lookTitle,
  onRefine,
  userCredits,
  isProcessing = false,
}: RefinementModalProps) {
  const [selectedDirection, setSelectedDirection] =
    React.useState<RefinementDirection | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleRefine = async () => {
    if (!selectedDirection) return

    setError(null)

    try {
      await onRefine(lookId, selectedDirection)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba történt.")
    }
  }

  const hasEnoughCredits = userCredits >= 1

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Kicsit finomítsuk
          </DialogTitle>
          <DialogDescription>
            Finomítsd a <strong>{lookTitle}</strong> look-ot az igényeid szerint.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Direction selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedDirection("termeszetesebb")}
              disabled={isProcessing}
              className={cn(
                "flex flex-col items-center gap-2 rounded-[14px] p-4 transition-all",
                selectedDirection === "termeszetesebb"
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                  : "bg-secondary/50 text-foreground hover:bg-secondary/80"
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  selectedDirection === "termeszetesebb"
                    ? "bg-primary-foreground/20"
                    : "bg-primary/10"
                )}
              >
                <Feather
                  className={cn(
                    "h-6 w-6",
                    selectedDirection === "termeszetesebb"
                      ? "text-primary-foreground"
                      : "text-primary"
                  )}
                />
              </div>
              <span className="font-medium">Természetesebb</span>
              <span
                className={cn(
                  "text-xs text-center",
                  selectedDirection === "termeszetesebb"
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground"
                )}
              >
                Visszafogottabb, lágyabb megjelenés
              </span>
            </button>

            <button
              onClick={() => setSelectedDirection("hatarozottabb")}
              disabled={isProcessing}
              className={cn(
                "flex flex-col items-center gap-2 rounded-[14px] p-4 transition-all",
                selectedDirection === "hatarozottabb"
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                  : "bg-secondary/50 text-foreground hover:bg-secondary/80"
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  selectedDirection === "hatarozottabb"
                    ? "bg-primary-foreground/20"
                    : "bg-primary/10"
                )}
              >
                <Zap
                  className={cn(
                    "h-6 w-6",
                    selectedDirection === "hatarozottabb"
                      ? "text-primary-foreground"
                      : "text-primary"
                  )}
                />
              </div>
              <span className="font-medium">Határozottabb</span>
              <span
                className={cn(
                  "text-xs text-center",
                  selectedDirection === "hatarozottabb"
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground"
                )}
              >
                Hangsúlyosabb, kifejezőbb megjelenés
              </span>
            </button>
          </div>

          {/* Credit info */}
          <GlassCard variant="subtle" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Finomítás költsége</span>
              </div>
              <span className="text-sm font-bold text-primary">1 kredit</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Jelenlegi egyenleged</span>
              <span
                className={cn(
                  "font-medium",
                  hasEnoughCredits ? "text-foreground" : "text-destructive"
                )}
              >
                {userCredits} kredit
              </span>
            </div>
          </GlassCard>

          {/* Error message */}
          {error && (
            <div className="rounded-[14px] border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Not enough credits warning */}
          {!hasEnoughCredits && (
            <div className="rounded-[14px] border border-amber-500/30 bg-amber-500/5 p-3">
              <p className="text-sm text-amber-600">
                Nincs elegendő kredited. Vásárolj kreditet a finomításhoz.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Mégse
          </Button>
          <Button
            onClick={handleRefine}
            disabled={!selectedDirection || !hasEnoughCredits || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finomítás...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Finomítás (1 kredit)
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Get prompt modifier for refinement direction
 */
export function getRefinementPromptModifier(
  direction: RefinementDirection,
  originalLook: { title: string; steps: string[]; why: string }
): string {
  const baseContext = `
Original look: ${originalLook.title}
Original description: ${originalLook.why}
Original steps: ${originalLook.steps.join("; ")}
`

  if (direction === "termeszetesebb") {
    return `
${baseContext}

REFINEMENT REQUEST: Make this look MORE NATURAL (Természetesebb)

Modifications to apply:
- Reduce color intensity by 20-30%
- Use lighter, more sheer product formulas
- Minimize contouring and highlighting
- Soften any harsh lines or edges
- Replace dramatic elements with subtle alternatives
- Focus on "no-makeup makeup" aesthetic
- Keep skin looking fresh and dewy rather than matte
- Use nude/MLBB shades for lips
- Minimize eye shadow intensity
- Keep mascara to 1-2 coats maximum

The result should look effortless and natural while still enhancing features.
`
  }

  return `
${baseContext}

REFINEMENT REQUEST: Make this look MORE DEFINED/BOLD (Határozottabb)

Modifications to apply:
- Increase color saturation and depth
- Add more definition to eye makeup
- Enhance contouring for more sculpted look
- Add bolder lip color (deeper shade)
- Include more dramatic lash enhancement
- Define brows more precisely
- Add strategic highlighting for dimension
- Consider adding eyeliner or intensifying existing liner
- Use richer, more pigmented products
- Increase overall makeup intensity by 20-30%

The result should be more impactful and statement-making while remaining harmonious.
`
}
