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
import { Sparkles, ArrowRight, Lightbulb, Eye, Palette, Sun } from "lucide-react"
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
  { value: "everyday", label: "Hétköznapi", icon: Sun },
  { value: "work", label: "Munkahelyi", icon: Eye },
  { value: "evening", label: "Esti", icon: Sparkles },
  { value: "special", label: "Különleges alkalom", icon: Palette },
]

// Demo recommendations (no AI)
const DEMO_RECOMMENDATIONS: Record<string, Record<string, { direction: string; subtitle: string; tips: string[] }>> = {
  light: {
    everyday: {
      direction: "Természetes ragyogás",
      subtitle: "Friss, természetes megjelenés egész napra",
      tips: [
        "Könnyű, áttetsző alapozó a bőr textúrájának megőrzéséhez",
        "Halvány rózsaszín vagy barack pirosító a friss hatásért",
        "Barna mascara a lágyabb tekintetért",
      ],
    },
    work: {
      direction: "Kifinomult professzionalizmus",
      subtitle: "Visszafogott elegancia üzleti környezetben",
      tips: [
        "Matt alapozó egyenletes fedéssel",
        "Semleges szemhéjpúder árnyalatok",
        "Nude vagy halvány rózsaszín ajakszín",
      ],
    },
    evening: {
      direction: "Elegáns csillogás",
      subtitle: "Ragyogó megjelenés esti eseményekre",
      tips: [
        "Világosító primer a ragyogó bőrért",
        "Arany vagy pezsgő highlighter",
        "Drámai szempilla a hangsúlyos tekintetért",
      ],
    },
    special: {
      direction: "Ünnepi fényesség",
      subtitle: "Különleges alkalmakhoz illő megjelenés",
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
      subtitle: "Könnyed, barátságos kisugárzás",
      tips: [
        "BB krém vagy tinted moisturizer",
        "Barack tónusú pirosító",
        "Áttetsző ajakfény",
      ],
    },
    work: {
      direction: "Visszafogott elegancia",
      subtitle: "Professzionális, magabiztos megjelenés",
      tips: [
        "Félig matt alapozó",
        "Taupe szemhéjpúder a kontúrhoz",
        "MLBB (My Lips But Better) ajakszín",
      ],
    },
    evening: {
      direction: "Meleg arany ragyogás",
      subtitle: "Elbűvölő este megjelenés",
      tips: [
        "Bronzosító a meleg árnyalatokhoz",
        "Arany-bronz smoky eye",
        "Berry vagy szilva ajakszín",
      ],
    },
    special: {
      direction: "Napfényes ünnep",
      subtitle: "Ragyogó megjelenés ünnepi alkalmakra",
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
      subtitle: "Harmonikus, kiegyensúlyozott megjelenés",
      tips: [
        "Közepes fedésű alapozó",
        "Korall pirosító",
        "Nude-barna ajakszín",
      ],
    },
    work: {
      direction: "Professzionális harmónia",
      subtitle: "Magabiztos, elegáns munkahely megjelenés",
      tips: [
        "Mattító primer az olajos zónákra",
        "Meleg barna szemhéjpúder",
        "Természetes rózsaszín ajkak",
      ],
    },
    evening: {
      direction: "Drámai mélység",
      subtitle: "Lenyűgöző esti megjelenés",
      tips: [
        "Ragyogó finish alapozó",
        "Réz és bronz szemárnyalatok",
        "Mély bordó ajakszín",
      ],
    },
    special: {
      direction: "Ünnepélyes ragyogás",
      subtitle: "Kiemelkedő megjelenés különleges eseményeken",
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
      subtitle: "Meleg, barátságos kisugárzás",
      tips: [
        "Hidratáló alapozó meleg alaptónussal",
        "Terrakotta pirosító",
        "Karamell ajakfény",
      ],
    },
    work: {
      direction: "Kiegyensúlyozott professzionalizmus",
      subtitle: "Elegáns üzleti megjelenés",
      tips: [
        "Selyemfényű alapozó",
        "Meleg taupe és barna árnyalatok",
        "Púderrózsaszín ajakszín",
      ],
    },
    evening: {
      direction: "Gazdag ragyogás",
      subtitle: "Pompás esti megjelenés",
      tips: [
        "Highlighter meleg arany tónusban",
        "Mély szilva és arany szemek",
        "Vörösesbarna ajakszín",
      ],
    },
    special: {
      direction: "Luxus fényesség",
      subtitle: "Lenyűgöző ünnepi megjelenés",
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
      subtitle: "Élénk, egészséges kisugárzás",
      tips: [
        "Nedves hatású alapozó gazdag pigmentációval",
        "Narancsos-barna pirosító",
        "Csokoládé ajakfény",
      ],
    },
    work: {
      direction: "Magabiztos elegancia",
      subtitle: "Erőteljes, professzionális megjelenés",
      tips: [
        "Matt alapozó mély tónusokban",
        "Réz és arany szemhéjpúder",
        "Barna-nude ajakszín",
      ],
    },
    evening: {
      direction: "Királyi ragyogás",
      subtitle: "Grandiózus esti megjelenés",
      tips: [
        "Arany highlighter intenzív ragyogással",
        "Kék-arany duochrome szemhéjpúder",
        "Mély bordó vagy szilva ajakszín",
      ],
    },
    special: {
      direction: "Drámai fényesség",
      subtitle: "Káprázatos ünnepi megjelenés",
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
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/20 py-20 md:py-28">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative mx-auto max-w-6xl px-4">
        {/* Section Header */}
        <div className="mb-12 text-center md:mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium tracking-wide text-primary">
              Gyors Előnézet
            </span>
          </div>
          <h2 className="mb-4 text-3xl font-light tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Ismerje meg a
            <span className="block font-medium">sminkstílusát</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Két egyszerű kérdés alapján azonnali irányt adunk — fotó nélkül, pillanatok alatt.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <GlassCard variant="elevated" className="overflow-hidden">
            {!showResult ? (
              <div className="p-8 md:p-10">
                <div className="space-y-8">
                  {/* Skin tone selector */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Palette className="h-4 w-4 text-primary" />
                      Bőrtónus
                    </label>
                    <Select value={skinTone} onValueChange={setSkinTone}>
                      <SelectTrigger className="h-14 rounded-[16px] border-border/50 bg-background/50 text-base">
                        <SelectValue placeholder="Válassza ki bőrtónusát" />
                      </SelectTrigger>
                      <SelectContent className="rounded-[16px]">
                        {SKIN_TONES.map((tone) => (
                          <SelectItem
                            key={tone.value}
                            value={tone.value}
                            className="rounded-[12px] text-base"
                          >
                            {tone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Occasion selector - Grid layout */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Alkalom
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {OCCASIONS.map((occ) => {
                        const Icon = occ.icon
                        return (
                          <button
                            key={occ.value}
                            onClick={() => setOccasion(occ.value)}
                            className={`flex flex-col items-center gap-3 rounded-[16px] border-2 p-4 transition-all duration-300 ${
                              occasion === occ.value
                                ? "border-primary bg-primary/10"
                                : "border-border/50 bg-background/50 hover:border-primary/50 hover:bg-background"
                            }`}
                          >
                            <Icon className={`h-6 w-6 ${occasion === occ.value ? "text-primary" : "text-muted-foreground"}`} />
                            <span className={`text-sm font-medium ${occasion === occ.value ? "text-primary" : "text-foreground"}`}>
                              {occ.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Submit button */}
                  <Button
                    size="lg"
                    className="h-16 w-full rounded-[16px] text-base font-medium shadow-lg"
                    onClick={handleGetPreview}
                    disabled={!skinTone || !occasion}
                  >
                    Iránymutató kérése
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {/* Result Header */}
                {recommendation && (
                  <>
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center md:p-10">
                      <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
                        Az Ön személyre szabott iránya
                      </p>
                      <h3 className="mb-2 text-3xl font-medium tracking-tight text-foreground md:text-4xl">
                        {recommendation.direction}
                      </h3>
                      <p className="text-base text-muted-foreground">
                        {recommendation.subtitle}
                      </p>
                    </div>

                    <div className="space-y-8 p-8 md:p-10">
                      {/* Tips section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-base font-medium text-foreground">
                          <Lightbulb className="h-5 w-5 text-primary" />
                          <span>Főbb ajánlások</span>
                        </div>
                        <div className="space-y-3">
                          {recommendation.tips.map((tip, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-4 rounded-[14px] bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
                            >
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                                {index + 1}
                              </span>
                              <span className="text-sm leading-relaxed text-foreground">
                                {tip}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                      {/* CTA Section */}
                      <div className="space-y-4 text-center">
                        <div className="space-y-2">
                          <p className="text-base font-medium text-foreground">
                            Szeretne még pontosabb elemzést?
                          </p>
                          <p className="text-sm text-muted-foreground">
                            AI-alapú személyre szabott sminkjavaslat a saját fotója alapján
                          </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Button
                            variant="outline"
                            className="h-14 flex-1 rounded-[16px] text-base"
                            onClick={handleReset}
                          >
                            Újrakezdés
                          </Button>
                          <Button
                            asChild
                            className="h-14 flex-1 rounded-[16px] text-base shadow-lg"
                          >
                            <Link href="#photo-tips">
                              Előzetes Útmutatás
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </section>
  )
}
