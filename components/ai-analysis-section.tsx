"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Sparkles } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function AIAnalysisSection() {
  const { language } = useLanguage()
  const copy = language === "hu" ? {
    badge: "AI Elemzés",
    titleTop: "Mit lát az AI",
    titleBottom: "az arcodon?",
    description:
      "Az AI vizuálisan elemzi természetes arcvonásait, hogy személyre szabott javaslatot készítsen.",
    items: [
      {
        title: "Arcforma",
        body:
          "Az arc általános kontúrja és arányai, amelyek meghatározzák a kiemelendő vonásokat.",
      },
      {
        title: "Bőrtónus és alaptónus",
        body:
          "A bőr színének árnyalata és hőmérséklete, ami az ideális színpaletta alapja.",
      },
      {
        title: "Szemforma és szemarányok",
        body:
          "A szemek mérete, távolsága és formája, amelyek irányítják a szemmakeup technikákat.",
      },
      {
        title: "Természetes kontraszt",
        body:
          "A haj, bőr és szemek közötti színintenzitás különbség, ami befolyásolja a smink erősségét.",
      },
      {
        title: "Arcvonások egyensúlya",
        body:
          "Az ajkak, orr és szemöldök egymáshoz viszonyított arányai és elhelyezkedése.",
      },
      {
        title: "Bőrfelszín vizuális jellemzői",
        body:
          "A bőr látható textúrája és fényvisszaverése, ami a finish kiválasztásához segít.",
      },
    ],
    footer:
      "Ezek az információk segítenek abban, hogy a smink valóban az Ön arcához illeszkedjen.",
  } : {
    badge: "AI Analysis",
    titleTop: "What does the AI",
    titleBottom: "see in your face?",
    description:
      "The AI visually analyzes your natural features to craft personalized guidance.",
    items: [
      {
        title: "Face shape",
        body:
          "Overall contours and proportions that define which features to emphasize.",
      },
      {
        title: "Skin tone and undertone",
        body:
          "The shade and temperature of your skin, forming the base of the ideal palette.",
      },
      {
        title: "Eye shape and proportions",
        body:
          "Eye size, spacing, and shape that guide eye makeup techniques.",
      },
      {
        title: "Natural contrast",
        body:
          "Contrast between hair, skin, and eyes that affects makeup intensity.",
      },
      {
        title: "Facial balance",
        body:
          "Relative proportions of lips, nose, and brows that shape the overall harmony.",
      },
      {
        title: "Skin surface traits",
        body:
          "Visible texture and reflectivity that help determine the right finish.",
      },
    ],
    footer:
      "These details help ensure the makeup truly fits your face.",
  }

  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-28">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute left-0 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-0 h-96 w-96 translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative mx-auto max-w-6xl px-4">
        {/* Section Header */}
        <div className="mb-12 text-center md:mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium tracking-wide text-primary">
              {copy.badge}
            </span>
          </div>
          <h2 className="mb-4 text-3xl font-light tracking-tight text-foreground md:text-4xl lg:text-5xl">
            {copy.titleTop}
            <span className="block font-medium">{copy.titleBottom}</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {copy.description}
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 md:grid-cols-2">
            {copy.items.map((item, index) => (
              <GlassCard key={index} variant="subtle" className="group transition-all duration-300 hover:scale-[1.02]">
                <div className="p-6">
                  <h3 className="mb-2 text-lg font-medium text-foreground">
                    {item.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>

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
      </div>
    </section>
  )
}
