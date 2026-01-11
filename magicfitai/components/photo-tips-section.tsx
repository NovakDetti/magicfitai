"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Camera, Sun, Eye, Smile, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const PHOTO_TIPS = [
  {
    icon: Sun,
    title: "Természetes fény",
    description: "Nappal, ablak közelében készítse a fényképet. Kerülje a közvetlen napfényt és a mesterséges lámpákat.",
  },
  {
    icon: Eye,
    title: "Szemből, egyenesen",
    description: "Nézzen közvetlenül a kamerába, egyenes tartással. Frontális fotó szükséges az elemzéshez.",
  },
  {
    icon: Smile,
    title: "Smink nélkül",
    description: "Tiszta, smink nélküli bőr a legpontosabb elemzéshez. Így láthatjuk a természetes vonásait.",
  },
  {
    icon: CheckCircle2,
    title: "Éles, jó minőség",
    description: "HD felbontású, éles fotó. Kerülje a homályos vagy túl világos/sötét képeket.",
  },
]

export function PhotoTipsSection() {
  return (
    <section id="photo-tips" className="relative overflow-hidden bg-gradient-to-b from-secondary/20 to-background py-12 md:py-20 lg:py-28">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 left-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative mx-auto max-w-6xl px-4">
        {/* Section Header */}
        <div className="mb-8 text-center md:mb-12 lg:mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <Camera className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium tracking-wide text-primary">
              Fénykép Megosztása
            </span>
          </div>
          <h2 className="mb-4 text-2xl font-light tracking-tight text-foreground md:text-3xl lg:text-4xl xl:text-5xl">
            Hogyan készítsen
            <span className="block font-medium">tökéletes fotót?</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground">
            Néhány egyszerű tipp, hogy a legjobb eredményt érje el az AI elemzésből.
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left side - Example photo */}
          <div className="order-2 lg:order-1">
            <GlassCard variant="elevated" className="overflow-hidden">
              <div className="relative aspect-[3/4] bg-gradient-to-br from-background to-secondary/20">
                <Image
                  src="/selife.png"
                  alt="Példa fotó - természetes fényben, egyenes tekintet, smink nélkül"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="space-y-3 p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-foreground">Ideális példa</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Ez a típusú fotó biztosítja a legpontosabb AI elemzést és személyre szabott ajánlásokat.
                </p>
              </div>
            </GlassCard>
          </div>

          {/* Right side - Tips */}
          <div className="order-1 space-y-6 lg:order-2">
            {PHOTO_TIPS.map((tip, index) => {
              const Icon = tip.icon
              return (
                <GlassCard
                  key={index}
                  variant="subtle"
                  className="group transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-medium text-foreground">
                        {tip.title}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              )
            })}

            {/* CTA */}
            <div className="pt-4">
              <GlassCard variant="elevated" className="overflow-hidden">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                  <div className="mb-4 text-center">
                    <h3 className="mb-2 text-xl font-medium text-foreground">
                      Készen áll?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Kezdje el az AI elemzést most, és kapjon személyre szabott sminkajánlást!
                    </p>
                  </div>
                  <Button
                    asChild
                    size="lg"
                    className="h-14 w-full rounded-[16px] text-base font-medium shadow-lg"
                  >
                    <Link href="/ai-sminkajanlo">
                      Fotó Feltöltése
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
