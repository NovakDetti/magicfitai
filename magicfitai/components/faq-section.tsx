"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "Milyen fényképet érdemes megosztanom?",
    answer:
      "A legpontosabb útmutatáshoz természetes nappali fényben, szemből készült portré ideális, lehetőleg minimális sminkkel. A szűrők és erős megvilágítás kerülése segíti a pontos elemzést.",
  },
  {
    question: "Biztonságban vannak a megosztott fényképek?",
    answer:
      "Természetesen. A feltöltött képeket bizalmasan kezeljük, kizárólag az elemzéshez használjuk, harmadik féllel nem osztjuk meg, és bármikor kérheti törlésüket.",
  },
  {
    question: "Ez szakértői diagnózis?",
    answer:
      "Nem. Az útmutatás esztétikai jellegű, és nem helyettesíti kozmetikus vagy bőrgyógyász szakvéleményét. Bőrrel kapcsolatos aggályok esetén javasoljuk szakember felkeresését.",
  },
  {
    question: "Milyen termékeket ajánlotok?",
    answer:
      "Konkrét márkákat és termékeket ajánlunk, amelyek megfelelnek az Ön bőrtónusának és stílusának. Az ajánlásaink különböző árkategóriákban mozognak, hogy mindenki megtalálhassa a számára ideális terméket.",
  },
  {
    question: "Mikor kapom meg az összefoglalót?",
    answer:
      "A konzultáció befejezése után azonnal. Az összefoglaló letölthető az eredmények oldalán, és e-mailben is megkapja.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="kerdesek" className="relative overflow-hidden bg-secondary/20 px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-light tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Kérdések és
            <span className="block font-medium">válaszok</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Ami gyakran felmerül a konzultációval kapcsolatban.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="glass-card overflow-hidden rounded-[20px] border-0 transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-6 text-left transition-colors duration-300 hover:bg-white/30 dark:hover:bg-white/5 md:p-8"
              >
                <h3 className="pr-4 text-base font-medium tracking-tight text-foreground md:text-lg">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <CardContent className="px-6 pb-6 pt-0 md:px-8 md:pb-8">
                  <div className="divider-elegant mb-4" />
                  <p className="leading-relaxed text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
