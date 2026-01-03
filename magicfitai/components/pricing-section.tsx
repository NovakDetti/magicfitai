import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const pricingTiers = [
  {
    title: "1 kredit",
    price: "450",
    features: ["1 elemzés", "3 személyre szabott look", "PDF összefoglaló"],
    cta: "Kérem",
    popular: false,
  },
  {
    title: "5 kredit",
    price: "2 025",
    features: ["5 elemzés", "Részletes magyarázat", "Letölthető PDF"],
    cta: "Ezt választom",
    popular: true,
  },
  {
    title: "10 kredit",
    price: "4 000",
    features: ["10 elemzés", "Legjobb érték", "Korlátlan elérés"],
    cta: "Kérem",
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="regisztracio" className="bg-secondary/40 px-4 py-12 md:py-16">
      <div className="container mx-auto max-w-6xl">
        <h2 className="mb-4 text-center text-3xl font-bold text-foreground md:text-4xl">Árazás</h2>
        <p className="mb-12 text-center text-muted-foreground">Válaszd ki a Neked megfelelő csomagot</p>

        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {pricingTiers.map((tier, index) => (
            <Card
              key={index}
              className={`relative fade-up transition-all duration-[160ms] ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-1 ${
                tier.popular ? "ring-2 ring-primary/60" : ""
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                    Legnépszerűbb
                  </span>
                </div>
              )}

              <CardContent className="p-6 text-center md:p-8">
                <h3 className="mb-2 text-xl font-bold text-foreground">{tier.title}</h3>

                <div className="mb-6 mt-4">
                  <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                  <span className="ml-2 text-lg text-muted-foreground">Ft</span>
                </div>

                <div className="mb-6 space-y-3">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-left">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <p className="text-sm text-foreground">{feature}</p>
                    </div>
                  ))}
                </div>

                <Button size="lg" variant={tier.popular ? "default" : "outline"} className="w-full">
                  {tier.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">Egyszeri fizetés. Nincs előfizetés.</p>
      </div>
    </section>
  )
}
