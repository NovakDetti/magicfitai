import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "📦 1 kredit",
    price: "450 Ft",
    description: "Egyszeri konzultáció",
    features: [
      "1 teljes AI sminkelemzés",
      "3 személyre szabott sminklook",
      "Részletes leírás és vizuális eredmény",
      "Letölthető összefoglaló",
    ],
  },
  {
    name: "⭐ 5 kredit",
    price: "2 025 Ft",
    pricePerUnit: "(405 Ft / kredit)",
    badge: "Leggyakrabban választott",
    popular: true,
    description: "Több alkalomra, kedvezőbb áron",
    features: [
      "5 teljes AI sminkelemzés",
      "Ugyanaz a tartalom, mint az egyszeri konzultációnál",
      "Rugalmas felhasználás, amikor szükséges",
    ],
  },
  {
    name: "💎 10 kredit",
    price: "3 825 Ft",
    pricePerUnit: "(382,50 Ft / kredit)",
    description: "Legjobb ár / elemzés",
    features: [
      "10 teljes AI sminkelemzés",
      "Azonos szolgáltatás, még kedvezőbb egységáron",
      "Ideális rendszeres használatra",
    ],
  },
]

export function PricingPreview() {
  return (
    <section id="szolgaltatasok" className="relative overflow-hidden px-4 py-20 md:py-28">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />

      <div className="container relative mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-light tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Konzultációs
            <span className="block font-medium">lehetőségek</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Ugyanaz a szolgáltatás, kedvezőbb egységár több kredit vásárlásakor.
          </p>
        </div>

        <div className="stagger-children grid gap-6 md:grid-cols-3 md:gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`glass-card relative overflow-hidden rounded-[24px] border-0 ${
                plan.popular ? "ring-1 ring-primary/30" : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute right-6 top-6">
                  <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium tracking-wide text-primary">
                    {plan.badge}
                  </span>
                </div>
              )}
              <CardContent className="flex h-full flex-col p-8 md:p-10">
                <div className="mb-6">
                  <h3 className="mb-2 text-xl font-medium tracking-tight text-foreground">
                    {plan.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex flex-col">
                    <span className="text-4xl font-light tracking-tight text-foreground">
                      {plan.price}
                    </span>
                    {plan.pricePerUnit && (
                      <span className="mt-1 text-sm text-muted-foreground">
                        {plan.pricePerUnit}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="mb-8 flex-1 space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`h-12 w-full rounded-[12px] font-medium ${
                    plan.popular ? "" : "bg-foreground/5 text-foreground hover:bg-foreground/10"
                  }`}
                  variant={plan.popular ? "default" : "ghost"}
                  asChild
                >
                  <Link href="/ai-sminkajanlo">
                    {plan.popular ? "Ezt választom" : "Konzultáció kérése"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust-building note */}
        <div className="mt-12 text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Minden konzultáció ugyanazt a részletes elemzést és sminkajánlást tartalmazza – a különbség kizárólag az egységárban van.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="#kerdesek">Gyakori kérdések</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
