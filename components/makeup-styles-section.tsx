"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Palette } from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider"

export function MakeupStylesSection() {
  const { language } = useLanguage()
  const copy = language === "hu" ? {
    badge: "Sminkstílusok",
    titleTop: "Így mutat rajtad",
    titleBottom: "különböző sminkstílusok",
    description:
      "Ugyanaz az arc több sminkstílust is elbír – az AI csak a stílus intenzitását igazítja, nem az arcvonásokat.",
    cards: [
      {
        image: "/makeup_soft.png",
        alt: "Hétköznapi, természetes smink megjelenés",
        title: "🌿 Hétköznapi, természetes megjelenés",
        paragraphs: [
          "Finom, kiegyensúlyozott és friss összhatás, amely a természetes arcvonásokat emeli ki anélkül, hogy túlhangsúlyozná őket. Ez a stílus letisztult, könnyed megjelenést ad, miközben megőrzi az arc eredeti karakterét.",
          "Ideális választás mindennapokra, munkába, nappali programokra vagy bármikor, amikor ápolt, mégis természetes hatást szeretne.",
        ],
        featuresTitle: "Jellemzők:",
        features: [
          "Szemhangsúly: lágy, diszkrét kiemelés a tekintet frissítésére",
          "Bőrfinis: természetes, üde, enyhén ragyogó hatás",
          "Összhatás: könnyed, harmonikus, magabiztos",
        ],
      },
      {
        image: "/makeup_smokey.png",
        alt: "Karakteres, esti (Smokey) smink megjelenés",
        title: "🌙 Karakteres, esti (Smokey) megjelenés",
        paragraphs: [
          "Határozott, elegáns és kifejező stílus, amely mélyebb kontrasztokkal és intenzívebb szemhangsúllyal formálja a megjelenést. A hangsúly a tekinteten van, miközben az arcvonások arányai változatlanok maradnak.",
          "Ez a megjelenés ideális esti eseményekhez, különleges alkalmakhoz vagy akkor, amikor karakteresebb, magabiztos kisugárzásra van szükség.",
        ],
        featuresTitle: "Jellemzők:",
        features: [
          "Szemhangsúly: intenzív, árnyékolt, mélységet adó",
          "Bőrfinis: strukturált, definiált, kifinomult",
          "Összhatás: drámai, nőies, elegáns",
        ],
      },
    ],
    footer:
      "A smink minden esetben az Ön természetes arcvonásaira épül – csak a stílus és a hangsúly változik.",
  } : {
    badge: "Makeup styles",
    titleTop: "How different",
    titleBottom: "styles look on you",
    description:
      "The same face can carry multiple styles — the AI adjusts intensity, not your features.",
    cards: [
      {
        image: "/makeup_soft.png",
        alt: "Everyday natural makeup look",
        title: "🌿 Everyday, natural look",
        paragraphs: [
          "Soft, balanced, and fresh. This style highlights natural features without over-emphasizing them, keeping the face’s original character.",
          "Ideal for daily wear, workdays, daytime plans, or any time you want a polished yet natural effect.",
        ],
        featuresTitle: "Key traits:",
        features: [
          "Eye focus: gentle, subtle emphasis for a refreshed look",
          "Skin finish: natural, fresh, softly radiant",
          "Overall effect: light, harmonious, confident",
        ],
      },
      {
        image: "/makeup_smokey.png",
        alt: "Bold evening (Smokey) makeup look",
        title: "🌙 Bold evening (Smokey) look",
        paragraphs: [
          "Confident, elegant, and expressive with deeper contrast and stronger eye emphasis. The focus is on the gaze while facial proportions remain unchanged.",
          "Perfect for evening events, special occasions, or when you want a more dramatic presence.",
        ],
        featuresTitle: "Key traits:",
        features: [
          "Eye focus: intense, shaded, depth-enhancing",
          "Skin finish: structured, defined, refined",
          "Overall effect: dramatic, feminine, elegant",
        ],
      },
    ],
    footer:
      "Makeup always builds on your natural features — only the style and emphasis change.",
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/20 to-background py-12 md:py-20 lg:py-28">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 left-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative mx-auto max-w-6xl px-4">
        {/* Section Header */}
        <div className="mb-8 text-center md:mb-12 lg:mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <Palette className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium tracking-wide text-primary">
              {copy.badge}
            </span>
          </div>
          <h2 className="mb-4 text-2xl font-light tracking-tight text-foreground md:text-3xl lg:text-4xl xl:text-5xl">
            {copy.titleTop}
            <span className="block font-medium">{copy.titleBottom}</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground">
            {copy.description}
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-2 lg:gap-12">
          {copy.cards.map((card) => (
            <GlassCard key={card.title} variant="elevated" className="overflow-hidden">
              <div className="relative aspect-[3/4] bg-gradient-to-br from-background to-secondary/20">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-3 p-4 md:space-y-4 md:p-6">
                <h3 className="text-lg md:text-xl font-medium text-foreground">
                  {card.title}
                </h3>
                {card.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-sm leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{card.featuresTitle}</p>
                  <ul className="space-y-2">
                    {card.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Closing reassurance */}
        <div className="mt-12 text-center">
          <GlassCard variant="elevated" className="inline-block">
            <div className="px-8 py-5">
                <p className="leading-relaxed text-muted-foreground">
                  {copy.footer}
                </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  )
}
