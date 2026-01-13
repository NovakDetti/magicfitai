"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function FAQSection() {
  const { language } = useLanguage()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const copy = language === "hu" ? {
    titleTop: "Kérdések és",
    titleBottom: "válaszok",
    description: "Ami gyakran felmerül a konzultációval kapcsolatban.",
    faqs: [
      {
        question: "Milyen fényképet érdemes megosztanom?",
        answer:
          "A legpontosabb útmutatáshoz természetes nappali fényben, szemből készült portré ideális, lehetőleg minimális sminkkel. A szűrők és erős megvilágítás kerülése segíti a pontos elemzést.",
      },
      {
        question: "Biztonságban vannak a megosztott fényképek?",
        answer:
          "Igen. A feltöltött képeket bizalmasan kezeljük, kizárólag az elemzéshez használjuk, harmadik féllel nem osztjuk meg, és bármikor kérheti törlésüket.",
      },
      {
        question: "Ez szakértői diagnózis?",
        answer:
          "Nem. Az útmutatás esztétikai jellegű, és nem helyettesíti kozmetikus vagy bőrgyógyász szakvéleményét. Bőrrel kapcsolatos aggályok esetén javasoljuk szakember felkeresését.",
      },
      {
        question: "Milyen termékeket ajánlotok?",
        answer:
          "Konkrét márkákat és termékeket ajánlunk, amelyek megfelelnek az Ön bőrtónusának és stílusának. Az ajánlások több árkategóriát lefednek, hogy mindenki találjon megfelelőt.",
      },
      {
        question: "Mikor kapom meg az eredményeket?",
        answer:
          "A konzultáció befejezése után azonnal. Az eredményeket az Eredményeim oldalon találja, és ha van fiókja, ott meg is maradnak.",
      },
    ],
  } : {
    titleTop: "Questions and",
    titleBottom: "answers",
    description: "Common questions about the consultation.",
    faqs: [
      {
        question: "What kind of photo should I upload?",
        answer:
          "For the most accurate guidance, upload a front-facing portrait in natural daylight with minimal makeup. Avoid filters and harsh lighting.",
      },
      {
        question: "Are my photos safe?",
        answer:
          "Yes. Uploaded photos are handled confidentially, used only for analysis, never shared with third parties, and can be deleted on request.",
      },
      {
        question: "Is this a professional diagnosis?",
        answer:
          "No. The guidance is aesthetic in nature and does not replace professional advice from a cosmetologist or dermatologist.",
      },
      {
        question: "What products do you recommend?",
        answer:
          "We recommend specific brands and products that fit your skin tone and style, across different price ranges so you can find the right fit.",
      },
      {
        question: "When do I get the results?",
        answer:
          "Right after the consultation finishes. You can view them on the My Results page, and they stay available if you have an account.",
      },
    ],
  }

  return (
    <section id="kerdesek" className="relative overflow-hidden bg-secondary/20 px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-light tracking-tight text-foreground md:text-4xl lg:text-5xl">
            {copy.titleTop}
            <span className="block font-medium">{copy.titleBottom}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {copy.description}
          </p>
        </div>

        <div className="space-y-4">
          {copy.faqs.map((faq, index) => (
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
