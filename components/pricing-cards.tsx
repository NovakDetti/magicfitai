"use client"

import { useState } from "react"
import { Check, Sparkles, Zap, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"

interface PricingPlan {
  id: "single" | "pack5" | "pack10"
  name: string
  price: number
  credits: number
  description: string
  features: string[]
  popular?: boolean
  icon: React.ReactNode
}

const plans: PricingPlan[] = [
  {
    id: "single",
    name: "Egyszeri elemzés",
    price: 450,
    credits: 1,
    description: "Próbáld ki egyszer",
    features: [
      "1 teljes AI elemzés",
      "3 személyre szabott look",
      "PDF letöltés",
      "7 napig elérhető",
    ],
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: "pack5",
    name: "5 kredites csomag",
    price: 2025,
    credits: 5,
    description: "10% megtakarítás",
    features: [
      "5 teljes AI elemzés",
      "Különböző alkalmakra",
      "Korlátlan elérés",
      "Fiókba mentés",
    ],
    popular: true,
    icon: <Zap className="h-5 w-5" />,
  },
  {
    id: "pack10",
    name: "10 kredites csomag",
    price: 4000,
    credits: 10,
    description: "11% megtakarítás",
    features: [
      "10 teljes AI elemzés",
      "Legjobb érték",
      "Korlátlan elérés",
      "Prioritás támogatás",
    ],
    icon: <Crown className="h-5 w-5" />,
  },
]

interface PricingCardsProps {
  onSelect: (planId: "single" | "pack5" | "pack10") => void
  isLoading?: boolean
  selectedPlan?: string
  showSingleOnly?: boolean
  className?: string
}

export function PricingCards({
  onSelect,
  isLoading,
  selectedPlan,
  showSingleOnly,
  className,
}: PricingCardsProps) {
  const displayPlans = showSingleOnly
    ? plans.filter((p) => p.id === "single")
    : plans

  return (
    <div
      className={cn(
        "grid gap-4",
        showSingleOnly ? "grid-cols-1 max-w-sm mx-auto" : "md:grid-cols-3",
        className
      )}
    >
      {displayPlans.map((plan) => (
        <GlassCard
          key={plan.id}
          variant={plan.popular ? "elevated" : "default"}
          className={cn(
            "relative flex flex-col",
            plan.popular && "ring-2 ring-primary",
            selectedPlan === plan.id && "ring-2 ring-primary"
          )}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Legnépszerűbb
              </span>
            </div>
          )}

          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              {plan.icon}
            </div>
            <div>
              <h3 className="font-medium text-foreground">{plan.name}</h3>
              <p className="text-xs text-muted-foreground">{plan.description}</p>
            </div>
          </div>

          <div className="mb-4">
            <span className="text-3xl font-bold text-foreground">
              {plan.price.toLocaleString("hu-HU")}
            </span>
            <span className="ml-1 text-muted-foreground">Ft</span>
          </div>

          <ul className="mb-6 flex-1 space-y-2">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            onClick={() => onSelect(plan.id)}
            disabled={isLoading}
            variant={plan.popular ? "default" : "outline"}
            className={cn(
              "w-full",
              plan.popular &&
                "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isLoading && selectedPlan === plan.id ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Folyamatban...
              </span>
            ) : (
              "Kiválasztom"
            )}
          </Button>
        </GlassCard>
      ))}
    </div>
  )
}
