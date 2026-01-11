"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Info } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface UploadStepProps {
  onNext: (image: string) => void
}

export function UploadStep({ onNext }: UploadStepProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNext = () => {
    if (preview && accepted) {
      onNext(preview)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="glass-card fade-up overflow-hidden rounded-[24px] border-0">
        <CardContent className="p-8 md:p-10">
          {!preview ? (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-border/60 bg-secondary/30 p-12 transition-all duration-300 hover:border-primary/40 hover:bg-secondary/50">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <p className="mb-2 text-lg font-medium tracking-tight text-foreground">Válasszon fényképet</p>
              <p className="text-sm text-muted-foreground">vagy húzza ide a fájlt</p>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          ) : (
            <div className="space-y-5">
              <div className="relative overflow-hidden rounded-[18px]">
                <img src={preview || "/placeholder.svg"} alt="Feltöltött fénykép" className="h-auto w-full" />
              </div>
              <Button
                variant="outline"
                onClick={() => setPreview(null)}
                className="h-12 w-full rounded-[12px] font-medium"
              >
                Másik fénykép választása
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass fade-up overflow-hidden rounded-[20px]">
        <CardContent className="p-6 md:p-8">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium tracking-wide text-foreground">A legpontosabb útmutatáshoz</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                  <span>Természetes nappali fény, lehetőleg ablak mellett</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                  <span>Szemből készült portré</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                  <span>Szűrők és erős utómunka nélkül</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {preview && (
        <Card className="glass fade-up overflow-hidden rounded-[20px]">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-3">
              <Checkbox
                id="accept"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
                className="mt-0.5"
              />
              <label htmlFor="accept" className="cursor-pointer text-sm leading-relaxed text-muted-foreground">
                Megértettem, hogy az útmutatás esztétikai jellegű, és nem helyettesíti szakértői véleményt.
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!preview || !accepted}
          className="h-12 rounded-[12px] px-8 font-medium"
        >
          Tovább
        </Button>
      </div>
    </div>
  )
}
