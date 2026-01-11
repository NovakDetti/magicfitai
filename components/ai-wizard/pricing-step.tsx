"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface PricingStepProps {
  selectedPlan: string | null
  onSelectPlan: (plan: string) => void
  onPurchase: () => void
  onBack: () => void
}

export function PricingStep({ selectedPlan, onSelectPlan, onPurchase, onBack }: PricingStepProps) {
  const plans = [
    {
      id: "single",
      name: "1 kredit",
      price: "450 Ft",
      description: "Egy teljes elemzés",
      features: ["1 elemzés", "3 személyre szabott look", "PDF összefoglaló"],
    },
    {
      id: "pack5",
      name: "5 kredit",
      price: "2 025 Ft",
      popular: true,
      description: "Rugalmas több alkalomra",
      features: [
        "5 elemzés",
        "Részletes magyarázat",
        "Letölthető összefoglaló",
      ],
    },
    {
      id: "pack10",
      name: "10 kredit",
      price: "4 000 Ft",
      description: "Legjobb ár/érték",
      features: [
        "10 elemzés",
        "Korlátlan elérés",
        "Prioritás támogatás",
      ],
    },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="text-center">
        <h2 className="mb-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          Válassza ki a krediteket
        </h2>
        <p className="text-muted-foreground">Egyszeri szolgáltatás, további kötelezettség nélkül</p>
      </div>

      <div className="stagger-children grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`glass-card cursor-pointer overflow-hidden rounded-[24px] border-0 transition-all duration-300 ${
              selectedPlan === plan.id ? "ring-2 ring-primary" : ""
            } ${plan.popular ? "ring-1 ring-primary/30" : ""}`}
            onClick={() => onSelectPlan(plan.id)}
          >
            <CardContent className="flex h-full flex-col p-6 md:p-8">
              {plan.popular && (
                <div className="mb-4">
                  <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium tracking-wide text-primary">
                    Leggyakrabban választott
                  </span>
                </div>
              )}
              <div className="mb-4">
                <h3 className="mb-1 text-xl font-medium tracking-tight text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <p className="mb-6 text-3xl font-light tracking-tight text-foreground">{plan.price}</p>
              <ul className="flex-1 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          className="h-12 rounded-[12px] px-8 font-medium"
        >
          Vissza
        </Button>
        <Button
          size="lg"
          onClick={onPurchase}
          disabled={!selectedPlan}
          className="h-12 rounded-[12px] px-8 font-medium"
        >
          Folytatás
        </Button>
      </div>
    </div>
  )
}
