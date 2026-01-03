"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

type Intent = "natural" | "fresh" | "elegant" | "defined"
type Depth = "light" | "lightMedium" | "medium" | "deep"
type Undertone = "cool" | "warm" | "neutral" | "unsure"
type Focus = "eyes" | "harmony" | "freshness" | "defined"
type Occasion = "everyday" | "work" | "evening" | "multi"

type Palette = "Nude" | "Desert" | "Passion"

function pickPalette(depth: Depth, undertone: Undertone): Palette {
  if (depth === "deep") return "Passion"
  if (undertone === "warm") return "Desert"
  if (undertone === "cool") return "Nude"
  if (undertone === "neutral") return "Nude"
  // unsure
  return "Nude"
}

function titleFor(palette: Palette, intent: Intent, occasion: Occasion) {
  const base =
    palette === "Nude"
      ? "Letisztult harmónia"
      : palette === "Desert"
        ? "Meleg, napfényes tónusok"
        : "Karakteres, mégis elegáns"

  const intentHint =
    intent === "natural"
      ? " — természetes hatással"
      : intent === "fresh"
        ? " — friss, rendezett összhatással"
        : intent === "elegant"
          ? " — visszafogott eleganciával"
          : " — finom határozottsággal"

  const occasionHint =
    occasion === "evening" ? " (esti variációval)" : occasion === "work" ? " (irodabarát)" : ""

  return `${base}${intentHint}${occasionHint}`
}

function guidanceFor(palette: Palette, focus: Focus) {
  // Elegant, non-salesy, “this is not a template” feeling
  const base =
    palette === "Nude"
      ? [
          "A finom bézs és lágy barna átmenetek tisztán tartják a tekintetet, anélkül hogy elnehezítenék.",
          "Egy visszafogott fény a szemhéj közepén optikailag nyitja a szemet, mégis természetes marad.",
          "A kontúr legyen lágy: inkább árnyékolás, mint vonal — ettől lesz kifinomult az összhatás.",
        ]
      : palette === "Desert"
        ? [
            "A meleg arany-bronz árnyalatok kiemelik a bőr természetes fényét, és egységes, „napcsókolta” hatást adnak.",
            "A szemhéj mélyítéséhez válasszon terrakottát vagy meleg barnát — ettől lesz finom, mégis határozott.",
            "A belső szemzug enyhe fényével a tekintet frissebbnek, pihentebbnek hat.",
          ]
        : [
            "A bogyós és mályvás tónusok szépen „kiállnak” mélyebb bőrtónuson is — karaktert adnak, nem vesznek el.",
            "A mélyítésnél a kontraszt a kulcs: egy sötétebb mályva elegáns, nem túlzó.",
            "A fény legyen célzott: a szemhéj közepén vagy a belső szemzugban, a kifinomult dimenzióért.",
          ]

  const focusLine =
    focus === "eyes"
      ? "Fókusz: a tekintet finom kiemelése, lágy átmenetekkel."
      : focus === "harmony"
        ? "Fókusz: arányok és tónusok összhangja — semmi nem „ül rá” az arcra."
        : focus === "freshness"
          ? "Fókusz: friss, üde hatás — tiszta fények, könnyed textúrák."
          : "Fókusz: határozottabb megjelenés — kontrollált mélység, elegáns kontraszt."

  return { bullets: base, focusLine }
}

function shadeTagsFor(palette: Palette) {
  if (palette === "Nude") {
    return [
      { label: "Pezsgőfény", chip: "#F2E6D8" },
      { label: "Lágy bézs", chip: "#E7D5C2" },
      { label: "Meleg barna", chip: "#B78F6A" },
    ]
  }
  if (palette === "Desert") {
    return [
      { label: "Aranyló fény", chip: "#E0C27A" },
      { label: "Terrakotta", chip: "#C57B57" },
      { label: "Bronz", chip: "#A67A4A" },
    ]
  }
  return [
    { label: "Bogyós tónus", chip: "#B65A76" },
    { label: "Mályva", chip: "#8B4D6B" },
    { label: "Finom fény", chip: "#D9C6E8" },
  ]
}

export function FreeDemo() {
  // Core (VIP but lightweight) inputs
  const [intent, setIntent] = useState<Intent | "">("")
  const [depth, setDepth] = useState<Depth | "">("")
  const [undertone, setUndertone] = useState<Undertone | "">("")
  const [focus, setFocus] = useState<Focus | "">("")
  const [occasion, setOccasion] = useState<Occasion | "">("")
  const [showResult, setShowResult] = useState(false)

  const canSubmit = Boolean(intent && depth && undertone && focus && occasion)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (canSubmit) setShowResult(true)
  }

  const reset = () => {
    setIntent("")
    setDepth("")
    setUndertone("")
    setFocus("")
    setOccasion("")
    setShowResult(false)
  }

  const result = useMemo(() => {
    const palette = pickPalette(depth as Depth, undertone as Undertone)
    const title = titleFor(palette, intent as Intent, occasion as Occasion)
    const guide = guidanceFor(palette, focus as Focus)
    const tags = shadeTagsFor(palette)
    return { palette, title, guide, tags }
  }, [depth, undertone, intent, occasion, focus])

  return (
    <section id="elozetes-utmutatas" className="relative overflow-hidden px-4 py-20 md:py-28">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-secondary/40 to-transparent" />

      <div className="container relative mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-4 py-2 text-sm tracking-wide text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-primary/60" />
            <span>Előzetes iránymutatás</span>
          </div>

          <h2 className="text-3xl font-light tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Fedezze fel saját
            <span className="block font-medium">színvilágát.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Néhány célzott kérdés alapján feltérképezzük, milyen tónusok és arányok működnek a legszebben az Ön
            megjelenésével összhangban — nyugodt, nem tolakodó iránymutatással.
          </p>
        </div>

        <Card className="glass-card fade-up overflow-hidden rounded-[24px] p-8 md:p-10">
          {!showResult ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Intent */}
              <div className="space-y-3">
                <label className="text-sm font-medium tracking-wide text-foreground">Megjelenési szándék</label>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Az ajánlás abból indul ki, milyen hatást szeretne elérni — ez adja meg az egész iránymutatás hangját.
                </p>
                <Select value={intent} onValueChange={(v) => setIntent(v as Intent)}>
                  <SelectTrigger className="h-14 w-full rounded-[14px] border-border/50 bg-background/50 text-base">
                    <SelectValue placeholder="Válassza ki, mi áll Önhöz közel" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[14px]">
                    <SelectItem value="natural" className="rounded-[10px]">
                      Természetes, visszafogott
                    </SelectItem>
                    <SelectItem value="fresh" className="rounded-[10px]">
                      Friss, rendezett mindennapokra
                    </SelectItem>
                    <SelectItem value="elegant" className="rounded-[10px]">
                      Visszafogott elegancia
                    </SelectItem>
                    <SelectItem value="defined" className="rounded-[10px]">
                      Finoman határozottabb
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Depth */}
              <div className="space-y-3">
                <label className="text-sm font-medium tracking-wide text-foreground">Bőrtónus</label>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Nem a „szín” a lényeg, hanem az összhatás: ez segít kiválasztani, mennyi mélység és kontraszt áll jól.
                </p>
                <Select value={depth} onValueChange={(v) => setDepth(v as Depth)}>
                  <SelectTrigger className="h-14 w-full rounded-[14px] border-border/50 bg-background/50 text-base">
                    <SelectValue placeholder="Válassza ki bőrtónusát" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[14px]">
                    <SelectItem value="light" className="rounded-[10px]">
                      Világos / porcelán
                    </SelectItem>
                    <SelectItem value="lightMedium" className="rounded-[10px]">
                      Világos–közepes
                    </SelectItem>
                    <SelectItem value="medium" className="rounded-[10px]">
                      Közepes
                    </SelectItem>
                    <SelectItem value="deep" className="rounded-[10px]">
                      Mélyebb tónus
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Undertone */}
              <div className="space-y-3">
                <label className="text-sm font-medium tracking-wide text-foreground">Alaptónus</label>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Az alaptónus határozza meg, mely árnyalatok harmonizálnak igazán (hideg / meleg / semleges). Ha nem
                  biztos benne, az ajánlásban értelmezzük.
                </p>
                <Select value={undertone} onValueChange={(v) => setUndertone(v as Undertone)}>
                  <SelectTrigger className="h-14 w-full rounded-[14px] border-border/50 bg-background/50 text-base">
                    <SelectValue placeholder="Válasszon alaptónust (vagy „nem vagyok benne biztos”)" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[14px]">
                    <SelectItem value="cool" className="rounded-[10px]">
                      Hideg (rózsás, kékes)
                    </SelectItem>
                    <SelectItem value="warm" className="rounded-[10px]">
                      Meleg (aranyló, barackos)
                    </SelectItem>
                    <SelectItem value="neutral" className="rounded-[10px]">
                      Semleges
                    </SelectItem>
                    <SelectItem value="unsure" className="rounded-[10px]">
                      Nem vagyok benne biztos
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Focus */}
              <div className="space-y-3">
                <label className="text-sm font-medium tracking-wide text-foreground">Fókusz</label>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Az iránymutatás ezt emeli ki: tekintet, harmónia vagy frissesség — kontrolláltan, elegánsan.
                </p>
                <Select value={focus} onValueChange={(v) => setFocus(v as Focus)}>
                  <SelectTrigger className="h-14 w-full rounded-[14px] border-border/50 bg-background/50 text-base">
                    <SelectValue placeholder="Válassza ki, mire helyezzük a hangsúlyt" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[14px]">
                    <SelectItem value="eyes" className="rounded-[10px]">
                      Tekintet
                    </SelectItem>
                    <SelectItem value="harmony" className="rounded-[10px]">
                      Arcvonások összhangja
                    </SelectItem>
                    <SelectItem value="freshness" className="rounded-[10px]">
                      Természetes frissesség
                    </SelectItem>
                    <SelectItem value="defined" className="rounded-[10px]">
                      Határozottabb megjelenés
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Occasion */}
              <div className="space-y-3">
                <label className="text-sm font-medium tracking-wide text-foreground">Felhasználási helyzet</label>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Más árnyalat működik nappal, munka közben vagy este. Ez segít a nappali és az esti variáció
                  finomhangolásában.
                </p>
                <Select value={occasion} onValueChange={(v) => setOccasion(v as Occasion)}>
                  <SelectTrigger className="h-14 w-full rounded-[14px] border-border/50 bg-background/50 text-base">
                    <SelectValue placeholder="Válassza ki, mikorra készül" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[14px]">
                    <SelectItem value="everyday" className="rounded-[10px]">
                      Mindennapokra
                    </SelectItem>
                    <SelectItem value="work" className="rounded-[10px]">
                      Munka / találkozók
                    </SelectItem>
                    <SelectItem value="evening" className="rounded-[10px]">
                      Esemény / este
                    </SelectItem>
                    <SelectItem value="multi" className="rounded-[10px]">
                      Többféle alkalomra
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 w-full rounded-[14px] text-base font-medium"
                  disabled={!canSubmit}
                >
                  Személyes iránymutatás megtekintése
                </Button>

                <div className="text-center text-sm tracking-wide text-muted-foreground/80">
                  <p>Néhány pillanat, regisztráció nélkül</p>
                  <p className="mt-1">Előzetes iránymutatás — finom, nem tolakodó ajánlással.</p>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium tracking-wide text-primary">Az Ön iránymutatása</p>
                  <h3 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">{result.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Ez egy előzetes, személyre hangolt összefoglaló. A részletes konzultációban finomítjuk az árnyalatok
                    arányát és az alkalmazási lépéseket is.
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium tracking-wide text-foreground">Kiemelt irány</p>
                  <div className="rounded-[16px] border border-border/50 bg-background/50 p-4 text-sm text-muted-foreground">
                    {result.guide.focusLine}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium tracking-wide text-foreground">Személyes útmutatás</p>
                  <ul className="space-y-3 text-muted-foreground">
                    {result.guide.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        <span className="leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium tracking-wide text-foreground">Javasolt paletta-irány</p>
                  <div className="rounded-[18px] border border-border/50 bg-background/50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs tracking-wide text-muted-foreground">Elsődleges irány</p>
                        <p className="text-lg font-medium text-foreground">{result.palette}</p>
                        <p className="text-sm text-muted-foreground">
                          Egyetlen, következetes árnyalatvilág — hogy a smink az arcával együtt dolgozzon, ne ellene.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium tracking-wide text-foreground">Harmonizáló tónusok</p>
                  <div className="flex flex-wrap gap-3">
                    {result.tags.map((t) => (
                      <div
                        key={t.label}
                        className="flex items-center gap-2.5 rounded-full bg-foreground/[0.04] px-5 py-2.5 text-sm font-medium text-foreground"
                      >
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: t.chip }} />
                        {t.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="divider-elegant" />

              <div className="flex flex-col gap-4 pt-2">
                <Button size="lg" className="h-14 w-full rounded-[14px] text-base font-medium" asChild>
                  <Link href="/ai-sminkajanlo">
                    Részletes konzultáció megnyitása
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 w-full rounded-[14px] text-base font-medium"
                  onClick={reset}
                >
                  Új irányt nézek meg
                </Button>

                <p className="text-center text-xs leading-relaxed text-muted-foreground/70">
                  Ez az előzetes iránymutatás tájékoztató jellegű. A részletes konzultációban a sminkelési szokások és
                  preferenciák alapján pontosítjuk a lépéseket.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  )
}
