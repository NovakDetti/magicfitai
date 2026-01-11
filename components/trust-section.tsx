import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Heart, Shield } from "lucide-react"

const trustItems = [
  {
    icon: Heart,
    title: "Természetes harmónia",
    description: "Javaslataink az Ön saját vonásait emelik ki, nem változtatják meg azokat.",
  },
  {
    icon: Sparkles,
    title: "Független szemlélet",
    description: "Színeket és textúrákat ajánlunk, nem konkrét márkákat. A választás szabadsága az Öné.",
  },
  {
    icon: Shield,
    title: "Diszkréció és biztonság",
    description: "Megosztott fényképeit bizalmasan kezeljük és harmadik féllel nem osztjuk meg.",
  },
]

export function TrustSection() {
  return (
    <section className="relative overflow-hidden px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-light tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Miben
            <span className="block font-medium">hiszünk</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Értékeink a természetes szépség és az egyéni karakter tiszteletében gyökereznek.
          </p>
        </div>

        <div className="stagger-children grid gap-6 md:grid-cols-3 md:gap-8">
          {trustItems.map((item, index) => (
            <Card key={index} className="glass-card overflow-hidden rounded-[24px] border-0">
              <CardContent className="flex flex-col p-8 md:p-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-medium tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Elegant disclaimer */}
        <div className="mt-16 flex justify-center">
          <div className="glass inline-flex max-w-2xl items-center gap-4 rounded-[16px] px-8 py-5">
            <div className="h-8 w-px bg-primary/20" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Az útmutatás esztétikai jellegű, és nem helyettesíti szakember véleményét.
              Az ajánlások inspirációként szolgálnak.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
