"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProductModal } from "@/components/product-modal"

const makeupLooks = [
  {
    id: 1,
    title: "Nappali harmónia",
    description:
      "Természetes vonásait hangsúlyozó összeállítás. A melegebb tónusok finoman harmonizálnak bőrszínével, miközben megőrzik a könnyedséget.",
    image: "/natural-daytime-makeup-look.jpg",
  },
  {
    id: 2,
    title: "Visszafogott elegancia",
    description:
      "Kifinomult, visszafogott elegancia. Ez az összeállítás diszkréten kiemeli arccsontjait és hangsúlyozza szemeit, természetes méltósággal.",
    image: "/elegant-sophisticated-makeup-look.jpg",
  },
  {
    id: 3,
    title: "Esti ragyogás",
    description:
      "Határozottabb, de továbbra is harmonikus választás. A mélyebb árnyalatok karaktert adnak, anélkül, hogy elvonnák a figyelmet természetes szépségéről.",
    image: "/evening-glamorous-makeup-look.jpg",
  },
]

export function ResultsSection() {
  const [selectedLook, setSelectedLook] = useState<number | null>(null)

  return (
    <section className="relative overflow-hidden px-4 py-20 md:py-28">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/30 via-transparent to-transparent" />

      <div className="container relative mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-medium tracking-wide text-primary">
            Konzultáció eredménye
          </p>
          <h2 className="text-3xl font-light tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Az Ön személyes
            <span className="block font-medium">útmutatása</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Elemzésünk alapján három gondosan összeállított javaslatot készítettünk az Ön számára.
          </p>
        </div>

        <div className="stagger-children grid gap-6 md:grid-cols-3 md:gap-8">
          {makeupLooks.map((look) => (
            <Card
              key={look.id}
              className="glass-card group overflow-hidden rounded-[24px] border-0"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={look.image || "/placeholder.svg"}
                  alt={look.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <CardContent className="p-6 md:p-8">
                <h3 className="mb-3 text-xl font-medium tracking-tight text-foreground">
                  {look.title}
                </h3>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  {look.description}
                </p>
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-[12px] font-medium"
                  onClick={() => setSelectedLook(look.id)}
                >
                  Részletek megtekintése
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ProductModal
        isOpen={selectedLook !== null}
        onClose={() => setSelectedLook(null)}
        lookTitle={makeupLooks.find((l) => l.id === selectedLook)?.title || ""}
      />
    </section>
  )
}
