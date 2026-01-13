"use client"

import * as React from "react"
import Link from "next/link"
import {
  ChevronDown,
  ChevronUp,
  Download,
  Sparkles,
  ListOrdered,
  ShoppingBag,
  Info,
  Droplets,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { BeforeAfterSlider } from "@/components/ui/before-after-slider"
import { cn } from "@/lib/utils"
import type { AnalysisObservations, MakeupLook } from "@/lib/db/schema"
import type { SkinConditionAnalysis } from "@/lib/gemini"
import { useLanguage } from "@/components/language-provider"

interface SignatureLookResultsProps {
  sessionId: string
  observations: AnalysisObservations
  look: MakeupLook
  beforeImageUrl: string
  isLoggedIn?: boolean
  onNewAnalysis?: () => void
  skinAnalysis?: SkinConditionAnalysis | null
  className?: string
}

/**
 * SignatureLookResults - Premium single-look results page
 *
 * Features:
 * - Hero Before/After slider
 * - Condensed observations (4 key points)
 * - Single "Signature Look" with steps & products
 * - Clean, minimal design
 */
export function SignatureLookResults({
  sessionId,
  observations,
  look,
  beforeImageUrl,
  isLoggedIn = false,
  onNewAnalysis,
  skinAnalysis,
  className,
}: SignatureLookResultsProps) {
  const { language } = useLanguage()
  const t = (hu: string, en: string) => (language === "hu" ? hu : en)
  const [showSteps, setShowSteps] = React.useState(false)
  const [showProducts, setShowProducts] = React.useState(false)
  const [showPrepTips, setShowPrepTips] = React.useState(false)

  const handleDownloadImage = () => {
    // Download AI image if available, otherwise the original
    const imageUrl = look.afterImageUrl || beforeImageUrl
    if (imageUrl) {
      window.open(imageUrl, "_blank")
    }
  }

  return (
    <div className={cn("space-y-12", className)}>
      {/* Hero Section - Title */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#B78C86]/10 px-4 py-2">
          <Sparkles className="h-4 w-4 text-[#B78C86]" />
          <span className="text-sm font-medium text-[#B78C86]">
            {t("Eredmény", "Result")}
          </span>
        </div>
        <h1 className="mb-3 text-3xl font-light tracking-tight text-foreground md:text-4xl">
          {t("Az Ön személyes smink-ajánlása", "Your personal makeup recommendation")}
        </h1>
        <p className="mx-auto max-w-xl text-base text-muted-foreground">
          {t(
            "Egyetlen, kifejezetten Önre hangolt megjelenés — a fotó és a válaszok alapján.",
            "A single look tailored to you — based on your photo and answers."
          )}
        </p>
      </div>

      {/* Hero Image Section */}
      <div className="mx-auto max-w-2xl">
        {look.afterImageUrl ? (
          /* Before/After slider if AI image is available */
          <div className="relative">
            <BeforeAfterSlider
              beforeImage={beforeImageUrl}
              afterImage={look.afterImageUrl}
              beforeLabel={t("Előtte", "Before")}
              afterLabel={t("Utána", "After")}
              aspectRatio="portrait"
              className="shadow-2xl shadow-black/10"
            />
            {/* AI Preview badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur-sm">
                AI preview
              </span>
            </div>
          </div>
        ) : (
          /* Show original photo with elegant frame when no AI image */
          <div className="relative">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary/10 shadow-2xl shadow-black/10">
              <img
                src={beforeImageUrl}
                alt={t("Feltöltött fotó", "Uploaded photo")}
                className="h-full w-full object-cover"
              />
              {/* Subtle overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
            {/* Label badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur-sm">
                {t("Az Ön fotója", "Your photo")}
              </span>
            </div>
          </div>
        )}

        {/* Download buttons */}
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={handleDownloadImage}>
            <Download className="mr-2 h-4 w-4" />
            {t("Kép letöltése", "Download image")}
          </Button>
        </div>
      </div>

      {/* Observations - Condensed 4 key points */}
      <div className="mx-auto max-w-2xl">
        <GlassCard variant="subtle" className="p-6 md:p-8">
          <h2 className="mb-6 text-center text-lg font-medium text-foreground">
            {t("Mit vettünk észre", "What we noticed")}
          </h2>

          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <ObservationPoint
              label={t("Arcforma", "Face shape")}
              value={observations.faceShape}
            />
            <ObservationPoint
              label={t("Bőrtónus / Altónus", "Skin tone / Undertone")}
              value={`${observations.skinTone}, ${observations.undertone}`}
            />
            <ObservationPoint
              label={t("Kontraszt", "Contrast")}
              value={observations.contrast}
            />
            <ObservationPoint
              label={t("Szemek / Szemöldök", "Eyes / Brows")}
              value={`${observations.eyeShape}, ${observations.brows}`}
            />
          </div>

          {/* Disclaimer */}
          <div className="mt-6 flex items-center justify-center gap-2 text-center">
            <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
            <p className="text-xs text-muted-foreground/80">
              {t("Ez kozmetikai jellegű megfigyelés, nem orvosi értékelés.", "This is a cosmetic observation, not a medical evaluation.")}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Skin Condition Analysis Section */}
      {skinAnalysis && (
        <div className="mx-auto max-w-2xl">
          <GlassCard variant="subtle" className="p-6 md:p-8">
            {/* Section Header */}
            <div className="mb-6 text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#B78C86]/10 px-3 py-1.5">
                <Droplets className="h-4 w-4 text-[#B78C86]" />
                <span className="text-xs font-medium text-[#B78C86]">
                  {t("Bőrelemzés", "Skin analysis")}
                </span>
              </div>
              <h2 className="mb-3 text-lg font-medium text-foreground">
                {t("Részletes bőrállapot-elemzés", "Detailed skin condition analysis")}
              </h2>
              <p className="text-sm text-muted-foreground/90 leading-relaxed">
                {t(
                  "Az elemzés non-medical jellegű, kizárólag vizuális indikátorokon alapul. Célja a smink eredményének optimalizálása és a bőrelőkészítés finomhangolása.",
                  "This analysis is non-medical and based solely on visual indicators. Its goal is to optimize the makeup result and refine skin preparation."
                )}
              </p>
            </div>

            {/* Skin Indicators Grid */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <SkinIndicator
                label={t("Hidratáltság", "Hydration")}
                level={skinAnalysis.hydration.level}
                description={skinAnalysis.hydration.description}
              />
              <SkinIndicator
                label={t("Bőrfelszín egyenletessége", "Skin surface uniformity")}
                level={skinAnalysis.texture.level}
                description={skinAnalysis.texture.description}
              />
              <SkinIndicator
                label={t("Pórusok láthatósága", "Pore visibility")}
                level={skinAnalysis.pores.level}
                description={skinAnalysis.pores.description}
              />
              <SkinIndicator
                label={t("Faggyútermelés / fénylés", "Oiliness / shine")}
                level={skinAnalysis.oiliness.level}
                description={skinAnalysis.oiliness.description}
              />
              <SkinIndicator
                label={t("Pigmentáció és bőrtónus", "Pigmentation and skin tone")}
                level={skinAnalysis.pigmentation.level}
                description={skinAnalysis.pigmentation.description}
              />
              <SkinIndicator
                label={t("Finom vonalak / ráncok", "Fine lines / wrinkles")}
                level={skinAnalysis.fineLines.level}
                description={skinAnalysis.fineLines.description}
              />
              <SkinIndicator
                label="Bőrpír / érzékenység"
                level={skinAnalysis.sensitivity.level}
                description={skinAnalysis.sensitivity.description}
              />
            </div>

            {/* Makeup Implications */}
            {skinAnalysis.makeupImplications && (
              <div className="mb-6 rounded-xl bg-secondary/20 p-4">
                <h4 className="mb-2 text-sm font-medium text-foreground">
                  Mit jelent ez a smink szempontjából?
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {skinAnalysis.makeupImplications}
                </p>
              </div>
            )}

            {/* Prep Tips Accordion */}
            {skinAnalysis.prepTips && skinAnalysis.prepTips.length > 0 && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowPrepTips(!showPrepTips)}
                  className="flex w-full items-center justify-between rounded-xl bg-secondary/30 p-4 text-left transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#B78C86]" />
                    <span className="font-medium text-foreground">
                      Ajánlott bőrelőkészítési fókusz
                    </span>
                  </div>
                  {showPrepTips ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {showPrepTips && (
                  <div className="rounded-xl bg-secondary/20 p-5">
                    <ul className="space-y-2.5">
                      {skinAnalysis.prepTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B78C86]" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-6 flex items-center justify-center gap-2 text-center">
              <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground/80">
                Ez nem orvosi diagnózis. Bőrproblémák esetén forduljon szakemberhez.
              </p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Signature Look Details */}
      <div className="mx-auto max-w-2xl">
        <GlassCard variant="elevated" className="p-6 md:p-8">
          {/* Look Header */}
          <div className="mb-6 text-center">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[#B78C86]">
              Signature Look
            </p>
            <h3 className="text-xl font-medium text-foreground md:text-2xl">
              {look.title}
            </h3>
          </div>

          {/* Why it works */}
          <div className="mb-8">
            <h4 className="mb-3 text-sm font-medium text-foreground">
              {t("Miért működik?", "Why it works")}
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {look.why}
            </p>
          </div>

          {/* Divider */}
          <div className="mb-6 border-t border-border/50" />

          {/* Steps Accordion */}
          <div className="space-y-3">
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="flex w-full items-center justify-between rounded-xl bg-secondary/30 p-4 text-left transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <ListOrdered className="h-5 w-5 text-[#B78C86]" />
                <span className="font-medium text-foreground">{t("Smink lépések", "Makeup steps")}</span>
              </div>
              {showSteps ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {showSteps && (
              <div className="rounded-xl bg-secondary/20 p-5">
                <ol className="space-y-3">
                  {look.steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#B78C86]/10 text-xs font-medium text-[#B78C86]">
                        {i + 1}
                      </span>
                      <span className="text-sm text-foreground pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Products Accordion */}
            <button
              onClick={() => setShowProducts(!showProducts)}
              className="flex w-full items-center justify-between rounded-xl bg-secondary/30 p-4 text-left transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-[#B78C86]" />
                <span className="font-medium text-foreground">{t("Terméktípusok", "Product types")}</span>
              </div>
              {showProducts ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {showProducts && (
              <div className="rounded-xl bg-secondary/20 p-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <ProductCategory title={t("Alap", "Base")} items={look.products.base} />
                  <ProductCategory title={t("Szem", "Eyes")} items={look.products.eyes} />
                  <ProductCategory title={t("Szemöldök", "Brows")} items={look.products.brows} />
                  <ProductCategory title={t("Ajak", "Lips")} items={look.products.lips} />
                  <ProductCategory title={t("Arc", "Face")} items={look.products.face} />
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-md text-center">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {onNewAnalysis ? (
            <Button onClick={onNewAnalysis} className="w-full sm:w-auto">
              {t("Új elemzés", "New analysis")}
            </Button>
          ) : (
            <Link href="/ai-sminkajanlo">
              <Button className="w-full sm:w-auto">{t("Új elemzés", "New analysis")}</Button>
            </Link>
          )}
          {isLoggedIn && (
            <Link href="/eredmenyeim">
              <Button variant="outline" className="w-full sm:w-auto">
                {t("Összes elemzésem", "All my analyses")}
              </Button>
            </Link>
          )}
        </div>

        {!isLoggedIn && (
          <p className="mt-4 text-sm text-muted-foreground">
            {t("Fiókkal az eredmények elmenthetők.", "With an account, results are saved.")}{" "}
            <Link href="/regisztracio" className="text-[#B78C86] hover:underline">
              {t("Regisztráció", "Sign up")}
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

// Observation point component - simplified
function ObservationPoint({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="text-center">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

// Product category component
function ProductCategory({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  if (!items || items.length === 0) return null

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#B78C86]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Skin indicator component
function SkinIndicator({
  label,
  level,
  description,
}: {
  label: string
  level: string
  description: string
}) {
  return (
    <div className="rounded-xl bg-secondary/20 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span className="rounded-full bg-[#B78C86]/10 px-2 py-0.5 text-xs font-medium text-[#B78C86]">
          {level}
        </span>
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
