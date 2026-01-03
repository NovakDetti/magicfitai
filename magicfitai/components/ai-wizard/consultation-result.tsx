"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import {
  type ConsultationAnswers,
  type PaletteRecommendation,
  determinePalette,
  appearanceLabels,
  undertoneLabels,
  skinDepthLabels,
  paletteNames,
} from "@/lib/consultation-types"

interface ConsultationResultProps {
  answers: ConsultationAnswers
  onNewConsultation: () => void
}

// Palette-specific content
const paletteContent: Record<
  PaletteRecommendation,
  {
    explanation: (undertone: string, depth: string) => string
    colors: { name: string; hex: string }[]
    daytime: {
      base: string
      eyes: string
      cheeks: string
      lips: string
    }
    evening: {
      eyes: string
      contour: string
      lips: string
    }
  }
> = {
  nude: {
    explanation: (undertone, depth) =>
      `A semleges és lágy tónusok tökéletesen harmonizálnak az Ön ${undertone} alaptónusával. Ezek az árnyalatok nem versenyeznek természetes színeivel, hanem finoman kiegészítik azokat. A ${depth} bőrmélység mellett a nude árnyalatok elegáns visszafogottságot sugallnak, miközben kiemelik arcának természetes struktúráját.`,
    colors: [
      { name: "Púder rózsaszín", hex: "#E8C4C4" },
      { name: "Bézs", hex: "#D4C4B5" },
      { name: "Taupe", hex: "#B8A99A" },
      { name: "Púder barack", hex: "#EACEB4" },
    ],
    daytime: {
      base: "rózsás-bézs",
      eyes: "lágy taupe és halvány rózsaszín",
      cheeks: "púderes barack",
      lips: "nude rózsaszín",
    },
    evening: {
      eyes: "mélyebb taupe a külső szemzugban, vékony vonallal",
      contour: "finoman hangsúlyozott arcél",
      lips: "telített nude vagy halvány málna",
    },
  },
  desert: {
    explanation: (undertone, depth) =>
      `A meleg, bronzos és aranyló tónusok rezonálnak az Ön ${undertone} alaptónusával. Ezek az árnyalatok felerősítik bőre természetes melegségét és ragyogását. A ${depth} bőrmélység mellett a desert árnyalatok napfényes, életteli hatást keltenek, anélkül hogy túlzónak tűnnének.`,
    colors: [
      { name: "Arany barack", hex: "#E8B878" },
      { name: "Terrakotta", hex: "#C4846A" },
      { name: "Bronz", hex: "#A67B5B" },
      { name: "Meleg barna", hex: "#8B6B4E" },
    ],
    daytime: {
      base: "arany-barack",
      eyes: "meleg barna és arany fények",
      cheeks: "bronzos terrakotta",
      lips: "karamell vagy meleg korall",
    },
    evening: {
      eyes: "mélyebb bronz és arany, finom csillogással",
      contour: "meleg bronzosító az arcél mentén",
      lips: "tégla vagy réz árnyalat",
    },
  },
  passion: {
    explanation: (undertone, depth) =>
      `A rózsás, málnás és mélyebb tónusok karaktert és mélységet adnak az Ön ${undertone} alaptónusához. Ezek az árnyalatok kifejezik az Ön határozott jelenlétét. A ${depth} bőrmélység mellett a passion árnyalatok drámai, de harmonikus kontrasztot teremtenek.`,
    colors: [
      { name: "Málna", hex: "#B45B6C" },
      { name: "Mély rózsaszín", hex: "#9E4B5E" },
      { name: "Szilva", hex: "#6B3A5A" },
      { name: "Berry", hex: "#8E4162" },
    ],
    daytime: {
      base: "semleges-rózsás",
      eyes: "lágy szilva és rózsás árnyalatok",
      cheeks: "málnás pirosító, finoman",
      lips: "berry vagy mély rózsaszín balzsam",
    },
    evening: {
      eyes: "füstös szilva, hangsúlyos külső szemzug",
      contour: "drámai arcél, rózsás csúcsfényekkel",
      lips: "mély málna vagy bordó",
    },
  },
}

export function ConsultationResult({ answers, onNewConsultation }: ConsultationResultProps) {
  const palette = determinePalette(answers)
  const content = paletteContent[palette]

  const undertone = answers.skinUndertone ? undertoneLabels[answers.skinUndertone] : "semleges"
  const depth = answers.skinDepth ? skinDepthLabels[answers.skinDepth] : "közepes"
  const appearance = answers.desiredAppearance ? appearanceLabels[answers.desiredAppearance] : "természetes harmóniára"

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      {/* Opening reflection */}
      <div className="fade-up space-y-4 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-sm font-medium tracking-wide text-primary">Konzultáció eredménye</span>
        </div>

        <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground">
          Az Ön válaszai alapján egy {undertone} alaptónusú, {depth} bőrszínnel rendelkező
          személyt látunk, aki {appearance} vágyik.
        </p>
        <p className="text-muted-foreground">
          Ez a kombináció különleges lehetőségeket kínál.
        </p>
      </div>

      {/* Palette recommendation */}
      <Card className="glass-card fade-up overflow-hidden rounded-[24px] border-0">
        <CardContent className="p-8 md:p-10">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-medium tracking-wide text-primary">Az Ön színvilága</p>
            <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl">
              {paletteNames[palette]}
            </h2>
          </div>

          {/* Explanation */}
          <p className="mb-8 text-center leading-relaxed text-muted-foreground">
            {content.explanation(undertone, depth)}
          </p>

          {/* Color swatches */}
          <div className="mb-8 flex flex-wrap justify-center gap-4">
            {content.colors.map((color) => (
              <div key={color.name} className="flex flex-col items-center gap-2">
                <div
                  className="h-14 w-14 rounded-2xl shadow-sm ring-1 ring-black/5"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-xs text-muted-foreground">{color.name}</span>
              </div>
            ))}
          </div>

          <div className="divider-elegant" />

          {/* Daytime suggestion */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-medium tracking-tight text-foreground">Nappalra</h3>
            <div className="space-y-3 text-muted-foreground">
              <p className="leading-relaxed">
                Alapként egy <span className="text-foreground">{content.daytime.base}</span> árnyalatú,
                könnyed fedésű bázis őrzi meg bőre természetes textúráját.
              </p>
              <p className="leading-relaxed">
                A szemhéjon <span className="text-foreground">{content.daytime.eyes}</span> finoman
                definiálja a tekintetet, míg egy <span className="text-foreground">{content.daytime.cheeks}</span> az
                arccsonton frissességet kölcsönöz.
              </p>
              <p className="leading-relaxed">
                Az ajkakon <span className="text-foreground">{content.daytime.lips}</span> balzsam
                vagy áttetsző szín zárja az összképet.
              </p>
              <p className="mt-4 text-sm italic text-muted-foreground/70">
                Ez a kombináció egész nap viselhető, és alkalmazkodik a természetes fényviszonyokhoz.
              </p>
            </div>
          </div>

          <div className="divider-elegant my-8" />

          {/* Evening variation */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium tracking-tight text-foreground">Estére</h3>
            <div className="space-y-3 text-muted-foreground">
              <p className="leading-relaxed">
                Ugyanez az alap mélyíthető: <span className="text-foreground">{content.evening.eyes}</span>.
              </p>
              <p className="leading-relaxed">
                Az arcszín maradhat változatlan, de <span className="text-foreground">{content.evening.contour}</span>.
              </p>
              <p className="leading-relaxed">
                Az ajkakon <span className="text-foreground">{content.evening.lips}</span> ad karaktert —
                ez a tónus összhangban van az Ön alaptónusával, így drámai, de nem idegen hatást kelt.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Closing message */}
      <Card className="glass fade-up overflow-hidden rounded-[20px]">
        <CardContent className="p-6 md:p-8">
          <p className="text-center leading-relaxed text-muted-foreground">
            Ez az útmutatás az Ön egyedi jellemzőire épül, de a végső döntés mindig az Öné.
            <span className="mt-2 block font-medium text-foreground">
              A legjobb smink az, amelyben otthon érzi magát.
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:justify-center">
        <Button size="lg" className="h-12 gap-2 rounded-[12px] px-6 font-medium">
          <Download className="h-4 w-4" />
          Útmutatás mentése
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-12 gap-2 rounded-[12px] px-6 font-medium"
          onClick={onNewConsultation}
        >
          <RefreshCw className="h-4 w-4" />
          Új konzultáció
        </Button>
      </div>

      {/* Soft closing */}
      <p className="text-center text-sm text-muted-foreground/70">
        Ha szeretné finomítani az ajánlást, vagy más alkalomra is kér útmutatást, szívesen segítünk.
      </p>
    </div>
  )
}
