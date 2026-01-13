"use client"

import { Eye, Info } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"
import type { AnalysisObservations } from "@/lib/db/schema"
import { useLanguage } from "@/components/language-provider"

/**
 * Example JSON structure for observations:
 * {
 *   "faceShape": "Ovális",
 *   "skinTone": "Világos",
 *   "undertone": "Meleg",
 *   "contrast": "Közepes",
 *   "eyeShape": "Mandula alakú",
 *   "brows": "Természetesen ívelt",
 *   "lips": "Közepes telítettségű",
 *   "notes": "Kiegyensúlyozott arcvonások, harmonikus összhatás."
 * }
 */

interface AIObservationsProps {
  observations: AnalysisObservations
  className?: string
  variant?: "default" | "compact"
}

const OBSERVATION_LABELS = {
  hu: {
    faceShape: "Arcforma",
    skinTone: "Bőrtónus",
    undertone: "Altónus",
    contrast: "Kontraszt",
    eyeShape: "Szemek jellege",
    brows: "Szemöldök",
    lips: "Ajkak jellege",
  },
  en: {
    faceShape: "Face shape",
    skinTone: "Skin tone",
    undertone: "Undertone",
    contrast: "Contrast",
    eyeShape: "Eye shape",
    brows: "Brows",
    lips: "Lips",
  },
} as const

// Icons for each observation type (optional visual enhancement)
const OBSERVATION_ICONS: Record<keyof Omit<AnalysisObservations, "notes">, string> = {
  faceShape: "💎",
  skinTone: "🎨",
  undertone: "🌡️",
  contrast: "⚡",
  eyeShape: "👁️",
  brows: "✨",
  lips: "💋",
}

export function AIObservations({
  observations,
  className,
  variant = "default",
}: AIObservationsProps) {
  const { language } = useLanguage()
  const t = (hu: string, en: string) => (language === "hu" ? hu : en)
  const fields = Object.entries(OBSERVATION_LABELS[language]) as [
    keyof Omit<AnalysisObservations, "notes">,
    string
  ][]

  return (
    <GlassCard variant="elevated" className={cn("relative", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Eye className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-medium text-foreground">
            {t("Mit látott az AI?", "What did the AI see?")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("Személyre szabott megfigyelések", "Personalized observations")}
          </p>
        </div>
      </div>

      {/* Observations Grid */}
      <div
        className={cn(
          "grid gap-3",
          variant === "compact"
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
        )}
      >
        {fields.map(([key, label]) => {
          const value = observations[key]
          if (!value) return null

          return (
            <ObservationItem
              key={key}
              label={label}
              value={value}
              icon={OBSERVATION_ICONS[key]}
              compact={variant === "compact"}
            />
          )
        })}
      </div>

      {/* Notes Section */}
      {observations.notes && (
        <div className="mt-4 rounded-xl bg-secondary/30 p-4">
          <p className="text-sm italic text-muted-foreground">
            &ldquo;{observations.notes}&rdquo;
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 flex items-start gap-2 rounded-xl bg-secondary/20 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          {t(
            "Ez egy kozmetikai jellegű megfigyelés, nem orvosi értékelés. Az AI által meghatározott jellemzők csak tájékoztató jellegűek, és a személyre szabott sminkjavaslatok alapjául szolgálnak.",
            "This is a cosmetic observation, not a medical evaluation. AI-detected characteristics are informational and form the basis of personalized makeup recommendations."
          )}
        </p>
      </div>
    </GlassCard>
  )
}

// Individual observation item component
function ObservationItem({
  label,
  value,
  icon,
  compact = false,
}: {
  label: string
  value: string
  icon?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-xl bg-secondary/30 transition-colors hover:bg-secondary/40",
        compact ? "p-2.5" : "p-3"
      )}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {icon && <span className="text-xs">{icon}</span>}
        <p
          className={cn(
            "font-medium uppercase text-muted-foreground",
            compact ? "text-[10px]" : "text-xs"
          )}
        >
          {label}
        </p>
      </div>
      <p
        className={cn(
          "font-medium text-foreground",
          compact ? "text-xs" : "text-sm"
        )}
      >
        {value}
      </p>
    </div>
  )
}

// Export example data structure for documentation
export const exampleObservations: AnalysisObservations = {
  faceShape: "Ovális",
  skinTone: "Világos",
  undertone: "Meleg",
  contrast: "Közepes",
  eyeShape: "Mandula alakú",
  brows: "Természetesen ívelt",
  lips: "Közepes telítettségű",
  notes: "Kiegyensúlyozott arcvonások, harmonikus összhatás.",
}
