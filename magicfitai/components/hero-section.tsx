import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative -mt-20 overflow-hidden bg-background px-4 pt-28 pb-20 md:pt-36 md:pb-28">
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/30 via-transparent to-transparent" />

      <div className="container relative mx-auto max-w-6xl">
        <div className="grid items-center gap-16 md:grid-cols-2">
          {/* Left side - Content */}
          <div className="fade-up relative z-10 space-y-8">
            {/* Elegant badge */}
            <div className="mb-8 flex justify-center md:justify-start">
              <div className="glass inline-flex items-center gap-3 rounded-full px-5 py-2.5 text-sm tracking-wide text-foreground/80">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Személyre szabott szépségkonzultáció</span>
              </div>
            </div>

            <h1 className="text-center text-4xl font-light tracking-tight text-foreground md:text-left md:text-5xl lg:text-6xl">
              Személyre szabott sminktanácsadás,
              <span className="block font-medium">mesterséges intelligenciával.</span>
            </h1>

            {/* Mobile image - full width with fade effect */}
            <div className="relative -mx-4 h-[420px] overflow-hidden md:hidden">
              <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-background via-transparent to-background/50" />
              <Image
                src="/natural_beauty.png"
                alt="Természetes szépség"
                fill
                className="object-cover object-top"
                priority
              />
            </div>

            <p className="text-center text-lg leading-relaxed text-muted-foreground md:text-left md:text-xl">
              Árnyalatok és technikák, amelyek összhangban vannak az arcvonásaival.
Irányadó sminktanácsadás, egyéni adottságokra építve.
            </p>

            <div className="flex flex-col items-center gap-4 pt-2 sm:flex-row md:items-start">
              <Button size="lg" className="group relative overflow-hidden px-8" asChild>
                <Link href="#elozetes-utmutatas">
                  <span className="relative z-10">Előzetes útmutatás</span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8" asChild>
                <Link href="/ai-sminkajanlo">AI konzultáció</Link>
              </Button>
            </div>

            <p className="pt-4 text-center text-sm tracking-wide text-muted-foreground/70 md:text-left">
              Esztétikai útmutatás · Nem helyettesíti a szakértői véleményt
            </p>
          </div>

          {/* Right side - Image with glass frame */}
          <div className="fade-up relative hidden md:block">
            <div className="glass relative aspect-[3/4] overflow-hidden rounded-[24px] p-3">
              <div className="relative h-full w-full overflow-hidden rounded-[18px]">
                <Image
                  src="/natural_beauty.png"
                  alt="Természetes szépség"
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
