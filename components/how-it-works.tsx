"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Upload, Sparkles, FileText } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function HowItWorks() {
  const { language } = useLanguage()
  const copy = language === "hu" ? {
    titleTop: "A konzultáció",
    titleBottom: "menete",
    description:
      "Egy egyszerű, átgondolt folyamat, amely az Ön egyedi szépségére összpontosít.",
    steps: [
      {
        icon: Upload,
        number: "01",
        title: "Fénykép megosztása",
        description: "Osszon meg egy természetes fényben készült portrét.",
      },
      {
        icon: Sparkles,
        number: "02",
        title: "Személyes elemzés",
        description: "Elemezzük vonásait, bőrszínét és arcának egyedi arányait.",
      },
      {
        icon: FileText,
        number: "03",
        title: "Részletes útmutatás",
        description:
          "Három gondosan összeállított javaslatot kap, személyes magyarázattal.",
      },
    ],
  } : {
    titleTop: "How the consultation",
    titleBottom: "works",
    description:
      "A simple, thoughtful process that focuses on your unique beauty.",
    steps: [
      {
        icon: Upload,
        number: "01",
        title: "Share a photo",
        description: "Upload a portrait taken in natural light.",
      },
      {
        icon: Sparkles,
        number: "02",
        title: "Personal analysis",
        description: "We analyze your features, skin tone, and facial proportions.",
      },
      {
        icon: FileText,
        number: "03",
        title: "Detailed guidance",
        description:
          "Receive three carefully crafted looks with personalized explanations.",
      },
    ],
  }

  return (
    <section className="relative overflow-hidden bg-secondary/30 px-4 py-20 md:py-28">
      {/* Subtle decorative elements */}
      <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-light tracking-tight text-foreground md:text-4xl lg:text-5xl">
            {copy.titleTop}
            <span className="block font-medium">{copy.titleBottom}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {copy.description}
          </p>
        </div>

        <div className="stagger-children grid gap-6 md:grid-cols-3 md:gap-8">
          {copy.steps.map((step) => (
            <Card
              key={step.number}
              className="glass-card group relative overflow-hidden rounded-[24px] border-0"
            >
              <CardContent className="relative flex flex-col p-8 md:p-10">
                {/* Step number - decorative */}
                <span className="absolute right-6 top-6 text-6xl font-light text-primary/10">
                  {step.number}
                </span>

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>

                <h3 className="mb-3 text-xl font-medium tracking-tight text-foreground">
                  {step.title}
                </h3>

                <p className="leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
