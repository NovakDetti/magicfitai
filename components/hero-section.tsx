"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider"

export function HeroSection() {
  const { language } = useLanguage()
  const copy = language === "hu" ? {
    badgeMobile: "AI sminktanácsadás",
    badgeDesktop: "Személyre szabott szépségkonzultáció",
    titleDesktop: "Személyre szabott sminktanácsadás,",
    titleMobile: "Személyre szabott sminktanácsadás",
    subtitleDesktop: "mesterséges intelligenciával.",
    subtitleMobile: "AI segítségével.",
    bodyMobile:
      "Ajánlott árnyalatok és technikák az arcvonásaihoz igazítva. 3 személyre szabott look, lépésről lépésre.",
    bodyDesktop:
      "Árnyalatok és technikák, amelyek összhangban vannak az arcvonásaival.\nIrányadó sminktanácsadás, egyéni adottságokra építve.",
    ctaMobile: "AI konzultáció indítása",
    ctaDesktop: "AI konzultáció",
    guide: "Előzetes útmutatás",
    mobileGuide: "Hogyan készítsen jó fotót?",
    microLooks: "3 look",
    microPreview: "Vizuális előnézet",
    microTime: "1–2 perc",
    disclaimer: "Esztétikai útmutatás · Nem helyettesíti a szakértői véleményt",
    imageAlt: "Természetes szépség",
  } : {
    badgeMobile: "AI makeup consultation",
    badgeDesktop: "Personalized beauty consultation",
    titleDesktop: "Personalized makeup guidance,",
    titleMobile: "Personalized makeup guidance",
    subtitleDesktop: "powered by AI.",
    subtitleMobile: "with AI support.",
    bodyMobile:
      "Suggested shades and techniques tailored to your features. 3 personalized looks, step by step.",
    bodyDesktop:
      "Shades and techniques aligned with your facial features.\nPractical makeup guidance built around your unique traits.",
    ctaMobile: "Start AI consultation",
    ctaDesktop: "AI Consultation",
    guide: "Photo prep guide",
    mobileGuide: "How to take a good photo",
    microLooks: "3 looks",
    microPreview: "Visual preview",
    microTime: "1–2 minutes",
    disclaimer: "Aesthetic guidance · Not a substitute for professional advice",
    imageAlt: "Natural beauty",
  }

  return (
    <section className="relative -mt-20 overflow-hidden bg-background px-4 pt-24 pb-12 md:pt-32 md:pb-20 lg:pt-36 lg:pb-28">
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/30 via-transparent to-transparent" />

      <div className="container relative mx-auto max-w-6xl">
        <div className="grid items-center gap-8 md:gap-12 lg:gap-16 md:grid-cols-2">
          {/* Left side - Content */}
          <div className="fade-up relative z-10 space-y-6 md:space-y-8">
            {/* Elegant badge */}
            <div className="mt-4 mb-2 flex justify-center md:mb-8 md:justify-start">
              <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs tracking-wide text-foreground/70 md:gap-3 md:px-5 md:py-2.5 md:text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="md:hidden">{copy.badgeMobile}</span>
                <span className="hidden md:inline">{copy.badgeDesktop}</span>
              </div>
            </div>

            <h1 className="relative z-20 mb-3 text-center text-3xl font-light leading-tight tracking-tight text-foreground md:mb-0 md:text-left md:text-4xl md:leading-normal lg:text-5xl xl:text-6xl -mx-2 md:mx-0">
              <span className="hidden md:inline">{copy.titleDesktop}</span>
              <span className="block md:hidden">{copy.titleMobile}</span>
              <span className="block font-medium">
                <span className="hidden md:inline">{copy.subtitleDesktop}</span>
                <span className="block md:hidden">{copy.subtitleMobile}</span>
              </span>
            </h1>

            <p className="relative z-20 text-center text-sm leading-relaxed text-muted-foreground md:text-left md:text-lg md:leading-relaxed lg:text-xl">
              <span className="md:hidden">{copy.bodyMobile}</span>
              <span className="hidden md:inline whitespace-pre-line">{copy.bodyDesktop}</span>
            </p>

            {/* Mobile image - positioned to extend below title/subtitle */}
            <div className="glass relative -mt-4 mx-auto max-h-[55vh] w-[85%] max-w-sm overflow-hidden rounded-[20px] p-2 shadow-xl md:hidden">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[16px]">
                <Image
                  src="/natural_beauty.png"
                  alt={copy.imageAlt}
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 pt-2 md:flex-row md:gap-4 md:items-start">
              <Button size="lg" className="group relative w-full overflow-hidden px-8 md:w-auto" asChild>
                <Link href="/ai-sminkajanlo">
                  <span className="relative z-10">
                    <span className="md:hidden">{copy.ctaMobile}</span>
                    <span className="hidden md:inline">{copy.ctaDesktop}</span>
                  </span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="hidden px-8 sm:inline-flex" asChild>
                <Link href="#photo-tips">
                  <span className="relative z-10">{copy.guide}</span>
                </Link>
              </Button>
              <Link
                href="#photo-tips"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline md:hidden"
              >
                {copy.mobileGuide}
              </Link>
            </div>

            {/* Mobile micro-features */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/80 md:hidden">
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-primary/60" />
                {copy.microLooks}
              </span>
              <span className="h-3 w-px bg-border" />
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-primary/60" />
                {copy.microPreview}
              </span>
              <span className="h-3 w-px bg-border" />
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-primary/60" />
                {copy.microTime}
              </span>
            </div>

            <p className="pt-2 text-center text-xs tracking-wide text-muted-foreground/70 md:text-left md:text-sm md:pt-4">
              {copy.disclaimer}
            </p>
          </div>

          {/* Right side - Image with glass frame */}
          <div className="fade-up relative hidden md:block">
            <div className="glass relative aspect-[3/4] overflow-hidden rounded-[24px] p-3">
              <div className="relative h-full w-full overflow-hidden rounded-[18px]">
                <Image
                  src="/natural_beauty.png"
                  alt={copy.imageAlt}
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>
            {/* Decorative glow */}
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          </div>
        </div>
      </div>

      {/* Subtle decorative elements */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-secondary blur-3xl" />
    </section>
  )
}
