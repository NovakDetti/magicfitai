"use client"

import { useState } from "react"
import Image from "next/image"
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Sparkles,
  ShoppingBag,
  ListOrdered,
} from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"
import type { AnalysisObservations, MakeupLook } from "@/lib/db/schema"
import { useLanguage } from "@/components/language-provider"

interface ResultsViewProps {
  observations: AnalysisObservations
  looks: MakeupLook[]
  beforeImageUrl?: string | null
  className?: string
}

export function ResultsView({
  observations,
  looks,
  beforeImageUrl,
  className,
}: ResultsViewProps) {
  const { language } = useLanguage()
  const t = (hu: string, en: string) => (language === "hu" ? hu : en)
  const [expandedLooks, setExpandedLooks] = useState<Record<string, boolean>>({})
  const [showSteps, setShowSteps] = useState<Record<string, boolean>>({})
  const [showProducts, setShowProducts] = useState<Record<string, boolean>>({})
  const [viewMode, setViewMode] = useState<Record<string, "before" | "after">>({})

  const toggleExpanded = (lookId: string) => {
    setExpandedLooks((prev) => ({ ...prev, [lookId]: !prev[lookId] }))
  }

  const toggleSteps = (lookId: string) => {
    setShowSteps((prev) => ({ ...prev, [lookId]: !prev[lookId] }))
  }

  const toggleProducts = (lookId: string) => {
    setShowProducts((prev) => ({ ...prev, [lookId]: !prev[lookId] }))
  }

  const toggleView = (lookId: string) => {
    setViewMode((prev) => ({
      ...prev,
      [lookId]: prev[lookId] === "after" ? "before" : "after",
    }))
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Observations Section */}
      <GlassCard variant="elevated">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-medium text-foreground">
            {t("Mit vettünk észre a képen?", "What did we notice in the photo?")}
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ObservationItem label="Arcforma" value={observations.faceShape} />
          <ObservationItem label="Bőrtónus" value={observations.skinTone} />
          <ObservationItem label="Alaptónus" value={observations.undertone} />
          <ObservationItem label="Kontraszt" value={observations.contrast} />
          <ObservationItem label="Szemforma" value={observations.eyeShape} />
          <ObservationItem label="Szemöldök" value={observations.brows} />
          <ObservationItem label="Ajkak" value={observations.lips} />
        </div>

        {observations.notes && (
          <div className="mt-4 rounded-xl bg-secondary/30 p-4">
            <p className="text-sm italic text-muted-foreground">
              {observations.notes}
            </p>
          </div>
        )}
      </GlassCard>

      {/* Looks Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-medium text-foreground">
            {t("Személyre szabott look-ok", "Personalized looks")}
          </h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {looks.map((look, index) => (
          <GlassCard key={look.id} className="flex flex-col">
            {/* Image with before/after toggle */}
            <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-xl bg-secondary/30">
              {beforeImageUrl && (
                <Image
                  src={
                    viewMode[look.id] === "after" && look.afterImageUrl
                      ? look.afterImageUrl
                      : beforeImageUrl
                  }
                  alt={
                    viewMode[look.id] === "after"
                      ? `${look.title} - ${t("Utána", "After")}`
                      : t("Előtte", "Before")
                  }
                  fill
                  className={cn(
                    "object-cover",
                    viewMode[look.id] === "after" &&
                      look.afterImageUrl &&
                      (index === 0 || index === 1)
                      ? "contrast-[1.18] saturate-[1.12]"
                      : null
                  )}
                />
              )}

              {/* Before/After toggle */}
              {look.afterImageUrl && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                  <div className="flex rounded-full bg-background/80 p-1 backdrop-blur-sm">
                    <button
                      onClick={() =>
                        setViewMode((prev) => ({
                          ...prev,
                          [look.id]: "before",
                        }))
                      }
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                        viewMode[look.id] !== "after"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t("Előtte", "Before")}
                    </button>
                    <button
                      onClick={() =>
                        setViewMode((prev) => ({
                          ...prev,
                          [look.id]: "after",
                        }))
                      }
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                        viewMode[look.id] === "after"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t("Utána", "After")}
                    </button>
                  </div>
                </div>
              )}

              {/* AI Preview badge if no after image */}
              {!look.afterImageUrl && (
                <div className="absolute top-2 right-2">
                  <span className="rounded-full bg-secondary/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm">
                    {t("Előtte kép", "Before image")}
                  </span>
                </div>
              )}

              {/* Look number badge */}
              <div className="absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {index + 1}
              </div>
            </div>

            {/* Look info */}
            <h3 className="mb-2 text-lg font-medium text-foreground">
              {look.title}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
              {look.why}
            </p>

            {/* Steps accordion */}
            <div className="space-y-2 mt-auto">
              <button
                onClick={() => toggleSteps(look.id)}
                className="flex w-full items-center justify-between rounded-xl bg-secondary/30 p-3 text-left transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-2">
                  <ListOrdered className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{t("Smink lépések", "Makeup steps")}</span>
                </div>
                {showSteps[look.id] ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {showSteps[look.id] && (
                <div className="rounded-xl bg-secondary/20 p-4">
                  <ol className="space-y-2 text-sm">
                    {look.steps.map((step, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="shrink-0 text-primary">{i + 1}.</span>
                        <span className="text-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Products accordion */}
              <button
                onClick={() => toggleProducts(look.id)}
                className="flex w-full items-center justify-between rounded-xl bg-secondary/30 p-3 text-left transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{t("Terméklista", "Product list")}</span>
                </div>
                {showProducts[look.id] ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {showProducts[look.id] && (
                <div className="rounded-xl bg-secondary/20 p-4 space-y-3">
                  {Object.entries(look.products).map(
                    ([category, items]: [string, string[]]) =>
                      items.length > 0 && (
                        <div key={category}>
                          <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                            {category === "base"
                              ? t("Alap", "Base")
                              : category === "eyes"
                              ? t("Szemek", "Eyes")
                              : category === "brows"
                              ? t("Szemöldök", "Brows")
                              : category === "lips"
                              ? t("Ajkak", "Lips")
                              : t("Arc", "Face")}
                          </p>
                          <ul className="space-y-1">
                            {items.map((item, i) => (
                              <li key={i} className="text-sm text-foreground">
                                • {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}

function ObservationItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-secondary/30 p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
