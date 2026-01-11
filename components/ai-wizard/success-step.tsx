"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, RefreshCw } from "lucide-react"

interface SuccessStepProps {
  onNewUpload: () => void
}

export function SuccessStep({ onNewUpload }: SuccessStepProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <Card className="glass-card fade-up overflow-hidden rounded-[24px] border-0">
        <CardContent className="flex flex-col items-center p-12 text-center md:p-16">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>

          <h2 className="mb-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            Köszönjük bizalmát
          </h2>
          <p className="mb-10 max-w-md leading-relaxed text-muted-foreground">
            Személyre szabott útmutatása elkészült. Az összefoglaló elérhető az e-mail címén is.
          </p>

          <div className="mb-10 w-full max-w-md space-y-4 rounded-[18px] bg-secondary/40 p-6">
            <p className="text-sm font-medium tracking-wide text-foreground">Az útmutatás tartalma</p>
            <ul className="space-y-3 text-left text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>Három személyre szabott smink javaslat</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>Részletes lépésről lépésre útmutató</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>Színpaletta és árnyalat ajánlások</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="h-12 gap-2 rounded-[12px] px-6 font-medium">
              <Download className="h-4 w-4" />
              Összefoglaló letöltése
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 gap-2 rounded-[12px] px-6 font-medium"
              onClick={onNewUpload}
            >
              <RefreshCw className="h-4 w-4" />
              Új konzultáció
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
