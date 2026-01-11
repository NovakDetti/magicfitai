"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"

interface ResultsStepProps {
  onContinue: () => void
}

export function ResultsStep({ onContinue }: ResultsStepProps) {
  const looks = [
    {
      name: "Nappali harmónia",
      description: "Természetes, ragyogó megjelenés hétköznapokra",
      locked: false,
    },
    {
      name: "Visszafogott elegancia",
      description: "Kifinomult, elegáns megjelenés különleges alkalmakra",
      locked: true,
    },
    {
      name: "Esti ragyogás",
      description: "Határozottabb, karakteres megjelenés estékre",
      locked: true,
    },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-sm font-medium tracking-wide text-primary">Elemzés kész</span>
        </div>
        <h2 className="mb-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          Az Ön személyes javaslatai
        </h2>
        <p className="text-muted-foreground">
          Elemzésünk alapján három összeállítást készítettünk az Ön számára
        </p>
      </div>

      <div className="stagger-children grid gap-6 md:grid-cols-3">
        {looks.map((look, index) => (
          <Card
            key={index}
            className={`glass-card overflow-hidden rounded-[24px] border-0 ${look.locked ? "opacity-80" : ""}`}
          >
            <CardContent className="p-6 md:p-8">
              <div className="mb-5 aspect-square overflow-hidden rounded-[16px] bg-secondary/40">
                {look.locked && (
                  <div className="flex h-full items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background/60">
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
              <h3 className="mb-2 text-lg font-medium tracking-tight text-foreground">{look.name}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{look.description}</p>
              {look.locked && (
                <p className="mt-3 text-xs font-medium tracking-wide text-primary">
                  Teljes útmutatással elérhető
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          size="lg"
          onClick={onContinue}
          className="h-12 rounded-[12px] px-8 font-medium"
        >
          Összes javaslat megtekintése
        </Button>
      </div>
    </div>
  )
}
