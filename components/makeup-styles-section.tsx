import { GlassCard } from "@/components/ui/glass-card"
import { Palette } from "lucide-react"
import Image from "next/image"

export function MakeupStylesSection() {
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
              Sminkstílusok
            </span>
          </div>
          <h2 className="mb-4 text-2xl font-light tracking-tight text-foreground md:text-3xl lg:text-4xl xl:text-5xl">
            Így mutat rajtad
            <span className="block font-medium">különböző sminkstílusok</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground">
            Ugyanaz az arc több sminkstílust is elbír – az AI csak a stílus intenzitását igazítja, nem az arcvonásokat.
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Column - Natural Look */}
          <GlassCard variant="elevated" className="overflow-hidden">
            <div className="relative aspect-[3/4] bg-gradient-to-br from-background to-secondary/20">
              <Image
                src="/makeup_soft.png"
                alt="Hétköznapi, természetes smink megjelenés"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-3 p-4 md:space-y-4 md:p-6">
              <h3 className="text-lg md:text-xl font-medium text-foreground">
                🌿 Hétköznapi, természetes megjelenés
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Finom, kiegyensúlyozott és friss összhatás, amely a természetes arcvonásokat emeli ki anélkül, hogy túlhangsúlyozná őket. Ez a stílus letisztult, könnyed megjelenést ad, miközben megőrzi az arc eredeti karakterét.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Ideális választás mindennapokra, munkába, nappali programokra vagy bármikor, amikor ápolt, mégis természetes hatást szeretne.
              </p>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Jellemzők:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                    <span>Szemhangsúly: lágy, diszkrét kiemelés a tekintet frissítésére</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                    <span>Bőrfinis: természetes, üde, enyhén ragyogó hatás</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                    <span>Összhatás: könnyed, harmonikus, magabiztos</span>
                  </li>
                </ul>
              </div>
            </div>
          </GlassCard>

          {/* Right Column - Evening/Smokey Look */}
          <GlassCard variant="elevated" className="overflow-hidden">
            <div className="relative aspect-[3/4] bg-gradient-to-br from-background to-secondary/20">
              <Image
                src="/makeup_smokey.png"
                alt="Karakteres, esti (Smokey) smink megjelenés"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-3 p-4 md:space-y-4 md:p-6">
              <h3 className="text-lg md:text-xl font-medium text-foreground">
                🌙 Karakteres, esti (Smokey) megjelenés
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Határozott, elegáns és kifejező stílus, amely mélyebb kontrasztokkal és intenzívebb szemhangsúllyal formálja a megjelenést. A hangsúly a tekinteten van, miközben az arcvonások arányai változatlanok maradnak.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Ez a megjelenés ideális esti eseményekhez, különleges alkalmakhoz vagy akkor, amikor karakteresebb, magabiztos kisugárzásra van szükség.
              </p>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Jellemzők:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                    <span>Szemhangsúly: intenzív, árnyékolt, mélységet adó</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                    <span>Bőrfinis: strukturált, definiált, kifinomult</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                    <span>Összhatás: drámai, nőies, elegáns</span>
                  </li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Closing reassurance */}
        <div className="mt-12 text-center">
          <GlassCard variant="elevated" className="inline-block">
            <div className="px-8 py-5">
              <p className="leading-relaxed text-muted-foreground">
                A smink minden esetben az Ön természetes arcvonásaira épül – csak a stílus és a hangsúly változik.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  )
}
