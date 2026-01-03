"use client"

import { useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sparkles, ArrowRight, Lightbulb } from "lucide-react"
import Link from "next/link"

// Static demo data - no AI needed
const SKIN_TONES = [
  { value: "light", label: "Világos" },
  { value: "light-medium", label: "Világos-közepes" },
  { value: "medium", label: "Közepes" },
  { value: "medium-deep", label: "Közepes-mély" },
  { value: "deep", label: "Mély" },
]

const OCCASIONS = [
  { value: "everyday", label: "Hétköznapi" },
  { value: "work", label: "Munkahelyi" },
  { value: "evening", label: "Esti" },
  { value: "special", label: "Különleges alkalom" },
]

// Demo recommendations (no AI)
const DEMO_RECOMMENDATIONS: Record<string, Record<string, { direction: string; tips: string[] }>> = {
  light: {
    everyday: {
      direction: "Természetes ragyogás",
      tips: [
        "Könnyű, áttetsző alapozó a bőr textúrájának megőrzéséhez",
        "Halvány rózsaszín vagy barack pirosító a friss hatásért",
        "Barna mascara a lágyabb tekintetért",
      ],
    },
    work: {
      direction: "Kifinomult professzionalizmus",
      tips: [
        "Matt alapozó egyenletes fedéssel",
        "Semleges szemhéjpúder árnyalatok",
        "Nude vagy halvány rózsaszín ajakszín",
      ],
    },
    evening: {
      direction: "Elegáns csillogás",
      tips: [
        "Világosító primer a ragyogó bőrért",
        "Arany vagy pezsgő highlighter",
        "Drámai szempilla a hangsúlyos tekintetért",
      ],
    },
    special: {
      direction: "Ünnepi fényesség",
      tips: [
        "HD alapozó tökéletes fedéssel",
        "Csillogó szemhéjpúder a belső szemzugban",
        "Tartós ajakrúzs élénk színben",
      ],
    },
  },
  "light-medium": {
    everyday: {
      direction: "Meleg természetesség",
      tips: [
        "BB krém vagy tinted moisturizer",
        "Barack tónusú pirosító",
        "Áttetsző ajakfény",
      ],
    },
    work: {
      direction: "Visszafogott elegancia",
      tips: [
        "Félig matt alapozó",
        "Taupe szemhéjpúder a kontúrhoz",
        "MLBB (My Lips But Better) ajakszín",
      ],
    },
    evening: {
      direction: "Meleg arany ragyogás",
      tips: [
        "Bronzosító a meleg árnyalatokhoz",
        "Arany-bronz smoky eye",
        "Berry vagy szilva ajakszín",
      ],
    },
    special: {
      direction: "Napfényes ünnep",
      tips: [
        "Világosító alapozó meleg alaptónussal",
        "Csillogó highlighter az arccsonton",
        "Korall vagy narancs ajakszín",
      ],
    },
  },
  medium: {
    everyday: {
      direction: "Friss egyensúly",
      tips: [
        "Közepes fedésű alapozó",
        "Korall pirosító",
        "Nude-barna ajakszín",
      ],
    },
    work: {
      direction: "Professzionális harmónia",
      tips: [
        "Mattító primer az olajos zónákra",
        "Meleg barna szemhéjpúder",
        "Természetes rózsaszín ajkak",
      ],
    },
    evening: {
      direction: "Drámai mélység",
      tips: [
        "Ragyogó finish alapozó",
        "Réz és bronz szemárnyalatok",
        "Mély bordó ajakszín",
      ],
    },
    special: {
      direction: "Ünnepélyes ragyogás",
      tips: [
        "Full coverage alapozó",
        "Arany és barna smoky eye",
        "Fémes ajakszín",
      ],
    },
  },
  "medium-deep": {
    everyday: {
      direction: "Természetes melegség",
      tips: [
        "Hidratáló alapozó meleg alaptónussal",
        "Terrakotta pirosító",
        "Karamell ajakfény",
      ],
    },
    work: {
      direction: "Kiegyensúlyozott professzionalizmus",
      tips: [
        "Selyemfényű alapozó",
        "Meleg taupe és barna árnyalatok",
        "Púderrózsaszín ajakszín",
      ],
    },
    evening: {
      direction: "Gazdag ragyogás",
      tips: [
        "Highlighter meleg arany tónusban",
        "Mély szilva és arany szemek",
        "Vörösesbarna ajakszín",
      ],
    },
    special: {
      direction: "Luxus fényesség",
      tips: [
        "Bársonyos finish alapozó",
        "Csillogó bronz és réz szemhéjpúder",
        "Fényes berry ajakszín",
      ],
    },
  },
  deep: {
    everyday: {
      direction: "Ragyogó természetesség",
      tips: [
        "Nedves hatású alapozó gazdag pigmentációval",
        "Narancsos-barna pirosító",
        "Csokoládé ajakfény",
      ],
    },
    work: {
      direction: "Magabiztos elegancia",
      tips: [
        "Matt alapozó mély tónusokban",
        "Réz és arany szemhéjpúder",
        "Barna-nude ajakszín",
      ],
    },
    evening: {
      direction: "Királyi ragyogás",
      tips: [
        "Arany highlighter intenzív ragyogással",
        "Kék-arany duochrome szemhéjpúder",
        "Mély bordó vagy szilva ajakszín",
      ],
    },
    special: {
      direction: "Drámai fényesség",
      tips: [
        "Full coverage alapozó tökéletes finish-sel",
        "Fémes zöld vagy kék szemhéjpúder",
        "Fényes piros ajakszín",
      ],
    },
  },
}

export function QuickPreview() {
  const [skinTone, setSkinTone] = useState<string>("")
  const [occasion, setOccasion] = useState<string>("")
  const [showResult, setShowResult] = useState(false)

  const handleGetPreview = () => {
    if (skinTone && occasion) {
      setShowResult(true)
    }
  }

  const recommendation = skinTone && occasion
    ? DEMO_RECOMMENDATIONS[skinTone]?.[occasion]
    : null

  const handleReset = () => {
    setShowResult(false)
    setSkinTone("")
    setOccasion("")
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium tracking-wide text-primary">
              Gyors preview
            </span>
          </div>
          <h2 className="mb-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            Ismerje meg a sminkstílusát
          </h2>
          <p className="text-muted-foreground">
            Két egyszerű kérdés alapján adunk egy gyors irányt — fotó nélkül.
          </p>
        </div>

        <GlassCard variant="elevated" className="mx-auto max-w-xl">
          {!showResult ? (
            <div className="space-y-6">
              {/* Skin tone selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Bőrtónus
                </label>
                <Select value={skinTone} onValueChange={setSkinTone}>
                  <SelectTrigger className="h-12 rounded-[14px] border-border/50 bg-background/50">
                    <SelectValue placeholder="Válassza ki bőrtónusát" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[14px]">
                    {SKIN_TONES.map((tone) => (
                      <SelectItem
                        key={tone.value}
                        value={tone.value}
                        className="rounded-[10px]"
                      >
                        {tone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Occasion selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Alkalom
                </label>
                <Select value={occasion} onValueChange={setOccasion}>
                  <SelectTrigger className="h-12 rounded-[14px] border-border/50 bg-background/50">
                    <SelectValue placeholder="Milyen alkalomra készül?" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[14px]">
                    {OCCASIONS.map((occ) => (
                      <SelectItem
                        key={occ.value}
                        value={occ.value}
                        className="rounded-[10px]"
                      >
                        {occ.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit button */}
              <Button
                size="lg"
                className="h-14 w-full rounded-[14px] text-base font-medium"
                onClick={handleGetPreview}
                disabled={!skinTone || !occasion}
              >
                Iránymutató kérése
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Result */}
              {recommendation && (
                <>
                  <div className="text-center">
                    <p className="text-sm font-medium text-primary">
                      Az Ön iránya
                    </p>
                    <h3 className="mt-1 text-2xl font-medium tracking-tight text-foreground">
                      {recommendation.direction}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      <span>Gyors tippek</span>
                    </div>
                    <ul className="space-y-2">
                      {recommendation.tips.map((tip, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-sm text-muted-foreground"
                        >
                          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            {index + 1}
                          </span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="divider-elegant" />

                  <div className="space-y-3">
                    <p className="text-center text-sm text-muted-foreground">
                      Szeretne személyre szabott, AI-alapú elemzést a saját fotója alapján?
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        variant="outline"
                        className="h-12 flex-1 rounded-[14px]"
                        onClick={handleReset}
                      >
                        Újrakezdés
                      </Button>
                      <Button
                        asChild
                        className="h-12 flex-1 rounded-[14px]"
                      >
                        <Link href="/ai-sminkajanlo">
                          AI Sminkajánló
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </section>
  )
}
