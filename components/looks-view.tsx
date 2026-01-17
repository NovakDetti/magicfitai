"use client"

import * as React from "react"
import Image from "next/image"
import {
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Sparkles,
  ListOrdered,
  ShoppingBag,
  RefreshCw,
} from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { BeforeAfterSlider } from "@/components/ui/before-after-slider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { MakeupLook } from "@/lib/db/schema"
import { useLanguage } from "@/components/language-provider"

/**
 * Example data structure for looks:
 * [
 *   {
 *     id: "look-1",
 *     title: "Nappali",
 *     why: "Friss, természetes megjelenés a hétköznapokra. Kiemeli az arcvonásaid anélkül, hogy túl erős lenne.",
 *     steps: [
 *       "Hidratáld a bőröd könnyű hidratálóval",
 *       "Vidd fel a BB krémet vagy könnyű alapozót",
 *       "Használj korrektort a szem alatti karikákra",
 *       "Púderezd át könnyedén a T-zónát",
 *       "Vigyél fel barack tónusú pirosítót az arccsontokra",
 *       "Fésüld át és fixáld a szemöldököt géllel",
 *       "Használj szempillaspirált a felső szempillákon"
 *     ],
 *     products: {
 *       base: ["Hidratáló alapozó", "Korrektor"],
 *       eyes: ["Barna szemceruza", "Szempillaspirál"],
 *       brows: ["Szemöldökgél"],
 *       lips: ["Ajakbalzsam színezett változatban"],
 *       face: ["Pirosító", "Highlighter"]
 *     },
 *     afterImageUrl: "https://..."
 *   },
 *   ...
 * ]
 */

type LookType = "nappali" | "elegans" | "esti"

interface LooksViewProps {
  looks: MakeupLook[]
  beforeImageUrl: string
  className?: string
  onRefineLook?: (lookId: string) => void
  canRefine?: boolean
}

export function LooksView({
  looks,
  beforeImageUrl,
  className,
  onRefineLook,
  canRefine = false,
}: LooksViewProps) {
  const { language } = useLanguage()
  const t = (hu: string, en: string) => (language === "hu" ? hu : en)
  const lookConfig = language === "hu"
    ? {
        nappali: {
          icon: Sun,
          label: "Nappali",
          description: "Friss, természetes megjelenés",
          color: "bg-amber-500/10 text-amber-600",
        },
        elegans: {
          icon: Sparkles,
          label: "Elegáns",
          description: "Kifinomult, profi megjelenés",
          color: "bg-primary/10 text-primary",
        },
        esti: {
          icon: Moon,
          label: "Alkalmi / Esti",
          description: "Különleges alkalmakra",
          color: "bg-purple-500/10 text-purple-600",
        },
      }
    : {
        nappali: {
          icon: Sun,
          label: "Daytime",
          description: "Fresh, natural look",
          color: "bg-amber-500/10 text-amber-600",
        },
        elegans: {
          icon: Sparkles,
          label: "Elegant",
          description: "Refined, professional look",
          color: "bg-primary/10 text-primary",
        },
        esti: {
          icon: Moon,
          label: "Evening",
          description: "For special occasions",
          color: "bg-purple-500/10 text-purple-600",
        },
      }
  const [activeTab, setActiveTab] = React.useState(0)
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({})

  // Map look index to look type
  const getLookType = (index: number): LookType => {
    const types: LookType[] = ["nappali", "elegans", "esti"]
    return types[index] || "nappali"
  }

  const toggleSection = (lookId: string, section: "steps" | "products") => {
    const key = `${lookId}-${section}`
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const activeLook = looks[activeTab]
  const lookType = getLookType(activeTab)
  const config = lookConfig[lookType]

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-medium text-foreground">
            {t("Személyre szabott look-ok", "Personalized looks")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("3 egyedi javaslat különböző alkalmakra", "3 unique suggestions for different occasions")}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {looks.map((look, index) => {
          const type = getLookType(index)
          const cfg = lookConfig[type]
          const Icon = cfg.icon
          const isActive = index === activeTab

          return (
            <button
              key={look.id}
              onClick={() => setActiveTab(index)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary/80"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{cfg.label}</span>
            </button>
          )
        })}
      </div>

      {/* Active Look Content */}
      {activeLook && (
        <GlassCard variant="elevated" className="overflow-hidden">
          {/* Look Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", config.color)}>
              <config.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-foreground">{activeLook.title}</h3>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
            {canRefine && onRefineLook && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRefineLook(activeLook.id)}
                className="shrink-0"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                {t("Finomítás", "Refine")}
              </Button>
            )}
          </div>

          {/* Before/After Comparison */}
          <div className="mb-6">
            {activeLook.afterImageUrl ? (
              <BeforeAfterSlider
                beforeImage={beforeImageUrl}
                afterImage={activeLook.afterImageUrl}
                aspectRatio="portrait"
                initialPosition={["nappali", "elegans"].includes(lookType) ? 65 : 50}
                afterImageClassName={
                  ["nappali", "elegans"].includes(lookType)
                    ? "contrast-[1.05] saturate-[1.05]"
                    : undefined
                }
              />
            ) : (
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-secondary/30">
                <Image
                  src={beforeImageUrl}
                  alt={t("Eredeti kép", "Original image")}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                  <div className="text-center">
                    <Sparkles className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {t("AI kép generálás folyamatban...", "AI image generation in progress...")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-sm text-foreground leading-relaxed">
              {activeLook.why}
            </p>
          </div>

          {/* Steps Accordion */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection(activeLook.id, "steps")}
              className="flex w-full items-center justify-between rounded-xl bg-secondary/30 p-4 text-left transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <ListOrdered className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-medium text-foreground">Smink lépések</span>
                  <p className="text-xs text-muted-foreground">
                    {t(
                      `${activeLook.steps.length} lépés a tökéletes megjelenéshez`,
                      `${activeLook.steps.length} steps to the perfect look`
                    )}
                  </p>
                </div>
              </div>
              {expandedSections[`${activeLook.id}-steps`] ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {expandedSections[`${activeLook.id}-steps`] && (
              <div className="rounded-xl bg-secondary/20 p-4 ml-4">
                <ol className="space-y-3">
                  {activeLook.steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
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
              onClick={() => toggleSection(activeLook.id, "products")}
              className="flex w-full items-center justify-between rounded-xl bg-secondary/30 p-4 text-left transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-medium text-foreground">Szükséges termékek</span>
                  <p className="text-xs text-muted-foreground">
                    {t("Terméktípusok kategóriánként", "Product types by category")}
                  </p>
                </div>
              </div>
              {expandedSections[`${activeLook.id}-products`] ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {expandedSections[`${activeLook.id}-products`] && (
              <div className="rounded-xl bg-secondary/20 p-4 ml-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ProductCategory
                    title={t("Alap", "Base")}
                    items={activeLook.products.base}
                  />
                  <ProductCategory
                    title={t("Szemek", "Eyes")}
                    items={activeLook.products.eyes}
                  />
                  <ProductCategory
                    title={t("Szemöldök", "Brows")}
                    items={activeLook.products.brows}
                  />
                  <ProductCategory
                    title={t("Ajkak", "Lips")}
                    items={activeLook.products.lips}
                  />
                  <ProductCategory
                    title={t("Arc", "Face")}
                    items={activeLook.products.face}
                  />
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Quick Navigation Cards (Mobile) */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        {looks.map((look, index) => {
          const type = getLookType(index)
          const cfg = lookConfig[type]
          const Icon = cfg.icon
          const isActive = index === activeTab

          return (
            <button
              key={look.id}
              onClick={() => setActiveTab(index)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl p-3 transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{cfg.label}</span>
            </button>
          )
        })}
      </div>
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
      <p className="text-xs font-medium uppercase text-muted-foreground mb-2">
        {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span className="text-primary mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Export example data structure for documentation
export const exampleLooks: MakeupLook[] = [
  {
    id: "look-nappali",
    title: "Nappali",
    why: "Friss, természetes megjelenés a hétköznapokra. Kiemeli az arcvonásaid anélkül, hogy túl erős lenne. A könnyű textúrák és természetes színek harmonizálnak a bőrtónusoddal.",
    steps: [
      "Hidratáld a bőröd könnyű hidratálóval",
      "Vidd fel a BB krémet vagy könnyű alapozót egyenletesen",
      "Használj korrektort a szem alatti karikákra",
      "Púderezd át könnyedén a T-zónát mattító púderrel",
      "Vigyél fel barack tónusú pirosítót az arccsontokra",
      "Fésüld át és fixáld a szemöldököt átlátszó géllel",
      "Használj szempillaspirált a felső szempillákon",
    ],
    products: {
      base: ["Hidratáló alapozó", "Világos korrektor"],
      eyes: ["Barna szemceruza", "Lengébb szempillaspirál"],
      brows: ["Átlátszó szemöldökgél"],
      lips: ["Színezett ajakbalzsam"],
      face: ["Krémes pirosító", "Finom highlighter"],
    },
  },
  {
    id: "look-elegans",
    title: "Elegáns",
    why: "Kifinomult, professzionális megjelenés irodai környezetbe vagy fontos találkozókra. A visszafogott, de igényes smink magabiztosságot sugároz.",
    steps: [
      "Használj fényvédős primer-t az alapozás előtt",
      "Vidd fel a közepes fedésű alapozót szivacssal",
      "Kontúrozd finoman az arcformát bronzosítóval",
      "Emelj ki a magas pontokat highlighterrel",
      "Készíts finom füstös szemet semleges árnyalatokkal",
      "Húzz vékony szemhéjtust a felső pillavonalon",
      "Használj tartós, matt ajakrúzst visszafogott színben",
    ],
    products: {
      base: ["Közepes fedésű alapozó", "Púder"],
      eyes: ["Szemhéjpúder paletta", "Szemhéjtus", "Dúsító szempillaspirál"],
      brows: ["Szemöldökceruza", "Fixáló gél"],
      lips: ["Matt ajakrúzs nude árnyalatban"],
      face: ["Bronzosító", "Highlighter", "Pirosító"],
    },
  },
  {
    id: "look-esti",
    title: "Alkalmi / Esti",
    why: "Különleges alkalmakra készült drámai, de ízléses megjelenés. A hangsúlyos elemek kiemelik az egyéniségedet, miközben összhangban maradnak az arcvonásaiddal.",
    steps: [
      "Készítsd elő a bőrt primer-rel és hidratálóval",
      "Használj teljes fedésű, tartós alapozót",
      "Készíts intenzív füstös szemet sötétebb árnyalatokkal",
      "Ragassz fel műszempillákat vagy használj több réteg szempillaspirált",
      "Emeld ki az arccsontokat erőteljes highlighterrel",
      "Válassz merész ajakszínt - vörös vagy mély árnyalat",
      "Fixáld a sminket tartós spray-vel",
    ],
    products: {
      base: ["Teljes fedésű alapozó", "Korrektor", "Setting púder"],
      eyes: ["Füstös szemhéjpúder paletta", "Fekete szemceruza", "Műszempilla vagy dúsító spirál"],
      brows: ["Szemöldökceruza", "Szemöldökpomádé"],
      lips: ["Tartós folyékony rúzs élénk színben"],
      face: ["Kontúr paletta", "Highlighter", "Tartós pirosító"],
    },
  },
]
