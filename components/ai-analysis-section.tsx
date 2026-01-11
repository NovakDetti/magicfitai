import { GlassCard } from "@/components/ui/glass-card"
import { Sparkles } from "lucide-react"

export function AIAnalysisSection() {
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
              AI Elemzés
            </span>
          </div>
          <h2 className="mb-4 text-3xl font-light tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Mit lát az AI
            <span className="block font-medium">az arcodon?</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Az AI vizuálisan elemzi természetes arcvonásait, hogy személyre szabott javaslatot készítsen.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 md:grid-cols-2">
            <GlassCard variant="subtle" className="group transition-all duration-300 hover:scale-[1.02]">
              <div className="p-6">
                <h3 className="mb-2 text-lg font-medium text-foreground">
                  Arcforma
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Az arc általános kontúrja és arányai, amelyek meghatározzák a kiemelendő vonásokat.
                </p>
              </div>
            </GlassCard>

            <GlassCard variant="subtle" className="group transition-all duration-300 hover:scale-[1.02]">
              <div className="p-6">
                <h3 className="mb-2 text-lg font-medium text-foreground">
                  Bőrtónus és alaptónus
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  A bőr színének árnyalata és hőmérséklete, ami az ideális színpaletta alapja.
                </p>
              </div>
            </GlassCard>

            <GlassCard variant="subtle" className="group transition-all duration-300 hover:scale-[1.02]">
              <div className="p-6">
                <h3 className="mb-2 text-lg font-medium text-foreground">
                  Szemforma és szemarányok
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  A szemek mérete, távolsága és formája, amelyek irányítják a szemmakeup technikákat.
                </p>
              </div>
            </GlassCard>

            <GlassCard variant="subtle" className="group transition-all duration-300 hover:scale-[1.02]">
              <div className="p-6">
                <h3 className="mb-2 text-lg font-medium text-foreground">
                  Természetes kontraszt
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  A haj, bőr és szemek közötti színintenzitás különbség, ami befolyásolja a smink erősségét.
                </p>
              </div>
            </GlassCard>

            <GlassCard variant="subtle" className="group transition-all duration-300 hover:scale-[1.02]">
              <div className="p-6">
                <h3 className="mb-2 text-lg font-medium text-foreground">
                  Arcvonások egyensúlya
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Az ajkak, orr és szemöldök egymáshoz viszonyított arányai és elhelyezkedése.
                </p>
              </div>
            </GlassCard>

            <GlassCard variant="subtle" className="group transition-all duration-300 hover:scale-[1.02]">
              <div className="p-6">
                <h3 className="mb-2 text-lg font-medium text-foreground">
                  Bőrfelszín vizuális jellemzői
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  A bőr látható textúrája és fényvisszaverése, ami a finish kiválasztásához segít.
                </p>
              </div>
            </GlassCard>
          </div>

          <div className="mt-12 text-center">
            <GlassCard variant="elevated" className="inline-block">
              <div className="px-8 py-5">
                <p className="leading-relaxed text-muted-foreground">
                  Ezek az információk segítenek abban, hogy a smink valóban az Ön arcához illeszkedjen.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  )
}
